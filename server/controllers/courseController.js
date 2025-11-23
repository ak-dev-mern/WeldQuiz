import Course from "../models/Course.js";
import User from "../models/User.js";
import ExamResult from "../models/ExamResult.js";
import {
  sendCourseEnrollmentEmail,
  sendExamResultEmail,
} from "../services/emailService.js";

export const createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user._id,
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating course",
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const courses = await Course.find(filter)
      .populate("instructor", "username profile")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
    });
  }
};

export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "username profile")
      .populate("ratings.user", "username profile");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled (for protected content)
    const isEnrolled = req.user
      ? await User.exists({
          _id: req.user._id,
          "coursesEnrolled.course": course._id,
        })
      : false;

    const courseData = course.toObject();

    if (!isEnrolled && req.user?.role !== "admin") {
      // Remove protected content for non-enrolled users
      courseData.units = courseData.units.map((unit) => ({
        ...unit,
        lessons: unit.lessons.filter((lesson) => lesson.isFree),
        questions: [], // Hide questions for non-enrolled
      }));
    }

    res.json({
      success: true,
      course: courseData,
      isEnrolled: !!isEnrolled,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is instructor or admin
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only instructor or admin can update course.",
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating course",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Soft delete
    course.isActive = false;
    await course.save();

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting course",
    });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const user = await User.findById(userId);

    // Check if already enrolled
    const alreadyEnrolled = user.coursesEnrolled.some(
      (enrollment) => enrollment.course.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Add to enrolled courses
    user.coursesEnrolled.push({
      course: courseId,
      enrolledAt: new Date(),
    });

    // Update course student count
    course.totalStudents += 1;

    await Promise.all([user.save(), course.save()]);

    // Send enrollment email (async)
    sendCourseEnrollmentEmail(user, course).catch((error) => {
      console.error("Failed to send enrollment email:", error);
    });

    res.json({
      success: true,
      message: "Successfully enrolled in course",
    });
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({
      success: false,
      message: "Error enrolling in course",
    });
  }
};

export const getDemoQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get 10 random questions from all units for demo
    const allQuestions = course.units.flatMap((unit) =>
      unit.questions.map((question) => ({
        ...question.toObject(),
        unitId: unit._id,
        correctAnswer: undefined, // Hide correct answers for demo
      }))
    );

    // Shuffle and take 10 questions
    const demoQuestions = allQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    res.json({
      success: true,
      questions: demoQuestions,
      totalQuestions: demoQuestions.length,
    });
  } catch (error) {
    console.error("Get demo questions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching demo questions",
    });
  }
};

export const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const user = await User.findById(req.user._id);
    const isEnrolled = user.coursesEnrolled.some(
      (enrollment) => enrollment.course.toString() === courseId
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to rate this course",
      });
    }

    // Remove existing rating by this user
    course.ratings = course.ratings.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    // Add new rating
    course.ratings.push({
      user: req.user._id,
      rating,
      review,
    });

    await course.save();

    res.json({
      success: true,
      message: "Course rated successfully",
    });
  } catch (error) {
    console.error("Rate course error:", error);
    res.status(500).json({
      success: false,
      message: "Error rating course",
    });
  }
};
