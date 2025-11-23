import ExamResult from "../models/ExamResult.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

export const startExam = async (req, res) => {
  try {
    const { courseId, unitId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    // Check if user is enrolled (for paid exams)
    const user = await User.findById(userId);
    const isEnrolled = user.coursesEnrolled.some(
      (enrollment) => enrollment.course.toString() === courseId
    );

    if (!isEnrolled && !req.query.demo) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to take this exam",
      });
    }

    const questions = unit.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      questionType: q.questionType,
      marks: q.marks,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
      image: q.image,
    }));

    // Create exam session
    const examSession = {
      user: userId,
      course: courseId,
      unit: unitId,
      questions: questions.map((q) => ({ question: q._id })),
      startedAt: new Date(),
      isDemo: !!req.query.demo,
    };

    res.json({
      success: true,
      questions,
      examSession,
      timeLimit: unit.questions.reduce((total, q) => total + q.timeLimit, 0),
    });
  } catch (error) {
    console.error("Start exam error:", error);
    res.status(500).json({
      success: false,
      message: "Error starting exam",
    });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { courseId, unitId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    // Calculate results
    let score = 0;
    let totalMarks = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = unit.questions.id(answer.questionId);
      if (!question) continue;

      totalMarks += question.marks;
      const isCorrect =
        JSON.stringify(answer.selectedAnswer) ===
        JSON.stringify(question.correctAnswer);

      if (isCorrect) {
        score += question.marks;
      }

      detailedAnswers.push({
        question: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
        questionSnapshot: {
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          marks: question.marks,
          difficulty: question.difficulty,
        },
      });
    }

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passingPercentage = 70; // Could be configurable per course/unit
    const passed = percentage >= passingPercentage;

    // Save exam result (only for non-demo exams)
    let examResult;
    if (!req.body.isDemo) {
      examResult = new ExamResult({
        user: userId,
        course: courseId,
        unit: unitId,
        answers: detailedAnswers,
        score,
        totalMarks,
        percentage,
        timeSpent,
        timeLimit: unit.questions.reduce((total, q) => total + q.timeLimit, 0),
        passed,
        passingPercentage,
        startedAt: new Date(Date.now() - timeSpent * 1000),
        completedAt: new Date(),
        ipAddress: req.ip,
        deviceInfo: req.headers["user-agent"],
      });

      await examResult.save();

      // Update user progress if passed
      if (passed) {
        await User.updateOne(
          {
            _id: userId,
            "coursesEnrolled.course": courseId,
          },
          {
            $set: {
              "coursesEnrolled.$.lastAccessed": new Date(),
              "coursesEnrolled.$.progress": Math.min(
                100,
                (unit.order / course.units.length) * 100
              ),
            },
          }
        );
      }
    }

    res.json({
      success: true,
      result: {
        score,
        totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        passingPercentage,
        timeSpent,
        correctAnswers: detailedAnswers.filter((a) => a.isCorrect).length,
        totalQuestions: detailedAnswers.length,
        detailedAnswers: detailedAnswers.map((a) => ({
          question: a.questionSnapshot.question,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: a.questionSnapshot.correctAnswer,
          isCorrect: a.isCorrect,
          explanation: a.questionSnapshot.explanation,
        })),
      },
      examResultId: examResult?._id,
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting exam",
    });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, courseId } = req.query;

    const filter = { user: req.user._id };
    if (courseId) filter.course = courseId;

    const results = await ExamResult.find(filter)
      .populate("course", "title image")
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ExamResult.countDocuments(filter);

    res.json({
      success: true,
      results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get exam results error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam results",
    });
  }
};

export const getExamAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Overall statistics
    const totalExams = await ExamResult.countDocuments({ user: userId });
    const passedExams = await ExamResult.countDocuments({
      user: userId,
      passed: true,
    });
    const averageScore = await ExamResult.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avgScore: { $avg: "$percentage" } } },
    ]);

    // Course-wise performance
    const coursePerformance = await ExamResult.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$course",
          totalExams: { $sum: 1 },
          passedExams: { $sum: { $cond: ["$passed", 1, 0] } },
          averageScore: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
          lastAttempt: { $max: "$completedAt" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $project: {
          courseId: "$_id",
          courseTitle: "$course.title",
          courseImage: "$course.image",
          totalExams: 1,
          passedExams: 1,
          averageScore: { $round: ["$averageScore", 2] },
          bestScore: { $round: ["$bestScore", 2] },
          lastAttempt: 1,
          successRate: {
            $round: [
              {
                $multiply: [{ $divide: ["$passedExams", "$totalExams"] }, 100],
              },
              2,
            ],
          },
        },
      },
    ]);

    // Difficulty analysis
    const difficultyAnalysis = await ExamResult.aggregate([
      { $match: { user: userId } },
      { $unwind: "$answers" },
      {
        $group: {
          _id: "$answers.questionSnapshot.difficulty",
          totalQuestions: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
        },
      },
      {
        $project: {
          difficulty: "$_id",
          totalQuestions: 1,
          correctAnswers: 1,
          accuracy: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$correctAnswers", "$totalQuestions"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      analytics: {
        overall: {
          totalExams,
          passedExams,
          failedExams: totalExams - passedExams,
          successRate: totalExams > 0 ? (passedExams / totalExams) * 100 : 0,
          averageScore: averageScore[0]?.avgScore || 0,
        },
        coursePerformance,
        difficultyAnalysis,
      },
    });
  } catch (error) {
    console.error("Get exam analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam analytics",
    });
  }
};
