import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getUserActivities,
  getActivitySummary,
  getCourseActivities,
  createActivity,
  getLeaderboard,
} from "../controllers/activityController.js";

const router = express.Router();

// Protected routes
router.get("/", authenticate, getUserActivities);
router.get("/summary", authenticate, getActivitySummary);
router.get("/course/:courseId", authenticate, getCourseActivities);
router.post("/", authenticate, createActivity);
router.get("/leaderboard", authenticate, getLeaderboard);

export default router;
