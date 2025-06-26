import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import questionRoutes from "./routes/questionsRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import db from "./models/index.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const port = Number(process.env.SERVER_PORT) || 5000;
const host = process.env.DB_HOST;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Normal middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);

// Sync and start
db.sequelize
  .sync()
  .then(() => {
    console.log("✅ Database synced successfully.");
    app.listen(port, () => {
      console.log(`🚀 Server is running on ${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error syncing database:", error);
  });

process.on("SIGINT", async () => {
  try {
    await sequelize.close();
    console.log("🔌 Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
    setTimeout(() => process.exit(1), 5000);
  }
});
