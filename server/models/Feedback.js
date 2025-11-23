import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["course", "platform", "feature"],
      default: "course",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    helpful: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        isHelpful: {
          type: Boolean,
          required: true,
        },
      },
    ],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 500,
        },
        isInstructorReply: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
feedbackSchema.index({ course: 1, createdAt: -1 });
feedbackSchema.index({ user: 1, course: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ status: 1 });

// Virtual for helpful count
feedbackSchema.virtual("helpfulCount").get(function () {
  return this.helpful.filter((h) => h.isHelpful).length;
});

// Virtual for not helpful count
feedbackSchema.virtual("notHelpfulCount").get(function () {
  return this.helpful.filter((h) => !h.isHelpful).length;
});

// Virtual for reply count
feedbackSchema.virtual("replyCount").get(function () {
  return this.replies.length;
});

// Method to check if user has voted
feedbackSchema.methods.hasUserVoted = function (userId) {
  return this.helpful.some((h) => h.user.toString() === userId.toString());
};

// Method to add helpful vote
feedbackSchema.methods.addHelpfulVote = function (userId, isHelpful) {
  // Remove existing vote
  this.helpful = this.helpful.filter(
    (h) => h.user.toString() !== userId.toString()
  );

  // Add new vote
  this.helpful.push({
    user: userId,
    isHelpful,
  });
};

// Static method to get course average rating
feedbackSchema.statics.getCourseAverageRating = function (courseId) {
  return this.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);
};

export default mongoose.model("Feedback", feedbackSchema);
