import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "exam_started",
        "exam_completed",
        "exam_passed",
        "exam_failed",
        "course_enrolled",
        "course_completed",
        "lesson_completed",
        "feedback_submitted",
        "discussion_created",
        "discussion_replied",
        "profile_updated",
        "certificate_earned",
      ],
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamResult",
    },
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
    },
    metadata: mongoose.Schema.Types.Mixed,
    description: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ course: 1, type: 1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ user: 1, type: 1 });

// Pre-save middleware to generate description
activitySchema.pre("save", function (next) {
  if (!this.description) {
    this.description = this.generateDescription();
  }
  next();
});

// Method to generate activity description
activitySchema.methods.generateDescription = function () {
  const descriptions = {
    exam_started: "Started an exam",
    exam_completed: "Completed an exam",
    exam_passed: "Passed an exam",
    exam_failed: "Failed an exam",
    course_enrolled: "Enrolled in a course",
    course_completed: "Completed a course",
    lesson_completed: "Completed a lesson",
    feedback_submitted: "Submitted feedback",
    discussion_created: "Created a discussion",
    discussion_replied: "Replied to a discussion",
    profile_updated: "Updated profile",
    certificate_earned: "Earned a certificate",
  };

  return descriptions[this.type] || "Performed an activity";
};

// Static method to get user activity summary
activitySchema.statics.getUserActivitySummary = function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        lastActivity: { $max: "$createdAt" },
      },
    },
    {
      $project: {
        type: "$_id",
        count: 1,
        lastActivity: 1,
        _id: 0,
      },
    },
  ]);
};

// Static method to get course engagement
activitySchema.statics.getCourseEngagement = function (courseId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          type: "$type",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.type",
        dailyActivity: {
          $push: {
            date: "$_id.date",
            count: "$count",
          },
        },
        total: { $sum: "$count" },
      },
    },
    {
      $project: {
        type: "$_id",
        dailyActivity: 1,
        total: 1,
        _id: 0,
      },
    },
  ]);
};

export default mongoose.model("Activity", activitySchema);
