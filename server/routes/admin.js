import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { getAdminCourses, getCourseAnalytics, getDashboardStats, getRevenueStats, getSystemHealth, updateCourseStatus } from "../controllers/adminController.js";
import { deleteUser, getUserById, getUsers, updateUser, updateUserStatus } from "../controllers/userController.js";
import { getPaymentHistory } from "../controllers/paymentController.js";

const router = express.Router();

// All admin routes require admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard stats
router.get("/dashboard/stats", getDashboardStats);

// User management
router.get("/users", getUsers);
router.get("/users/:userId", getUserById);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.patch("/users/:userId/status", updateUserStatus);

// Course management
router.get("/courses", getAdminCourses);
router.patch("/courses/:courseId/status", updateCourseStatus);
router.get("/courses/analytics", getCourseAnalytics);

// Payment management
router.get("/payments", getPaymentHistory);
router.get("/revenue/stats", getRevenueStats);

// System management
router.get("/system/health", getSystemHealth);

export default router;
