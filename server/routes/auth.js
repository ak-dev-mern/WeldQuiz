import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  getSessionInfo, // Added if you implement this
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateUpdateProfile,
} from "../middleware/validation.js";
import { authLimiter, sensitiveLimiter } from "../middleware/security.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post(
  "/forgot-password",
  authLimiter,
  validateForgotPassword,
  forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  validateResetPassword,
  resetPassword
);
router.post("/refresh-token", refreshToken); // No rate limit for refresh

// Protected routes with authentication
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, validateUpdateProfile, updateProfile);
router.put(
  "/change-password",
  authenticate,
  validateChangePassword,
  changePassword
);

// Optional: Session management
router.get("/session", authenticate, getSessionInfo);

export default router;
