// middleware/auth.js
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs"; // Add this import
import User from "../models/User.js";

// Ensure folder exists or create it
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Multer storage generator based on type
const getStorage = (type) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      let folder = "uploads/";
      if (type === "user") folder += "users/";
      else if (type === "course") folder += "courses/";
      else if (type === "question") folder += "questions/";

      ensureFolderExists(folder);
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });

// File filter to allow only images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

// Multer upload instances
export const uploadUserImage = multer({
  storage: getStorage("user"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadCourseImage = multer({
  storage: getStorage("course"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadQuestionImage = multer({
  storage: getStorage("question"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// FIXED: Middleware helper to handle single file upload
export const uploadSingleImage = (type = "user", fieldName = "avatar") => {
  let upload;
  if (type === "user") upload = uploadUserImage;
  else if (type === "course") upload = uploadCourseImage;
  else if (type === "question") upload = uploadQuestionImage;

  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE")
            return res
              .status(400)
              .json({ success: false, message: "File too large (max 5MB)" });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

// FIXED: Combined authentication + image upload middleware
export const authenticateWithImage = (fieldName = "image") => {
  return async (req, res, next) => {
    try {
      // First handle authentication
      const token = req.cookies.accessToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token required. Please log in.",
        });
      }

      // Verify access token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select(
        "-password -resetPasswordToken -resetPasswordExpires"
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

      // Check for active session
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

      // Then handle file upload - FIXED: Use uploadUserImage instead of undefined 'upload'
      uploadUserImage.single(fieldName)(req, res, function (err) {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 5MB.",
              });
            }
            return res.status(400).json({
              success: false,
              message: `File upload error: ${err.message}`,
            });
          }
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        next();
      });
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
};

// Original authentication middleware (unchanged)
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

    const user = await User.findById(decoded.userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
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
      const user = await User.findById(decoded.userId).select("-password");

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
