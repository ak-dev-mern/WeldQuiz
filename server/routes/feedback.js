import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  submitFeedback,
  getMyFeedback,
  getCourseFeedback,
  updateFeedback,
  deleteFeedback,
  voteFeedback,
  addReplyToFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

// Public routes
router.get("/course/:courseId", getCourseFeedback);

// Protected routes
router.post("/", authenticate, submitFeedback);
router.get("/my", authenticate, getMyFeedback);
router.put("/:feedbackId", authenticate, updateFeedback);
router.delete("/:feedbackId", authenticate, deleteFeedback);
router.post("/:feedbackId/vote", authenticate, voteFeedback);
router.post("/:feedbackId/reply", authenticate, addReplyToFeedback);

export default router;
