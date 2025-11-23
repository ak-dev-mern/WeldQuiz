import Activity from "../models/Activity.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

// Points system configuration
const POINTS_SYSTEM = {
  exam_started: 5,
  exam_completed: 10,
  exam_passed: 50,
  exam_failed: 10,
  course_enrolled: 20,
  course_completed: 100,
  lesson_completed: 5,
  feedback_submitted: 15,
  discussion_created: 10,
  discussion_replied: 5,
  profile_updated: 5,
  certificate_earned: 25,
  daily_login: 5,
  streak_bonus: (streak) => Math.min(streak * 2, 50), // Max 50 points for streak
};

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_EXAM: {
    name: "First Steps",
    description: "Complete your first exam",
    icon: "🎯",
    points: 25,
    category: "learning",
  },
  EXAM_MASTER: {
    name: "Exam Master",
    description: "Complete 10 exams",
    icon: "🏆",
    points: 100,
    category: "mastery",
  },
  PERFECT_SCORE: {
    name: "Perfect Score",
    description: "Get 100% on an exam",
    icon: "⭐",
    points: 50,
    category: "mastery",
  },
  FEEDBACK_GIVER: {
    name: "Helpful Learner",
    description: "Submit 5 feedback reviews",
    icon: "💬",
    points: 30,
    category: "social",
  },
  STREAK_7: {
    name: "Weekly Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    points: 50,
    category: "streak",
  },
  COURSE_COMPLETER: {
    name: "Course Completer",
    description: "Complete your first course",
    icon: "🎓",
    points: 75,
    category: "completion",
  },
};

export const getUserActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 20,
      type,
      courseId,
      startDate,
      endDate,
    } = req.query;

    const filter = { user: userId };

    if (type) filter.type = type;
    if (courseId) filter.course = courseId;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const activities = await Activity.find(filter)
      .populate("course", "title image")
      .populate("exam", "score totalMarks percentage")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(filter);

    res.json({
      success: true,
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get user activities error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activities",
    });
  }
};

export const getActivitySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const summary = await Activity.getUserActivitySummary(
      userId,
      parseInt(days)
    );

    // Get total points
    const totalPoints = await Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$points" },
        },
      },
    ]);

    // Get daily activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          points: { $sum: "$points" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      summary: {
        activityTypes: summary,
        totalPoints: totalPoints[0]?.totalPoints || 0,
        dailyActivity,
      },
    });
  } catch (error) {
    console.error("Get activity summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity summary",
    });
  }
};

export const getCourseActivities = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const filter = { course: courseId };
    if (type) filter.type = type;

    const activities = await Activity.find(filter)
      .populate("user", "username profile")
      .populate("exam", "score totalMarks percentage")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(filter);

    // Get course engagement statistics
    const engagementStats = await Activity.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" },
        },
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          uniqueUsersCount: { $size: "$uniqueUsers" },
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      activities,
      engagementStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get course activities error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course activities",
    });
  }
};

