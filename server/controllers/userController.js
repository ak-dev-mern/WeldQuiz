import User from "../models/User.js";
import Course from "../models/Course.js";
import ExamResult from "../models/ExamResult.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -loginSessions")
      .populate("coursesEnrolled.course", "title image category duration");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "profile.firstName": firstName,
          "profile.lastName": lastName,
          "profile.bio": bio,
          "profile.phone": phone,
          "profile.avatar": avatar,
        },
      },
      { new: true, runValidators: true }
    ).select("-password -loginSessions");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

export const getUserCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "coursesEnrolled.course"
    );

    res.json({
      success: true,
      courses: user.coursesEnrolled,
    });
  } catch (error) {
    console.error("Get user courses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user courses",
    });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const { courseId } = req.query;

    const user = await User.findById(req.user._id);
    let progress = [];

    if (courseId) {
      // Get progress for specific course
      const courseProgress = user.coursesEnrolled.find(
        (enrollment) => enrollment.course.toString() === courseId
      );
      if (courseProgress) {
        progress = [courseProgress];
      }
    } else {
      // Get progress for all courses
      progress = user.coursesEnrolled;
    }

    res.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Get user progress error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user progress",
    });
  }
};

export const getUserActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const examResults = await ExamResult.find({ user: req.user._id })
      .populate("course", "title image")
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ExamResult.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      activities: examResults,
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

// Admin functions
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

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

    const users = await User.find(filter)
      .select("-password -loginSessions")
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

    res.json({
      success: true,
      user,
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
