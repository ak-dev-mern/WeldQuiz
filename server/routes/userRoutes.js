import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { Op } from "sequelize";

dotenv.config();
const router = express.Router();

// POST: Register a new user
router.post("/register", async (req, res) => {
  const {
    username,
    password,
    fullName,
    age,
    email,
    phone,
    country,
    city,
    address,
    role,
  } = req.body;

  if (
    !username ||
    !password ||
    !fullName ||
    !age ||
    !email ||
    !phone ||
    !country ||
    !city ||
    !address
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      fullName,
      age,
      email,
      phone,
      country,
      city,
      address,
      role: role || "student",
    });

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// POST: Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    // General error message for invalid credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT with user details
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send the token and user info back to the client
    res.status(200).json({
      token,
      username: user.username,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// GET: Fetch users with filters
router.get("/getusers", authMiddleware, async (req, res) => {
  const { username, fullName, email, phone, city, country, address } =
    req.query;

  try {
    const whereConditions = {};

    if (username) whereConditions.username = { [Op.like]: `%${username}%` };
    if (fullName) whereConditions.fullName = { [Op.like]: `%${fullName}%` };
    if (email) whereConditions.email = { [Op.like]: `%${email}%` };
    if (phone) whereConditions.phone = { [Op.like]: `%${phone}%` };
    if (city) whereConditions.city = { [Op.like]: `%${city}%` };
    if (country) whereConditions.country = { [Op.like]: `%${country}%` };
    if (address) whereConditions.address = { [Op.like]: `%${address}%` };

    const users = await User.findAll({
      where: whereConditions,
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
});

// GET: Fetch user by ID (Only owner or admin)
router.get("/getusers/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin" && req.user.id != id) {
    return res.status(403).json({ error: "Access denied." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PUT: Update user details
router.put("/updateuser/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { fullName, age, email, phone, country, city, address, password } =
    req.body;

  if (req.user.role !== "admin" && req.user.id != id) {
    return res.status(403).json({ error: "Access denied." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.age = age || user.age;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.country = country || user.country;
    user.city = city || user.city;
    user.address = address || user.address;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    // // Update only the fields provided in updateData
    // Object.keys(updateData).forEach((key) => {
    //   user[key] = updateData[key];
    // });

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE: Delete user (Admin only)
router.delete("/deleteuser/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
