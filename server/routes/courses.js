import express from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getDemoQuestions,
  rateCourse,
} from "../controllers/courseController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateCourse } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourse);
router.get("/:courseId/demo-questions", getDemoQuestions);

// Protected routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateCourse,
  createCourse
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateCourse,
  updateCourse
);
router.delete("/:id", authenticate, requireAdmin, deleteCourse);
router.post("/:courseId/enroll", authenticate, enrollCourse);
router.post("/:courseId/rate", authenticate, rateCourse);

export default router;
