import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { getUserActivities, getUserCourses, getUserProfile, getUserProgress, updateUserProfile } from "../controllers/userController.js";
import { deleteUser, getUserById, getUsers, updateUser, updateUserStatus } from "../controllers/adminController.js";

const router = express.Router();

// Protected routes - user can manage their own data
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.get("/courses", authenticate, getUserCourses);
router.get("/progress", authenticate, getUserProgress);
router.get("/activities", authenticate, getUserActivities);

// Admin only routes
router.get("/", authenticate, requireAdmin, getUsers);
router.get("/:userId", authenticate, requireAdmin, getUserById);
router.put("/:userId", authenticate, requireAdmin, updateUser);
router.delete("/:userId", authenticate, requireAdmin, deleteUser);
router.patch(
  "/:userId/status",
  authenticate,
  requireAdmin,
  updateUserStatus
);

export default router;
