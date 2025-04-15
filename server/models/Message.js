import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Message = sequelize.define(
  "Message",
  {
    message_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sendername: {
      type: DataTypes.STRING,
      allowNull: false, // You can adjust this if you want it to be optional
    },
    discussionId: {
      type: DataTypes.INTEGER, // Changed to match discussion_id's data type
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "Messages", // Optional but good practice
  }
);

// Associations
Message.associate = (models) => {
  // Foreign Key to Users table (senderId)
  Message.belongsTo(models.User, {
    foreignKey: "senderId",
    targetKey: "id",
    as: "sender", // Optional alias for association
  });

  // Foreign Key to Discussions table (discussionId)
  Message.belongsTo(models.Discussion, {
    foreignKey: "discussionId",
    targetKey: "discussion_id",
    as: "discussion", // Optional alias for association
  });
};

export default Message;
