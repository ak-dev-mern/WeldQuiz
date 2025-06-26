import express from "express";
import Question from "../models/Question.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import multer from "multer";
import { Op } from "sequelize";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import fs from "fs";
import sequelize from "sequelize";
import xlsx from "xlsx"; // Import the xlsx library for Excel parsing

const router = express.Router();

// Resolve the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up multer for file uploads with validation
const uploadPath = join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and Excel files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter,
});

// POST: Add a new question or batch of questions from an Excel file
router.post(
  "/createquestions",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      category,
      lesson,
      question,
      option1,
      option2,
      option3,
      option4,
      answer,
    } = req.body;

    if (req.files && req.files.excelFile) {
      // Handle Excel file upload
      const excelFile = req.files.excelFile[0];
      try {
        const workbook = xlsx.readFile(join(uploadPath, excelFile.filename));
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        for (const row of data) {
          const {
            category,
            lesson,
            question,
            option1,
            option2,
            option3,
            option4,
            answer,
          } = row;
          if (
            !category ||
            !lesson ||
            !question ||
            !option1 ||
            !option2 ||
            !option3 ||
            !option4 ||
            !answer
          ) {
            return res
              .status(400)
              .json({ error: "Missing required fields in Excel file" });
          }

          await Question.create({
            category,
            lesson,
            question,
            option1,
            option2,
            option3,
            option4,
            answer,
            image: null, // No image for Excel-based questions
          });
        }

        res.status(201).json({ message: "Questions added successfully!" });
      } catch (error) {
        res.status(500).json({
          error: "Failed to parse Excel file",
          details: error.message,
        });
      }
    } else {
      // Handle manual input
      if (
        !category ||
        !lesson ||
        !question ||
        !option1 ||
        !option2 ||
        !option3 ||
        !option4 ||
        !answer
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const image = req.file ? req.file.filename : null; // Use req.file for manual entry

      try {
        const newQuestion = await Question.create({
          category,
          lesson,
          question,
          option1,
          option2,
          option3,
          option4,
          answer,
          image,
        });

        res
          .status(201)
          .json({ message: "Question added successfully!", newQuestion });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to add question", details: error.message });
      }
    }
  }
);

// GET: Fetch all unique categories
router.get("/categories", authMiddleware, async (req, res) => {
  try {
    const categories = await Question.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("category")), "category"],
      ],
    });

    // Extract the category values from the result
    const categoryList = categories.map((cat) => cat.category);

    res.status(200).json(categoryList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET: Fetch all questions grouped by category and lesson with optional filters
router.get("/getquestions", authMiddleware, async (req, res) => {
  const { category, lesson, question, answer } = req.query;

  try {
    // Build the filter object dynamically
    const filters = {};

    if (category) {
      filters.category = {
        [Op.like]: `%${category}%`, // Partial match for category
      };
    }

    if (lesson) {
      filters.lesson = {
        [Op.like]: `%${lesson}%`, // Partial match for lesson
      };
    }

    if (question) {
      filters.question = {
        [Op.like]: `%${question}%`, // Partial match for question text
      };
    }

    if (answer) {
      filters.answer = {
        [Op.like]: `%${answer}%`, // Partial match for answer
      };
    }

    // Fetch filtered questions
    const questions = await Question.findAll({ where: filters });

    // Group questions by category -> lesson
    const grouped = questions.reduce((acc, question) => {
      const category = question?.category || "Uncategorized";
      const lesson = question?.lesson || "Unspecified Lesson";

      if (!acc[category]) acc[category] = {};
      if (!acc[category][lesson]) acc[category][lesson] = [];

      acc[category][lesson].push({
        id: question.id,
        question: question.question,
        option1: question.option1,
        option2: question.option2,
        option3: question.option3,
        option4: question.option4,
        answer: question.answer,
        imageUrl: question.image
          ? `${req.protocol}://${req.get("host")}/uploads/${question.image}`
          : null,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      });

      return acc;
    }, {});

    // Convert grouped object to array format
    const result = Object.entries(grouped).map(([category, lessonsObj]) => ({
      category,
      lessons: Object.entries(lessonsObj).map(([lesson, questions]) => ({
        lesson,
        questions,
      })),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching grouped questions:", error);
    res.status(500).json({
      error: "Failed to fetch grouped questions",
      details: error.message,
    });
  }
});

// GET: Fetch a single question by ID
router.get("/getquestion/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Include image URL if available
    const questionWithImageUrl = {
      ...question.toJSON(),
      imageUrl: question.image
        ? `${req.protocol}://${req.get("host")}/uploads/${question.image}`
        : null,
      createdAt: question.createdAt, // Include createdAt
      updatedAt: question.updatedAt, // Include updatedAt
    };

    res.status(200).json(questionWithImageUrl);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch question", details: error.message });
  }
});

// PUT: Update a question by ID with optional image upload
router.put(
  "/updatequestion/:id",
  authMiddleware,
  upload.single("image"), // Handle image upload
  async (req, res) => {
    const { id } = req.params;
    const {
      category,
      lesson,
      question,
      option1,
      option2,
      option3,
      option4,
      answer,
    } = req.body;

    try {
      // Find the question by ID
      const questionToUpdate = await Question.findByPk(id);
      if (!questionToUpdate) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Update question data
      questionToUpdate.category = category;
      questionToUpdate.lesson = lesson;
      questionToUpdate.question = question;
      questionToUpdate.option1 = option1;
      questionToUpdate.option2 = option2;
      questionToUpdate.option3 = option3;
      questionToUpdate.option4 = option4;
      questionToUpdate.answer = answer;

      // Update image if a new one is uploaded
      if (req.file) {
        questionToUpdate.image = req.file.filename;
      }

      // Save the updated question
      await questionToUpdate.save();

      // Include image URL in the response
      const updatedQuestionWithImageUrl = {
        ...questionToUpdate.toJSON(),
        imageUrl: questionToUpdate.image
          ? `${req.protocol}://${req.get("host")}/uploads/${
              questionToUpdate.image
            }`
          : null,
      };

      res.status(200).json({
        message: "Question updated successfully!",
        question: updatedQuestionWithImageUrl,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update question" });
    }
  }
);

// DELETE: Delete a question by ID
router.delete("/deletequestion/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const questionToDelete = await Question.findByPk(id);
    if (!questionToDelete) {
      return res.status(404).json({ error: "Question not found" });
    }

        // Delete associated image file if it exists
        if (questionToDelete.image) {
          const imagePath = path.join(uploadPath, questionToDelete.image);
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          } catch (err) {
            console.error("Failed to delete image file:", err.message);
            // Optional: continue even if file deletion fails
          }
        }
    

    await questionToDelete.destroy();
    res.status(200).json({ message: "Question deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export default router;
