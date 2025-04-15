import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Ensure your Sequelize instance is imported

const Feedback = sequelize.define(
  "Feedback",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // This should match the table name for users
        key: "id",
      },
      onDelete: "CASCADE", // Ensures feedback is deleted when user is deleted
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }, // Rating should be between 1 and 5
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
    tableName: "feedbacks", // Explicitly setting table name
  }
);

export default Feedback;
