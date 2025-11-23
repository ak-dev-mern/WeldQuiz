import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        timeSpent: Number, // in seconds
        questionSnapshot: {
          // Store question at time of exam
          question: String,
          options: [String],
          correctAnswer: mongoose.Schema.Types.Mixed,
          marks: Number,
          difficulty: String,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeSpent: {
      // in seconds
      type: Number,
      required: true,
    },
    timeLimit: {
      // in seconds
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    passingPercentage: {
      type: Number,
      default: 70,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    ipAddress: String,
    deviceInfo: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
examResultSchema.index({ user: 1, course: 1 });
examResultSchema.index({ user: 1, completedAt: -1 });
examResultSchema.index({ course: 1, unit: 1 });
examResultSchema.index({ passed: 1 });

// Virtual for duration
examResultSchema.virtual("duration").get(function () {
  return this.completedAt - this.startedAt;
});

// Method to calculate detailed analytics
examResultSchema.methods.getAnalytics = function () {
  const totalQuestions = this.answers.length;
  const correctAnswers = this.answers.filter((a) => a.isCorrect).length;
  const easyQuestions = this.answers.filter(
    (a) => a.questionSnapshot.difficulty === "easy"
  ).length;
  const mediumQuestions = this.answers.filter(
    (a) => a.questionSnapshot.difficulty === "medium"
  ).length;
  const hardQuestions = this.answers.filter(
    (a) => a.questionSnapshot.difficulty === "hard"
  ).length;

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers: totalQuestions - correctAnswers,
    accuracy: (correctAnswers / totalQuestions) * 100,
    difficultyBreakdown: { easyQuestions, mediumQuestions, hardQuestions },
    averageTimePerQuestion: this.timeSpent / totalQuestions,
  };
};

export default mongoose.model("ExamResult", examResultSchema);
