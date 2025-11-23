import Discussion from "../models/Discussion.js";
import Course from "../models/Course.js";

export const getDiscussions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      courseId,
      unitId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (courseId) filter.course = courseId;
    if (unitId) filter.unit = unitId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const discussions = await Discussion.find(filter)
      .populate("user", "username profile")
      .populate("replies.user", "username profile")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments(filter);

    res.json({
      success: true,
      discussions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching discussions",
    });
  }
};

export const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate("user", "username profile")
      .populate("replies.user", "username profile");

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Increment view count
    discussion.views += 1;
    await discussion.save();

    res.json({
      success: true,
      discussion,
    });
  } catch (error) {
    console.error("Get discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching discussion",
    });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { courseId, unitId, title, content, tags } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const discussion = new Discussion({
      course: courseId,
      unit: unitId,
      user: req.user._id,
      title,
      content,
      tags: tags || [],
    });

    await discussion.save();
    await discussion.populate("user", "username profile");

    res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      discussion,
    });
  } catch (error) {
    console.error("Create discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating discussion",
    });
  }
};

export const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const discussionId = req.params.id;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const isInstructorReply = req.user.role === "admin";

    discussion.replies.push({
      user: req.user._id,
      content,
      isInstructorReply,
    });

    await discussion.save();
    await discussion.populate("replies.user", "username profile");

    res.json({
      success: true,
      message: "Reply added successfully",
      discussion,
    });
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding reply",
    });
  }
};

export const voteDiscussion = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const discussionId = req.params.id;
    const userId = req.user._id;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Remove existing votes from this user
    discussion.upvotes = discussion.upvotes.filter(
      (id) => id.toString() !== userId.toString()
    );
    discussion.downvotes = discussion.downvotes.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Add new vote
    if (voteType === "upvote") {
      discussion.upvotes.push(userId);
    } else if (voteType === "downvote") {
      discussion.downvotes.push(userId);
    }

    await discussion.save();

    res.json({
      success: true,
      message: "Vote recorded successfully",
      upvotes: discussion.upvotes.length,
      downvotes: discussion.downvotes.length,
    });
  } catch (error) {
    console.error("Vote discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Error voting on discussion",
    });
  }
};

export const updateDiscussion = async (req, res) => {
  try {
    const { title, content, tags, isResolved } = req.body;
    const discussionId = req.params.id;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user owns the discussion or is admin
    if (
      discussion.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update fields
    if (title !== undefined) discussion.title = title;
    if (content !== undefined) discussion.content = content;
    if (tags !== undefined) discussion.tags = tags;
    if (isResolved !== undefined) discussion.isResolved = isResolved;

    await discussion.save();
    await discussion.populate("user", "username profile");

    res.json({
      success: true,
      message: "Discussion updated successfully",
      discussion,
    });
  } catch (error) {
    console.error("Update discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating discussion",
    });
  }
};

export const deleteDiscussion = async (req, res) => {
  try {
    const discussionId = req.params.id;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user owns the discussion or is admin
    if (
      discussion.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await Discussion.findByIdAndDelete(discussionId);

    res.json({
      success: true,
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting discussion",
    });
  }
};
