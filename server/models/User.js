import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: { type: String, maxlength: 500 },
      phone: String,
      location: String,
      website: String,
    },
    subscription: {
      type: {
        type: String,
        enum: ["monthly", "yearly", "none"],
        default: "none",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "inactive",
      },
      startDate: Date,
      endDate: Date,
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    loginSessions: [
      {
        token: String,
        device: String,
        ip: String,
        createdAt: { type: Date, default: Date.now, expires: "7d" },
      },
    ],
    coursesEnrolled: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        completed: { type: Boolean, default: false },
        enrolledAt: { type: Date, default: Date.now },
        completedAt: Date,
        lastAccessed: Date,
      },
    ],
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },

    // Add points and gamification system
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievements: [
      {
        name: {
          type: String,
          required: true,
        },
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        icon: String,
        points: {
          type: Number,
          default: 0,
        },
        category: {
          type: String,
          enum: ["learning", "social", "completion", "mastery", "streak"],
          default: "learning",
        },
      },
    ],
    badges: [
      {
        name: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        icon: String,
        tier: {
          type: String,
          enum: ["bronze", "silver", "gold", "platinum"],
          default: "bronze",
        },
      },
    ],
    streak: {
      current: {
        type: Number,
        default: 0,
        min: 0,
      },
      longest: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastActivity: Date,
    },
    learningStats: {
      totalTimeSpent: {
        // in minutes
        type: Number,
        default: 0,
        min: 0,
      },
      examsCompleted: {
        type: Number,
        default: 0,
        min: 0,
      },
      examsPassed: {
        type: Number,
        default: 0,
        min: 0,
      },
      coursesCompleted: {
        type: Number,
        default: 0,
        min: 0,
      },
      feedbackGiven: {
        type: Number,
        default: 0,
        min: 0,
      },
      discussionsParticipated: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      showProgress: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "en",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ "subscription.status": 1 });
userSchema.index({ "coursesEnrolled.course": 1 });
userSchema.index({ points: -1 });
userSchema.index({ level: -1 });
userSchema.index({ "learningStats.totalTimeSpent": -1 });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.loginSessions;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

// Method to add points and check level up
userSchema.methods.addPoints = function (
  pointsToAdd,
  activityType = "general"
) {
  this.points += pointsToAdd;
  this.experience += pointsToAdd;

  // Check for level up (1000 XP per level)
  const newLevel = Math.floor(this.experience / 1000) + 1;
  if (newLevel > this.level && newLevel <= 100) {
    this.level = newLevel;
    return { leveledUp: true, newLevel };
  }

  return { leveledUp: false, currentLevel: this.level };
};

// Method to update streak
userSchema.methods.updateStreak = function () {
  const now = new Date();
  const lastActivity = this.streak.lastActivity;

  if (!lastActivity) {
    // First activity
    this.streak.current = 1;
    this.streak.lastActivity = now;
    return 1;
  }

  const daysSinceLastActivity = Math.floor(
    (now - lastActivity) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActivity === 0) {
    // Already updated today
    return this.streak.current;
  } else if (daysSinceLastActivity === 1) {
    // Consecutive day
    this.streak.current += 1;
  } else {
    // Streak broken
    this.streak.current = 1;
  }

  // Update longest streak if current is longer
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }

  this.streak.lastActivity = now;
  return this.streak.current;
};

// Method to add achievement
userSchema.methods.addAchievement = function (achievementData) {
  const existingAchievement = this.achievements.find(
    (a) => a.name === achievementData.name
  );

  if (!existingAchievement) {
    this.achievements.push(achievementData);

    // Add achievement points to total points
    if (achievementData.points) {
      this.points += achievementData.points;
      this.experience += achievementData.points;
    }

    return true; // New achievement added
  }

  return false; // Achievement already exists
};

// Method to update learning stats
userSchema.methods.updateLearningStats = function (statsUpdate) {
  if (statsUpdate.timeSpent) {
    this.learningStats.totalTimeSpent += statsUpdate.timeSpent;
  }
  if (statsUpdate.examsCompleted) {
    this.learningStats.examsCompleted += statsUpdate.examsCompleted;
  }
  if (statsUpdate.examsPassed) {
    this.learningStats.examsPassed += statsUpdate.examsPassed;
  }
  if (statsUpdate.coursesCompleted) {
    this.learningStats.coursesCompleted += statsUpdate.coursesCompleted;
  }
  if (statsUpdate.feedbackGiven) {
    this.learningStats.feedbackGiven += statsUpdate.feedbackGiven;
  }
  if (statsUpdate.discussionsParticipated) {
    this.learningStats.discussionsParticipated +=
      statsUpdate.discussionsParticipated;
  }
};

// Static method to find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function (limit = 10, criteria = "points") {
  const sortCriteria = {};
  sortCriteria[criteria] = -1;

  return this.find({ isActive: true })
    .select("username profile points level learningStats streak")
    .sort(sortCriteria)
    .limit(limit);
};

// Virtual for completion rate
userSchema.virtual("completionRate").get(function () {
  const totalExams = this.learningStats.examsCompleted;
  const passedExams = this.learningStats.examsPassed;
  return totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
});

// Virtual for next level progress
userSchema.virtual("nextLevelProgress").get(function () {
  const currentLevelXP = (this.level - 1) * 1000;
  const xpInCurrentLevel = this.experience - currentLevelXP;
  return (xpInCurrentLevel / 1000) * 100;
});

// Virtual for average exam score (if we had exam data)
userSchema.virtual("averageScore").get(function () {
  // This would need to be calculated from actual exam results
  return 0;
});

export default mongoose.model("User", userSchema);
