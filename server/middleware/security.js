import rateLimit from "express-rate-limit";

// Rate limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const examLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 exam attempts per hour
  message: {
    success: false,
    message: "Too many exam attempts, please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const discussionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 discussion posts per minute
  message: {
    success: false,
    message: "Too many discussion posts, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// XSS Protection middleware
export const xssProtection = (req, res, next) => {
  // Sanitize request body, query, and params
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      for (let key in obj) {
        if (typeof obj[key] === "string") {
          obj[key] = obj[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};

// Anti-screenshot headers (for sensitive pages)
export const preventScreenCapture = (req, res, next) => {
  if (req.path.includes("/exam") || req.path.includes("/course/content")) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
  }
  next();
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Basic security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );

  next();
};

// More sensitive endpoints (password reset, etc.)
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const skipAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Skip rate limiting for authenticated users
    if (req.user) {
      return 0; // 0 means no limit
    }
    // Apply limit for non-authenticated requests
    return 100;
  },
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  skip: (req) => {
    // Skip rate limiting entirely for authenticated users
    return !!req.user;
  },
});
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
