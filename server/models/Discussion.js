import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Discussion = sequelize.define(
  "Discussion",
  {
    discussion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING, // Filename or file path
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER, // No UNSIGNED to match Users.id if it's signed
      allowNull: false,
      references: {
        model: "users", // Make sure this matches your actual table/model name
        key: "id",
      },
    },
    created_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "discussions",
  }
);

// Association
Discussion.associate = (models) => {
  Discussion.belongsTo(models.User, {
    foreignKey: "created_by",
    targetKey: "id",
    as: "creator", // optional alias
  });
};

export default Discussion;
