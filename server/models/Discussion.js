import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
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
          maxlength: 2000,
        },
        isInstructorReply: {
          type: Boolean,
          default: false,
        },
        upvotes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        downvotes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
discussionSchema.index({ course: 1, unit: 1, createdAt: -1 });
discussionSchema.index({ user: 1 });
discussionSchema.index({ isPinned: -1, createdAt: -1 });
discussionSchema.index({ isResolved: 1 });
discussionSchema.index({ tags: 1 });

// Virtual for vote count
discussionSchema.virtual("voteCount").get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual for reply count
discussionSchema.virtual("replyCount").get(function () {
  return this.replies.length;
});

// Method to check if user has voted
discussionSchema.methods.hasUserVoted = function (userId) {
  return this.upvotes.includes(userId) || this.downvotes.includes(userId);
};

// Method to add view
discussionSchema.methods.addView = function () {
  this.views += 1;
  return this.save();
};

export default mongoose.model("Discussion", discussionSchema);
