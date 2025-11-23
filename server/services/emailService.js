import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async (emailOptions) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Learning Platform" <${process.env.EMAIL_USER}>`,
      ...emailOptions,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to Learning Platform!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Learning Platform!</h2>
      <p>Hello ${user.profile?.firstName || user.username},</p>
      <p>Thank you for joining our learning community. We're excited to have you on board!</p>
      <p>Get started by exploring our courses and begin your learning journey.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/courses" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Browse Courses
        </a>
      </div>
      <p>Best regards,<br>The Learning Platform Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const subject = "Password Reset Request";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Hello ${user.profile?.firstName || user.username},</p>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The Learning Platform Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};

export const sendCourseEnrollmentEmail = async (user, course) => {
  const subject = `You've been enrolled in ${course.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Course Enrollment Confirmation</h2>
      <p>Hello ${user.profile?.firstName || user.username},</p>
      <p>You have been successfully enrolled in the course:</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #1f2937;">${course.title}</h3>
        <p style="margin: 10px 0 0 0; color: #6b7280;">${course.category} • ${
    course.level
  }</p>
      </div>
      <p>You can now access all course materials and start learning immediately.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/courses/${course._id}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Start Learning
        </a>
      </div>
      <p>Best regards,<br>The Learning Platform Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};

export const sendExamResultEmail = async (user, examResult, course) => {
  const subject = `Exam Result for ${course.title}`;
  const passed = examResult.passed;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${passed ? "#16a34a" : "#dc2626"};">Exam Result</h2>
      <p>Hello ${user.profile?.firstName || user.username},</p>
      <p>Your exam result for <strong>${course.title}</strong> is ready:</p>
      
      <div style="background-color: ${passed ? "#f0fdf4" : "#fef2f2"}; 
                  padding: 20px; border-radius: 8px; margin: 20px 0; 
                  border-left: 4px solid ${passed ? "#16a34a" : "#dc2626"};">
        <h3 style="margin: 0; color: ${passed ? "#166534" : "#991b1b"};">
          ${passed ? "🎉 Congratulations! You Passed!" : "📝 Keep Practicing!"}
        </h3>
        <div style="margin-top: 15px;">
          <p style="margin: 5px 0;"><strong>Score:</strong> ${
            examResult.score
          }/${examResult.totalMarks}</p>
          <p style="margin: 5px 0;"><strong>Percentage:</strong> ${examResult.percentage.toFixed(
            1
          )}%</p>
          <p style="margin: 5px 0;"><strong>Time Spent:</strong> ${Math.floor(
            examResult.timeSpent / 60
          )}:${(examResult.timeSpent % 60).toString().padStart(2, "0")}</p>
          <p style="margin: 5px 0;"><strong>Passing Percentage:</strong> ${
            examResult.passingPercentage
          }%</p>
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/exam-result/${examResult._id}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          View Detailed Results
        </a>
      </div>
      
      <p>Best regards,<br>The Learning Platform Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};
