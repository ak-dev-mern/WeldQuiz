// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  authLimiter,
  apiLimiter,
  sensitiveLimiter,
  discussionLimiter,
  generalLimiter,
  securityHeaders,
  xssProtection,
} from "./middleware/security.js";
import path from "path";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import paymentRoutes from "./routes/payments.js";
import examRoutes from "./routes/exams.js";
import discussionRoutes from "./routes/discussions.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import activityRoutes from "./routes/activities.js";

// Import middleware
import errorHandler from "./middleware/errorHandler.js";
import { logger } from "./middleware/logger.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.includes(origin);
    if (!allowed) {
      // don't throw an error — return false so browser receives a clean CORS refusal
      console.warn(`Blocked by CORS: ${origin}`);
    }
    return callback(null, allowed);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Forwarded-For",
    "X-Forwarded-Proto",
    "X-Forwarded-Host",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Cache-Control",
  ],
  exposedHeaders: [
    "Content-Length",
    "Content-Type",
    "Authorization",
    "X-Total-Count",
    "X-Page-Count",
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Socket.io configuration with enhanced CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: false,
});

// Enhanced middleware stack
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        // include backend API origins so browser connectSrc rules allow API/socket requests
        connectSrc: ["'self'", "ws:", "wss:", "blob:", ...allowedOrigins],
        mediaSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(securityHeaders);
app.use(xssProtection);
app.use(cors(corsOptions));

// Safe JSON body parser — allow empty bodies & validate when present
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      // allow empty body (GET/DELETE often have no body)
      if (!buf || buf.length === 0) return;

      try {
        JSON.parse(buf);
      } catch (e) {
        // send nice error and abort parsing
        res.status(400).json({
          success: false,
          message: "Invalid JSON payload",
        });
        throw new Error("Invalid JSON payload");
      }
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());
app.use(logger);

// Apply rate limiting with specific rules (less aggressive for general API)
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/discussions", discussionLimiter);
app.use("/api/auth/forgot-password", sensitiveLimiter);
app.use("/api/auth/reset-password", sensitiveLimiter);
app.use("/api/auth/change-password", sensitiveLimiter);

// Use a general limiter for API rather than an overly aggressive global limiter.
// You can tune this as needed (e.g., place more strict limiters on write endpoints).
app.use("/api/", generalLimiter);

// Request logging middleware with improved formatting
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "ERROR" : "INFO";
    console.log(
      `[${new Date().toISOString()}] ${logLevel}: ${req.method} ${
        req.originalUrl
      } ${res.statusCode} ${duration}ms - IP: ${req.ip}`
    );
  });

  next();
});

// Enhanced Socket.io with authentication and better room management
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "- IP:", socket.handshake.address);

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", { message: "An error occurred" });
  });

  // Example token auth handler — keep token verification secure in production
  socket.on("authenticate", (token) => {
    try {
      // Replace this with proper JWT verification (this is a placeholder)
      socket.userId = token;
      console.log(`User authenticated for socket: ${socket.id}`);
    } catch (error) {
      socket.emit("error", { message: "Authentication failed" });
    }
  });

  socket.on("join-course", (courseId) => {
    try {
      if (!courseId || typeof courseId !== "string") {
        throw new Error("Invalid course ID");
      }

      // Leave previous course rooms to prevent multiple room subscriptions
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room.startsWith("course-") && room !== `course-${courseId}`) {
          socket.leave(room);
        }
      });

      socket.join(`course-${courseId}`);
      console.log(`User ${socket.id} joined course ${courseId}`);

      socket.to(`course-${courseId}`).emit("user-joined", {
        userId: socket.userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("send-message", (data) => {
    try {
      if (!data.courseId || !data.message || !data.message.trim()) {
        throw new Error("Invalid message data");
      }

      // Validate user is in the course room
      if (!socket.rooms.has(`course-${data.courseId}`)) {
        throw new Error("Not authorized to send messages to this course");
      }

      const messageData = {
        ...data,
        userId: socket.userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9),
      };

      io.to(`course-${data.courseId}`).emit("new-message", messageData);

      console.log(
        `Message sent to course ${data.courseId} by user ${socket.userId}`
      );
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("typing-start", (data) => {
    try {
      if (!data.courseId) throw new Error("Course ID required");
      socket.to(`course-${data.courseId}`).emit("user-typing", {
        userId: socket.userId,
        isTyping: true,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("typing-stop", (data) => {
    try {
      if (!data.courseId) throw new Error("Course ID required");
      socket.to(`course-${data.courseId}`).emit("user-typing", {
        userId: socket.userId,
        isTyping: false,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(
      `User disconnected: ${socket.id} - Reason: ${reason} - User: ${socket.userId}`
    );

    // Notify all rooms that user left
    socket.rooms.forEach((room) => {
      if (room.startsWith("course-")) {
        socket.to(room).emit("user-left", {
          userId: socket.userId,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });
});

// Add io to request object for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// IMPORTANT: Do NOT wrap routers with asyncHandler — routers are Express routers, not route handlers.
// Apply async wrappers at the controller level or use a helper inside each route file if needed.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/activities", activityRoutes);

// Enhanced health check with more metrics
app.get("/api/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus =
      dbState === 1
        ? "connected"
        : dbState === 2
        ? "connecting"
        : dbState === 3
        ? "disconnecting"
        : "disconnected";

    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB",
      },
      uptime: Math.round(process.uptime()) + "s",
      version: process.env.npm_package_version || "1.0.0",
      nodeVersion: process.version,
      platform: process.platform,
      connectedClients: io.engine.clientsCount,
    };

    if (dbState !== 1) {
      return res.status(503).json({
        ...healthCheck,
        status: "SERVICE_UNAVAILABLE",
        message: "Database connection issue",
      });
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: "Health check failed",
      error: error.message,
    });
  }
});

// Graceful shutdown handling
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  console.log("Received shutdown signal, closing server gracefully...");

  // Stop accepting new connections
  httpServer.close(() => {
    console.log("HTTP server closed.");

    // Disconnect all socket connections
    io.disconnectSockets();
    console.log("Socket connections closed.");

    // Close database connection
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.log("Forcing shutdown...");
    process.exit(1);
  }, 10000);
}

// Enhanced 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggested:
      req.method === "GET"
        ? "Check the API documentation"
        : "Verify your request payload",
  });
});

// Global error handler (should be last)
app.use(errorHandler);

// Enhanced database connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Increased timeouts for reliability under load and index builds
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 90000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: "majority",
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(
      `MongoDB connection error (${retries} retries left):`,
      error.message
    );

    if (retries > 0) {
      console.log(`Retrying connection in ${delay}ms...`);
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error("Failed to connect to MongoDB after multiple attempts");
      process.exit(1);
    }
  }
};

// Database event handlers
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`
🚀 Server running on port ${PORT}
📁 Environment: ${process.env.NODE_ENV || "development"}
🌐 CORS enabled for: ${allowedOrigins.join(", ")}
📊 Rate limiting: Enabled
🔐 Security headers: Enabled
💬 WebSocket support: Enabled
      `);
    });

    httpServer.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { io, app };
