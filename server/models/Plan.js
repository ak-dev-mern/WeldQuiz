import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Plan = sequelize.define(
  "Plan",
  {
    plan_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    plan_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    billing_cycle: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
features: {
  type: DataTypes.TEXT,
  allowNull: true,
  get() {
    const raw = this.getDataValue("features");
    return raw ? JSON.parse(raw) : null;
  },
  set(value) {
    this.setDataValue("features", JSON.stringify(value));
  },
},
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "plans",
    timestamps: false,
  }
);

export default Plan;
