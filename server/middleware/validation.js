import { body, param, query, validationResult } from "express-validator";

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// ===== AUTH VALIDATIONS =====

export const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters"),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

export const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
];

export const validateResetPassword = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  handleValidationErrors,
];

export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  handleValidationErrors,
];

export const validateUpdateProfile = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be less than 500 characters"),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid website URL"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),
  handleValidationErrors,
];

// ===== COURSE VALIDATIONS =====

export const validateCourse = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ max: 100 })
    .withMessage("Course title must be less than 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Course description is required")
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("level")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Level must be beginner, intermediate, or advanced"),

  // FIXED PRICE VALIDATION
  body("price.monthly")
    .isFloat({ min: 0 })
    .withMessage("Monthly price must be 0 or a positive number"),

  body("price.yearly")
    .isFloat({ min: 0 })
    .withMessage("Yearly price must be 0 or a positive number"),

  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),

  body("language")
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage("Language must be a valid language code"),

  handleValidationErrors,
];

export const validateCourseUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Course title must be between 1 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),

  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Level must be beginner, intermediate, or advanced"),

  // FIXED PRICE UPDATE VALIDATION
  body("price.monthly")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Monthly price must be 0 or a positive number"),

  body("price.yearly")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Yearly price must be 0 or a positive number"),

  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),

  handleValidationErrors,
];


export const validateCourseId = [
  param("id").isMongoId().withMessage("Invalid course ID"),
  handleValidationErrors,
];

// ===== EXAM VALIDATIONS =====

export const validateExam = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Exam title is required")
    .isLength({ max: 200 })
    .withMessage("Exam title must be less than 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
  body("duration")
    .isInt({ min: 1, max: 480 })
    .withMessage("Duration must be between 1 and 480 minutes"),
  body("passingScore")
    .isInt({ min: 0, max: 100 })
    .withMessage("Passing score must be between 0 and 100"),
  body("questions")
    .isArray({ min: 1 })
    .withMessage("Exam must have at least one question"),
  body("questions.*.questionText")
    .trim()
    .notEmpty()
    .withMessage("Question text is required"),
  body("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("Each question must have at least 2 options"),
  body("questions.*.correctAnswer")
    .isInt({ min: 0 })
    .withMessage("Correct answer must be a valid option index"),
  handleValidationErrors,
];

// ===== PAYMENT VALIDATIONS =====

export const validatePayment = [
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("currency")
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),
  body("paymentMethod")
    .isIn(["card", "paypal", "bank_transfer"])
    .withMessage("Payment method must be card, paypal, or bank_transfer"),
  handleValidationErrors,
];

// ===== DISCUSSION VALIDATIONS =====

export const validateDiscussion = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Discussion title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Discussion content is required")
    .isLength({ max: 5000 })
    .withMessage("Content must be less than 5000 characters"),
  body("courseId").isMongoId().withMessage("Invalid course ID"),
  handleValidationErrors,
];

export const validateReply = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Reply content is required")
    .isLength({ max: 2000 })
    .withMessage("Reply must be less than 2000 characters"),
  body("discussionId").isMongoId().withMessage("Invalid discussion ID"),
  handleValidationErrors,
];

// ===== FEEDBACK VALIDATIONS =====

export const validateFeedback = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment must be less than 1000 characters"),
  body("courseId").isMongoId().withMessage("Invalid course ID"),
  handleValidationErrors,
];

// ===== USER VALIDATIONS =====

export const validateUserId = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  handleValidationErrors,
];

export const validateUserUpdate = [
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("username")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers"),
  body("role")
    .optional()
    .isIn(["user", "admin", "instructor"])
    .withMessage("Role must be user, admin, or instructor"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  handleValidationErrors,
];

// ===== QUERY PARAM VALIDATIONS =====

export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sort").optional().isString().withMessage("Sort must be a string"),
  handleValidationErrors,
];

export const validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  handleValidationErrors,
];

// ===== FILE UPLOAD VALIDATIONS =====

export const validateFileUpload = [
  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("File is required");
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error("Invalid file type. Allowed types: JPEG, PNG, GIF, PDF");
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    return true;
  }),
  handleValidationErrors,
];

// Export the main error handler
export { handleValidationErrors };
