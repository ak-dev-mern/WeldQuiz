// seedAdmin-fixed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Use the EXACT same password hashing as your registration
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash("123456", 10);

    console.log("🔑 Generated password hash:", hashedPassword);

    // Create user with ALL required fields
    const adminData = {
      username: "weldquiz",
      email: "weldquiz@gmail.com",
      password: hashedPassword,
      profile: {
        firstName: "WeldQuiz",
        lastName: "Admin",
        bio: "",
        phone: "",
        location: "",
        website: "",
      },
      role: "admin",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      loginSessions: [],
      coursesEnrolled: [],
      coursesCompleted: 0,
      lastActive: new Date(),
    };

    // Use findOneAndUpdate with upsert to handle both create and update
    const user = await User.findOneAndUpdate(
      { email: "weldquiz@gmail.com" },
      { $set: adminData },
      {
        upsert: true,
        new: true,
        runValidators: true, // This will show any schema validation errors
      }
    );

    console.log("✅ Admin user created/updated successfully!");
    console.log("📧 Email: weldquiz@gmail.com");
    console.log("🔑 Password: 123456");
    console.log("👑 Role: admin");
    console.log("🆔 User ID:", user._id);

    // Verify the user can be found and has correct data
    const verifiedUser = await User.findOne({
      email: "weldquiz@gmail.com",
    }).select("+password");
    console.log("🔍 Verification - User found:", !!verifiedUser);
    console.log("🔍 Verification - Password set:", !!verifiedUser.password);
    console.log("🔍 Verification - Role:", verifiedUser.role);
  } catch (error) {
    console.error("❌ Error creating admin user:");
    console.error("   Message:", error.message);

    if (error.name === "ValidationError") {
      console.error("   Validation errors:");
      Object.keys(error.errors).forEach((field) => {
        console.error("   -", field + ":", error.errors[field].message);
      });
    }

    console.error("   Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  }
};

createAdminUser();
