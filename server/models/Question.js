import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lesson: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    option1: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    option2: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    option3: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    option4: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    answer: {
      type: DataTypes.TEXT, // Changed from ENUM to STRING
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    image: {
      type: DataTypes.STRING, // Filename or file path
      allowNull: true,
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
    indexes: [
      { fields: ["category"] },
      { fields: [{ name: "question", length: 191 }] },
      { fields: ["createdAt"] }, // Useful for sorting new questions
    ],
    tableName: "questions",
  }
);

export default Question;
