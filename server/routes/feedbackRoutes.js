import express from "express";
import cors from "cors";
import { body, param, validationResult } from "express-validator";
import Feedback from "../models/Feedback.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // Middleware for auth

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 Get All Feedbacks (for admin - all at once)
app.get("/getfeedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json({ feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// 🟢 Submit Feedback (Any logged-in user)
app.post(
  "/postfeedbacks",
  authMiddleware,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("feedback").notEmpty().withMessage("Feedback cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { rating, feedback } = req.body;
      const newFeedback = await Feedback.create({
        user_id: req.user.id,
        username: req.user.username,
        rating,
        feedback,
      });

      res.status(201).json(newFeedback);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// // 🟢 Edit Feedback (Only Admin)
// app.put("/updatefeedbacks/:id", authMiddleware, async (req, res) => {
//   try {
//     const feedback = await Feedback.findByPk(req.params.id);
//     if (!feedback) return res.status(404).json({ message: "Feedback not found" });

//     await feedback.update(req.body);
//     res.json(feedback);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// 🟢 Delete Feedback (Admin OR Feedback Owner)
app.delete("/deletefeedbacks/:id", authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    if (req.user.role !== "admin" && req.user.id !== feedback.user_id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this feedback" });
    }

    await feedback.destroy();
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;


// 🟢 Get paginated feedbacks by logged-in user
app.get("/myfeedbacks", authMiddleware, async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const offset = (page - 1) * limit;

    const { rows: feedbacks, count: total } = await Feedback.findAndCountAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({ feedbacks, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
