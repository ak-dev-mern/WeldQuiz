// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required. Please log in.",
      });
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: Remove loginSessions from the exclude list so we can check sessions
    const user = await User.findById(decoded.userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
      // Removed: -loginSessions
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // FIX: Add safety check for loginSessions
    const hasActiveSession =
      user.loginSessions &&
      Array.isArray(user.loginSessions) &&
      user.loginSessions.find((session) => session.token === token);

    if (!hasActiveSession) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired. Please refresh your token.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token. Please log in again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again.",
    });
  }
};

// Optional: Admin middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Optional: Optional auth (for public routes that have enhanced features for logged-in users)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select(
        "-password" // Removed -loginSessions from here too if you need session checks
      );

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.error("Optional auth error:", error);
  }

  next();
};
