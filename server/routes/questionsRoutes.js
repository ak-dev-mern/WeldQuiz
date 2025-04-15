import express from "express";
import Question from "../models/Question.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import multer from "multer";
import { Op } from "sequelize";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
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
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB file size limit
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
    const { category, question, option1, option2, option3, option4, answer } =
      req.body;

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
            question,
            option1,
            option2,
            option3,
            option4,
            answer,
          } = row;
          if (
            !category ||
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

// GET: Fetch all questions grouped by category with optional filters
router.get("/getquestions", authMiddleware, async (req, res) => {
  const { category, question, answer } = req.query;

  try {
    // Build the filter object dynamically
    const filters = {};

    if (category) {
      filters.category = {
        [Op.like]: `%${category}%`, // Partial match for category
      };
    }

    if (question) {
      filters.question = {
        [Op.like]: `%${question}%`, // Partial match for question
      };
    }

    if (answer) {
      filters.answer = {
        [Op.like]: `%${answer}%`, // Partial match for answer
      };
    }

    // Fetch filtered questions
    const questions = await Question.findAll({ where: filters });

    // Group questions by category
    const groupedQuestions = questions.reduce((acc, question) => {
      const category = question.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
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
        createdAt: question.createdAt, // Include createdAt
        updatedAt: question.updatedAt, // Include updatedAt
      });
      return acc;
    }, {});

    // Convert the grouped object into an array of categories with nested questions
    const result = Object.keys(groupedQuestions).map((category) => ({
      category,
      questions: groupedQuestions[category],
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions" });
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
    const { category, question, option1, option2, option3, option4, answer } =
      req.body;

    try {
      // Find the question by ID
      const questionToUpdate = await Question.findByPk(id);
      if (!questionToUpdate) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Update question data
      questionToUpdate.category = category;
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

    await questionToDelete.destroy();
    res.status(200).json({ message: "Question deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export default router;
