import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment variables");
  throw new Error("Missing JWT_SECRET in environment variables");
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      error:
        "Access denied. Authorization header must be in 'Bearer <token>' format.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = decoded.exp - currentTime;
    res.setHeader("X-Token-Expires-In", remainingTime);

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    const message =
      error.name === "TokenExpiredError"
        ? "Token has expired, please login again"
        : "Invalid or missing token. Please register or log in.";
    return res.status(401).json({ error: message });
  }
};

export default authMiddleware;
