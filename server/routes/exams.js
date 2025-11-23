import express from "express";
import {
  startExam,
  submitExam,
  getExamResults,
  getExamAnalytics,
} from "../controllers/examController.js";
import { authenticate } from "../middleware/auth.js";
import { examLimiter } from "../middleware/security.js";

const router = express.Router();

// Protected routes
router.post("/:courseId/:unitId/start", authenticate, examLimiter, startExam);
router.post("/:courseId/:unitId/submit", authenticate, examLimiter, submitExam);
router.get("/results", authenticate, getExamResults);
router.get("/analytics", authenticate, getExamAnalytics);

export default router;
