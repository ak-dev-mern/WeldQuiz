import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";
import crypto from "crypto";

// Generate tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Set httpOnly cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  try {
    console.log("🍪 setTokenCookies called with tokens");

    // For local development
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Must be false for localhost
      sameSite: "lax", // Use 'lax' for local development
      path: "/",
    };

    // Set access token cookie (15 minutes)
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // Set refresh token cookie (7 days)
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Cookies should be set in response headers");
  } catch (error) {
    console.error("❌ Error in setTokenCookies:", error);
  }
};
// Clear cookies
const clearTokenCookies = (res) => {
  res.clearCookie("accessToken", {
    path: "/",
  });
  res.clearCookie("refreshToken", {
    path: "/",
  });
  console.log("🧹 Cookies cleared");
};

export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: { firstName, lastName },
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Add to login sessions
    user.loginSessions.push({
      token: accessToken,
      device: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      loginTime: new Date(),
    });

    await user.save();

    // Set httpOnly cookies (don't send tokens in response body)
    setTokenCookies(res, accessToken, refreshToken);

    // Send welcome email (async - don't wait for it)
    sendWelcomeEmail(user).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user.getPublicProfile(),
      // Don't send tokens in response when using httpOnly cookies
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Clear any cookies that might have been set
    clearTokenCookies(res);

    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt for:", req.body.email);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user with password field
    const user = await User.findOne({ email, isActive: true }).select(
      "+password"
    );
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("✅ Password valid, generating tokens...");

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log(
      "🔑 Tokens generated - Access:",
      !!accessToken,
      "Refresh:",
      !!refreshToken
    );

    // Initialize loginSessions if it doesn't exist
    if (!user.loginSessions) {
      user.loginSessions = [];
    }

    // Update user session
    user.isOnline = true;
    user.lastActive = new Date();
    user.loginSessions.push({
      token: accessToken,
      device: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      loginTime: new Date(),
    });

    // Keep only last 5 sessions
    if (user.loginSessions.length > 5) {
      user.loginSessions = user.loginSessions.slice(-5);
    }

    await user.save();
    console.log("💾 User saved to database");

    // Set httpOnly cookies
    console.log("🍪 Setting cookies...");
    setTokenCookies(res, accessToken, refreshToken);
    console.log("✅ Cookies set function completed");

    // Log response headers to debug
    console.log("📨 Sending login response");

    res.json({
      success: true,
      message: "Login successful",
      user: user.getPublicProfile(),
    });

    console.log("🎉 Login process completed successfully");
  } catch (error) {
    console.error("❌ Login error:", error);
    clearTokenCookies(res);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (token && req.user) {
      // Remove token from user's sessions
      const user = await User.findById(req.user._id);
      if (user) {
        user.loginSessions = user.loginSessions.filter(
          (session) => session.token !== token
        );
        user.isOnline = false;
        await user.save();
      }
    }

    // Clear cookies
    clearTokenCookies(res);

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear cookies even if there's an error
    clearTokenCookies(res);

    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    console.log("🔄 Refresh token endpoint called");
    console.log("📋 Request cookies:", req.cookies);

    const refreshToken = req.cookies.refreshToken;
    console.log("🔑 Refresh token present:", !!refreshToken);

    if (!refreshToken) {
      console.log("❌ No refresh token in cookies");
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log("✅ Refresh token decoded for user:", decoded.userId);

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      console.log("❌ User not found or inactive");
      clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Initialize loginSessions if it doesn't exist
    if (!user.loginSessions) {
      user.loginSessions = [];
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    console.log("✅ New tokens generated");

    // FIX: Instead of mapping by accessToken, add new session or update logic
    // Remove the old refresh token session and add new one
    const currentTime = new Date();

    // Add new session with new tokens
    user.loginSessions.push({
      token: newAccessToken, // Store access token in sessions
      device: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      loginTime: currentTime,
      lastActive: currentTime,
    });

    // Keep only last 5 sessions
    if (user.loginSessions.length > 5) {
      user.loginSessions = user.loginSessions.slice(-5);
    }

    await user.save();
    console.log("✅ User sessions updated");

    // Set new httpOnly cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);
    console.log("✅ New cookies set");

    res.json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("❌ Token refresh error:", error.message);

    // Clear cookies on any error
    clearTokenCookies(res);

    if (error.name === "TokenExpiredError") {
      console.log("❌ Refresh token expired");
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      console.log("❌ Invalid JWT token");
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please log in again.",
      });
    }

    console.log("❌ General token refresh failure");
    res.status(401).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(user, resetToken);
      console.log("Password reset email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Continue anyway to not reveal if email exists
    }

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Clear all sessions for security
    user.loginSessions = [];
    user.isOnline = false;

    await user.save();

    // Clear any existing auth cookies
    clearTokenCookies(res);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("coursesEnrolled.course", "title image category level")
      .select("-password -loginSessions");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, phone, location, website } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile fields
    user.profile = {
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      bio: bio !== undefined ? bio : user.profile.bio,
      phone: phone !== undefined ? phone : user.profile.phone,
      location: location !== undefined ? location : user.profile.location,
      website: website !== undefined ? website : user.profile.website,
    };

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;

    // Clear all sessions except current one for security
    const currentToken = req.cookies.accessToken;
    user.loginSessions = user.loginSessions.filter(
      (session) => session.token === currentToken
    );

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
    });
  }
};

// Optional: Get current session info
export const getSessionInfo = async (req, res) => {
  try {
    const currentToken = req.cookies.accessToken;
    const user = await User.findById(req.user._id);

    const currentSession = user.loginSessions.find(
      (session) => session.token === currentToken
    );

    res.json({
      success: true,
      session: currentSession
        ? {
            device: currentSession.device,
            ip: currentSession.ip,
            loginTime: currentSession.loginTime,
            lastActive: currentSession.lastActive,
          }
        : null,
      totalSessions: user.loginSessions.length,
    });
  } catch (error) {
    console.error("Get session info error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session info",
    });
  }
};
