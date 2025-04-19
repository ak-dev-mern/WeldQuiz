import express from "express";
import Discussion from "../models/Discussion.js";
import Message from "../models/Message.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validationResult } from "express-validator";
import {
  discussionValidators,
  messageValidators,
} from "../validators/discussionValidators.js";
import { Sequelize } from "sequelize";

const router = express.Router();

// POST: Create a new discussion
router.post(
  "/createnewdiscussion",
  authMiddleware, // This ensures the user is authenticated
  discussionValidators.createDiscussion,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    // Check if req.user and req.user.id are properly set
    if (!req.user?.id) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    try {
      // Create a new discussion, using the user ID and username from the authentication token
      const newDiscussion = await Discussion.create({
        title,
        description,
        created_by: req.user.id, // Use the user's ID
        created_name: req.user.username, // Use the user's username for created_name
      });

      return res.status(201).json({
        success: true,
        discussion: newDiscussion,
      });
    } catch (error) {
      console.error("Discussion creation error:", error);
      return res.status(500).json({
        error: "Failed to create discussion",
        details: error.message,
      });
    }
  }
);

// GET: Fetch all discussions with pagination and messages
router.get("/getdiscussions", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: discussions } = await Discussion.findAndCountAll({
      include: [
        {
          model: Message,
          as: "messages",
          separate: true, // ✅ Ensures limit/order works per discussion
          limit: 5,
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      discussions,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Fetch discussions error:", error);
    return res.status(500).json({
      error: "Failed to fetch discussions",
      details: error.message,
    });
  }
});

// GET: Fetch single discussion with all messages
router.get("/getdiscussions/:id", async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id, {
      include: [
        {
          model: Message,
          as: "messages",
          order: [["createdAt", "ASC"]], // Oldest first
        },
      ],
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: "Discussion not found",
      });
    }

    return res.status(200).json({
      success: true,
      discussion,
    });
  } catch (error) {
    console.error("Fetch discussion error:", error);
    return res.status(500).json({
      error: "Failed to fetch discussion",
      details: error.message,
    });
  }
});

// PUT: Update discussion details
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id; // From authentication middleware

    // Find the discussion
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    // Check if user is admin or the creator
    if (req.user.role !== "admin" && discussion.created_by !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Update the discussion
    const updatedDiscussion = await discussion.update({
      title,
      description: description || null,
    });

    res.json(updatedDiscussion);
  } catch (error) {
    console.error("Error updating discussion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE: Delete discussion
router.delete("/deletediscussions/:id", authMiddleware, async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: "Discussion not found",
      });
    }

    // Authorization check
    if (discussion.created_by !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to delete this discussion",
      });
    }

    await discussion.destroy();

    return res.status(200).json({
      success: true,
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    return res.status(500).json({
      error: "Failed to delete discussion",
      details: error.message,
    });
  }
});

// POST: Create a message in discussion
router.post(
  "/createmessages/:discussionId/messages", // Adjusted the route param to match the frontend URL
  authMiddleware, // Ensure the user is authenticated
  messageValidators.createMessage, // Validate the incoming message data
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body; // Extract message from the body
    const { discussionId } = req.params; // Extract discussion ID from URL

    try {
      // Find the discussion by its ID
      const discussion = await Discussion.findByPk(discussionId);

      if (!discussion) {
        return res.status(404).json({
          success: false,
          error: "Discussion not found",
        });
      }

      // Create a new message in the discussion
      const newMessage = await Message.create({
        text: message,
        senderId: req.user.id, // Get user ID from authenticated user
        sendername: req.user.username, // Get user Name from authenticated user
        discussionId: discussion.discussion_id,
      });

      return res.status(201).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.error("Create message error:", error);
      return res.status(500).json({
        error: "Failed to create message",
        details: error.message,
      });
    }
  }
);

// GET: Fetch all messages for a discussion
router.get("/getmessages/:id/messages", async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { discussionId: req.params.id },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return res.status(500).json({
      error: "Failed to fetch messages",
      details: error.message,
    });
  }
});

// GET: Fetch all messages (without discussion ID filter)
router.get("/getmessages", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: messages } = await Message.findAndCountAll({
      order: [["createdAt", "ASC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      messages,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return res.status(500).json({
      error: "Failed to fetch messages",
      details: error.message,
    });
  }
});


// DELETE: Delete message
router.delete(
  "/deletemessage/:discussionId/:messageId",
  authMiddleware,
  async (req, res) => {
    try {
      const { discussionId, messageId } = req.params;
      const message = await Message.findOne({
        where: { message_id: messageId, discussionId: discussionId },
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          error: "Message not found",
        });
      }

      // Authorization check: Allow the message creator or admin to delete
      if (message.senderId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Unauthorized to delete this message",
        });
      }

      await message.destroy();

      return res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      console.error("Delete message error:", error);
      return res.status(500).json({
        error: "Failed to delete message",
        details: error.message,
      });
    }
  }
);

// PUT: Update message content
router.put(
  "/updatemessage/:discussionId/:messageId",
  authMiddleware,
  async (req, res) => {
    try {
      const { discussionId, messageId } = req.params;
      const { message } = req.body; // Get the new message content from the request body

      if (!message.trim()) {
        return res.status(400).json({
          success: false,
          error: "Message content cannot be empty",
        });
      }

      const existingMessage = await Message.findOne({
        where: { message_id: messageId, discussionId: discussionId },
      });

      if (!existingMessage) {
        return res.status(404).json({
          success: false,
          error: "Message not found",
        });
      }

      // Authorization check: Allow the message creator or admin to update the message
      if (
        existingMessage.senderId !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized to update this message",
        });
      }

      // Update the message content
      await existingMessage.update({ text: message });

      return res.status(200).json({
        success: true,
        message: "Message updated successfully",
        data: existingMessage,
      });
    } catch (error) {
      console.error("Update message error:", error);
      return res.status(500).json({
        error: "Failed to update message",
        details: error.message,
      });
    }
  }
);

router.get("/mydiscussions", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // ✅ Count all discussions by the user
    const total = await Discussion.count({
      where: { created_by: req.user.id },
    });

    // ✅ Fetch paginated discussions
    const discussions = await Discussion.findAll({
      where: { created_by: req.user.id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      discussions,
      total, // ✅ total discussions by this user
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching user's discussions:", err);
    res.status(500).json({ error: err.message });
  }
});

// In your discussion routes file
router.delete("/mydiscussions/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Find the discussion by ID and ensure it belongs to the logged-in user
    const discussion = await Discussion.findOne({
      where: { id, created_by: userId },
    });

    if (!discussion) {
      return res.status(404).json({
        message:
          "Discussion not found or you do not have permission to delete it.",
      });
    }

    // Proceed to delete the discussion
    await discussion.destroy();

    return res
      .status(200)
      .json({ message: "Discussion deleted successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
});

// GET /api/messages/mymessages - fetch all messages from the logged-in user
router.get("/mymessages", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { senderId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ messages });
  } catch (err) {
    console.error("Error fetching user's messages:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
