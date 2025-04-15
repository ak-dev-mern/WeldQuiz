import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  // Enhanced validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // Configure mail transport
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use 'gmail' service for automatic config
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Email options - modified to work with Gmail's restrictions
    const mailOptions = {
      from: `"Contact Form" <${process.env.MAIL_USER}>`, // Must be your authenticated email
      to: process.env.MAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
      replyTo: `${name} <${email}>`, // Replies will go to the submitter
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);

    // More specific error messages
    let errorMessage = "Failed to send message.";
    if (err.code === "EAUTH") {
      errorMessage = "Authentication failed. Check your email credentials.";
    } else if (err.code === "EENVELOPE") {
      errorMessage = "Invalid email address.";
    }

    res.status(500).json({ error: errorMessage });
  }
});

export default router;
