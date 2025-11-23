import Feedback from "../models/Feedback.js";
import Course from "../models/Course.js";
import Activity from "../models/Activity.js";

export const submitFeedback = async (req, res) => {
  try {
    const {
      courseId,
      rating,
      review,
      type = "course",
      isAnonymous = false,
    } = req.body;
    const userId = req.user._id;

    // Check if course exists and user is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const isEnrolled = await Course.exists({
      _id: courseId,
      studentsEnrolled: userId,
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to submit feedback",
      });
    }

    // Check if user already submitted feedback for this course
    const existingFeedback = await Feedback.findOne({
      user: userId,
      course: courseId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback for this course",
      });
    }

    // Create feedback
    const feedback = new Feedback({
      user: userId,
      course: courseId,
      rating,
      review,
      type,
      isAnonymous,
    });

    await feedback.save();

    // Update course ratings
    await updateCourseRatings(courseId);

    // Log activity
    await Activity.create({
      user: userId,
      type: "feedback_submitted",
      course: courseId,
      feedback: feedback._id,
      description: `Submitted feedback for ${course.title}`,
      points: 10,
    });

    // Populate user info for response
    await feedback.populate("user", "username profile");

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
    });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, courseId } = req.query;

    const filter = { user: userId };
    if (courseId) filter.course = courseId;

    const feedback = await Feedback.find(filter)
      .populate("course", "title image category")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get my feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
    });
  }
};

export const getCourseFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {
      course: courseId,
      status: "approved",
    };

    if (rating) filter.rating = parseInt(rating);

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const feedback = await Feedback.find(filter)
      .populate("user", "username profile")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(filter);

    // Get rating statistics
    const ratingStats = await Feedback.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalRatings = ratingStats.reduce((sum, stat) => sum + stat.count, 0);
    const averageRating =
      ratingStats.reduce((sum, stat) => sum + stat._id * stat.count, 0) /
        totalRatings || 0;

    res.json({
      success: true,
      feedback,
      statistics: {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: ratingStats,
      },
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get course feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course feedback",
    });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    const feedback = await Feedback.findOne({
      _id: feedbackId,
      user: userId,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    if (rating) feedback.rating = rating;
    if (review) feedback.review = review;

    await feedback.save();

    // Update course ratings
    await updateCourseRatings(feedback.course);

    res.json({
      success: true,
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Update feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feedback",
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findOne({
      _id: feedbackId,
      user: userId,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    const courseId = feedback.course;

    await Feedback.findByIdAndDelete(feedbackId);

    // Update course ratings
    await updateCourseRatings(courseId);

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting feedback",
    });
  }
};

export const voteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { isHelpful } = req.body;
    const userId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Check if user is trying to vote on their own feedback
    if (feedback.user.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot vote on your own feedback",
      });
    }

    feedback.addHelpfulVote(userId, isHelpful);
    await feedback.save();

    res.json({
      success: true,
      message: "Vote recorded successfully",
      helpfulCount: feedback.helpfulCount,
      notHelpfulCount: feedback.notHelpfulCount,
    });
  } catch (error) {
    console.error("Vote feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Error voting on feedback",
    });
  }
};

export const addReplyToFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    const isInstructorReply = req.user.role === "admin";

    feedback.replies.push({
      user: userId,
      content,
      isInstructorReply,
    });

    await feedback.save();
    await feedback.populate("replies.user", "username profile");

    res.json({
      success: true,
      message: "Reply added successfully",
      feedback,
    });
  } catch (error) {
    console.error("Add reply to feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding reply to feedback",
    });
  }
};

// Helper function to update course ratings
async function updateCourseRatings(courseId) {
  try {
    const ratingStats = await Feedback.getCourseAverageRating(courseId);

    if (ratingStats.length > 0) {
      const stats = ratingStats[0];
      await Course.findByIdAndUpdate(courseId, {
        averageRating: Math.round(stats.averageRating * 10) / 10,
        totalRatings: stats.totalReviews,
      });
    }
  } catch (error) {
    console.error("Update course ratings error:", error);
  }
}
