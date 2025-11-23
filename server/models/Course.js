import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  questionType: {
    type: String,
    enum: ["multiple_choice", "true_false", "short_answer"],
    default: "multiple_choice",
  },
  options: [
    {
      type: String,
      trim: true,
    },
  ],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  explanation: {
    type: String,
    trim: true,
  },
  image: String,
  marks: {
    type: Number,
    default: 1,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  timeLimit: {
    // in seconds
    type: Number,
    default: 60,
  },
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  videoUrl: String,
  duration: {
    // in minutes
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    required: true,
  },
  resources: [
    {
      title: String,
      url: String,
      type: String,
    },
  ],
  isFree: {
    type: Boolean,
    default: false,
  },
});

const unitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  order: {
    type: Number,
    required: true,
  },
  lessons: [lessonSchema],
  questions: [questionSchema],
  duration: {
    // in minutes
    type: Number,
    default: 0,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: String,
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      monthly: {
        type: Number,
        required: true,
        min: 0,
      },
      yearly: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    image: {
      type: String,
      required: true,
    },
    thumbnail: String,
    duration: {
      // total hours
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    units: [unitSchema],
    tags: [String],
    requirements: [String],
    learningOutcomes: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    maxStudents: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ category: 1, isActive: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ "price.monthly": 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
courseSchema.pre("save", function (next) {
  this.totalLessons = this.units.reduce(
    (total, unit) => total + unit.lessons.length,
    0
  );
  this.totalQuestions = this.units.reduce(
    (total, unit) => total + unit.questions.length,
    0
  );

  // Calculate average rating
  if (this.ratings.length > 0) {
    this.averageRating =
      this.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
      this.ratings.length;
  }

  next();
});

// Method to get course progress for a user
courseSchema.methods.getUserProgress = function (userId) {
  // This would be implemented based on user's progress tracking
  return 0;
};

// Static method to get popular courses
courseSchema.statics.getPopularCourses = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ averageRating: -1, totalStudents: -1 })
    .limit(limit)
    .populate("instructor", "username profile");
};

export default mongoose.model("Course", courseSchema);