export const createActivity = async (req, res) => {
  try {
    const {
      type,
      courseId,
      examId,
      discussionId,
      feedbackId,
      metadata,
      description,
      points,
    } = req.body;
    const userId = req.user._id;

    // Calculate points if not provided
    let activityPoints = points || POINTS_SYSTEM[type] || 0;

    // Get user to update streak and check achievements
    const user = await User.findById(userId);

    // Update streak and add bonus points for daily login
    if (type === "daily_login") {
      const streak = user.updateStreak();
      activityPoints += POINTS_SYSTEM.streak_bonus(streak);
    }

    const activityData = {
      user: userId,
      type,
      description: description || generateActivityDescription(type, metadata),
      points: activityPoints,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };

    if (courseId) activityData.course = courseId;
    if (examId) activityData.exam = examId;
    if (discussionId) activityData.discussion = discussionId;
    if (feedbackId) activityData.feedback = feedbackId;
    if (metadata) activityData.metadata = metadata;

    const activity = new Activity(activityData);
    await activity.save();

    // Update user points and stats
    const levelUp = user.addPoints(activityPoints, type);
    user.updateLearningStats(getStatsUpdate(type, metadata));

    // Check for achievements
    const newAchievements = await checkAchievements(user, type, metadata);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Activity recorded successfully",
      activity,
      levelUp: levelUp.leveledUp ? { newLevel: levelUp.newLevel } : null,
      newAchievements,
    });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({
      success: false,
      message: "Error recording activity",
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { period = "all", limit = 10, type = "points" } = req.query;

    let dateFilter = {};

    if (period !== "all") {
      const now = new Date();
      if (period === "week") {
        dateFilter = {
          createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) },
        };
      } else if (period === "month") {
        dateFilter = {
          createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) },
        };
      }
    }

    let leaderboard;

    if (type === "points") {
      leaderboard = await User.getLeaderboard(parseInt(limit), "points");
    } else if (type === "streak") {
      leaderboard = await User.find({ isActive: true })
        .select("username profile points level streak learningStats")
        .sort({ "streak.current": -1, "streak.longest": -1 })
        .limit(parseInt(limit));
    } else if (type === "exams") {
      leaderboard = await User.find({ isActive: true })
        .select("username profile points level learningStats streak")
        .sort({
          "learningStats.examsCompleted": -1,
          "learningStats.examsPassed": -1,
        })
        .limit(parseInt(limit));
    }

    res.json({
      success: true,
      leaderboard,
      period,
      type,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "points level experience streak learningStats achievements"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get recent activities for stats
    const recentActivities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("course", "title");

    res.json({
      success: true,
      stats: {
        points: user.points,
        level: user.level,
        experience: user.experience,
        nextLevelProgress: user.nextLevelProgress,
        streak: user.streak,
        learningStats: user.learningStats,
        completionRate: user.completionRate,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user stats",
    });
  }
};

// Helper functions
function generateActivityDescription(type, metadata) {
  const descriptions = {
    exam_started: "Started an exam",
    exam_completed: "Completed an exam",
    exam_passed: "Passed an exam",
    exam_failed: "Failed an exam",
    course_enrolled: "Enrolled in a course",
    course_completed: "Completed a course",
    lesson_completed: "Completed a lesson",
    feedback_submitted: "Submitted feedback",
    discussion_created: "Created a discussion",
    discussion_replied: "Replied to a discussion",
    profile_updated: "Updated profile",
    certificate_earned: "Earned a certificate",
    daily_login: "Logged in for the day",
  };

  let description = descriptions[type] || "Performed an activity";

  if (metadata?.courseTitle) {
    description += `: ${metadata.courseTitle}`;
  }

  if (metadata?.score && type.includes("exam")) {
    description += ` (Score: ${metadata.score}/${metadata.totalMarks})`;
  }

  return description;
}

function getStatsUpdate(type, metadata) {
  const statsUpdate = {};

  switch (type) {
    case "exam_completed":
      statsUpdate.examsCompleted = 1;
      if (metadata?.timeSpent) {
        statsUpdate.timeSpent = Math.floor(metadata.timeSpent / 60); // Convert to minutes
      }
      break;
    case "exam_passed":
      statsUpdate.examsPassed = 1;
      break;
    case "course_completed":
      statsUpdate.coursesCompleted = 1;
      break;
    case "feedback_submitted":
      statsUpdate.feedbackGiven = 1;
      break;
    case "discussion_created":
    case "discussion_replied":
      statsUpdate.discussionsParticipated = 1;
      break;
  }

  return statsUpdate;
}

async function checkAchievements(user, activityType, metadata) {
  const newAchievements = [];

  // Check for first exam achievement
  if (
    activityType === "exam_completed" &&
    user.learningStats.examsCompleted === 1
  ) {
    if (user.addAchievement(ACHIEVEMENTS.FIRST_EXAM)) {
      newAchievements.push(ACHIEVEMENTS.FIRST_EXAM);
    }
  }

  // Check for exam master achievement
  if (
    activityType === "exam_completed" &&
    user.learningStats.examsCompleted === 10
  ) {
    if (user.addAchievement(ACHIEVEMENTS.EXAM_MASTER)) {
      newAchievements.push(ACHIEVEMENTS.EXAM_MASTER);
    }
  }

  // Check for perfect score achievement
  if (activityType === "exam_passed" && metadata?.percentage === 100) {
    if (user.addAchievement(ACHIEVEMENTS.PERFECT_SCORE)) {
      newAchievements.push(ACHIEVEMENTS.PERFECT_SCORE);
    }
  }

  // Check for feedback giver achievement
  if (
    activityType === "feedback_submitted" &&
    user.learningStats.feedbackGiven === 5
  ) {
    if (user.addAchievement(ACHIEVEMENTS.FEEDBACK_GIVER)) {
      newAchievements.push(ACHIEVEMENTS.FEEDBACK_GIVER);
    }
  }

  // Check for streak achievement
  if (activityType === "daily_login" && user.streak.current === 7) {
    if (user.addAchievement(ACHIEVEMENTS.STREAK_7)) {
      newAchievements.push(ACHIEVEMENTS.STREAK_7);
    }
  }

  // Check for course completion achievement
  if (
    activityType === "course_completed" &&
    user.learningStats.coursesCompleted === 1
  ) {
    if (user.addAchievement(ACHIEVEMENTS.COURSE_COMPLETER)) {
      newAchievements.push(ACHIEVEMENTS.COURSE_COMPLETER);
    }
  }

  return newAchievements;
}
