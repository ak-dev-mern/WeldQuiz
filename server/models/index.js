import sequelize from "../config/database.js";
import User from "./User.js";
import Discussion from "./Discussion.js";
import Message from "./Message.js";
import Plan from "./Plan.js";

// -- DISCUSSIONS + MESSAGES
User.hasMany(Discussion, { foreignKey: "created_by" });
Discussion.belongsTo(User, { foreignKey: "created_by" });

Discussion.hasMany(Message, { foreignKey: "discussionId", as: "messages" });
Message.belongsTo(Discussion, { foreignKey: "discussionId", as: "discussion" });

User.hasMany(Message, { foreignKey: "senderId" }); // ✅ Correct key
Message.belongsTo(User, { foreignKey: "senderId" }); // ✅ Correct key

// -- PLANS, SUBSCRIPTIONS, PAYMENTS

// -- EXPORT ALL MODELS + SEQUELIZE INSTANCE
export default {
  sequelize,
  User,
  Plan,
  Discussion,
  Message,
};
