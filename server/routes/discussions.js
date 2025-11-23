import express from "express";
import { authenticate } from "../middleware/auth.js";
import { addReply, createDiscussion, deleteDiscussion, getDiscussion, getDiscussions, updateDiscussion, voteDiscussion } from "../controllers/discussionController.js";

const router = express.Router();

// Public routes (read-only)
router.get("/", getDiscussions);
router.get("/:id", getDiscussion);

// Protected routes
router.post("/", authenticate, createDiscussion);
router.post("/:id/replies", authenticate, addReply);
router.post("/:id/vote", authenticate, voteDiscussion);
router.patch("/:id", authenticate, updateDiscussion);
router.delete("/:id", authenticate, deleteDiscussion);

export default router;
