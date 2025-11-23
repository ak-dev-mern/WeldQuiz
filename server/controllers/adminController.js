import User from "../models/User.js";
import Course from "../models/Course.js";
import ExamResult from "../models/ExamResult.js";
import Payment from "../models/Payment.js";
import Discussion from "../models/Discussion.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalExams,
      totalDiscussions,
      totalRevenue,
      recentUsers,
      popularCourses,
      systemHealth,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ isActive: true }),
      ExamResult.countDocuments(),
      Discussion.countDocuments(),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username email profile createdAt"),
      Course.find()
        .sort({ totalStudents: -1 })
        .limit(5)
        .select("title image totalStudents"),
      getSystemHealthData(),
    ]);

    // Weekly growth data
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [newUsersThisWeek, newCoursesThisWeek] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Course.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    ]);

    res.json({
      success: true,
      stats: {
        totals: {
          users: totalUsers,
          courses: totalCourses,
          exams: totalExams,
          discussions: totalDiscussions,
          revenue: totalRevenue[0]?.total || 0,
        },
        growth: {
          newUsers: newUsersThisWeek,
          newCourses: newCoursesThisWeek,
        },
        recentUsers,
        popularCourses,
        systemHealth,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status !== undefined) {
      if (status === "active") filter.isActive = true;
      else if (status === "inactive") filter.isActive = false;
    }

    const users = await User.find(filter)
      .select("-password -loginSessions")
      .populate("coursesEnrolled.course", "title")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -loginSessions")
      .populate("coursesEnrolled.course");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's exam results
    const examResults = await ExamResult.find({ user: req.params.userId })
      .populate("course", "title")
      .sort({ completedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        examResults,
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -loginSessions");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select("-password -loginSessions");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
    });
  }
};

export const getAdminCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;

    const courses = await Course.find(filter)
      .populate("instructor", "username profile")
      .sort({ createdAt: -1 })
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
    console.error("Get admin courses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
    });
  }
};

export const updateCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { isActive } = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { isActive },
      { new: true }
    ).populate("instructor", "username profile");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      message: `Course ${isActive ? "activated" : "deactivated"} successfully`,
      course,
    });
  } catch (error) {
    console.error("Update course status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating course status",
    });
  }
};

export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.query;

    let analytics;

    if (courseId) {
      // Analytics for specific course
      const [course, examResults, enrollments] = await Promise.all([
        Course.findById(courseId),
        ExamResult.find({ course: courseId }),
        User.countDocuments({ "coursesEnrolled.course": courseId }),
      ]);

      const passRate =
        examResults.length > 0
          ? (examResults.filter((r) => r.passed).length / examResults.length) *
            100
          : 0;

      analytics = {
        course: course.title,
        totalEnrollments: enrollments,
        totalExams: examResults.length,
        averageScore:
          examResults.reduce((sum, r) => sum + r.percentage, 0) /
            examResults.length || 0,
        passRate,
        difficultyBreakdown: {
          easy: examResults.filter((r) => r.percentage >= 80).length,
          medium: examResults.filter(
            (r) => r.percentage >= 60 && r.percentage < 80
          ).length,
          hard: examResults.filter((r) => r.percentage < 60).length,
        },
      };
    } else {
      // Overall course analytics
      const courses = await Course.find().select(
        "title totalStudents averageRating"
      );

      analytics = courses.map((course) => ({
        title: course.title,
        totalStudents: course.totalStudents,
        averageRating: course.averageRating,
        revenue: course.totalStudents * 29.99, // Example calculation
      }));
    }

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get course analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course analytics",
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate("user", "username email profile")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
    });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // month, year

    let groupBy;
    if (period === "month") {
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    } else {
      groupBy = {
        year: { $year: "$createdAt" },
      };
    }

    const revenueStats = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: {
            $gte: new Date(
              Date.now() -
                (period === "month" ? 365 : 730) * 24 * 60 * 60 * 1000
            ),
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      revenueStats,
    });
  } catch (error) {
    console.error("Get revenue stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue stats",
    });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const healthData = await getSystemHealthData();

    res.json({
      success: true,
      health: healthData,
    });
  } catch (error) {
    console.error("Get system health error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system health",
    });
  }
};

async function getSystemHealthData() {
  const [dbStatus, memoryUsage, uptime] = await Promise.all([
    checkDatabaseStatus(),
    getMemoryUsage(),
    getUptime(),
  ]);

  return {
    database: dbStatus,
    memory: memoryUsage,
    uptime,
    timestamp: new Date().toISOString(),
  };
}

async function checkDatabaseStatus() {
  try {
    // Simple database check
    await User.findOne();
    return { status: "healthy", message: "Database connected" };
  } catch (error) {
    return { status: "unhealthy", message: error.message };
  }
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    used: Math.round(usage.heapUsed / 1024 / 1024),
    total: Math.round(usage.heapTotal / 1024 / 1024),
    rss: Math.round(usage.rss / 1024 / 1024),
  };
}

function getUptime() {
  return Math.round(process.uptime());
}
