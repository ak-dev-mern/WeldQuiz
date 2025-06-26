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

  // 1. Check if Authorization header is present and formatted correctly
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      error:
        "Access denied. Authorization header must be in 'Bearer <token>' format.",
    });
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1];

  // 3. Basic format validation (must be 3 parts)
  if (!token || token.split(".").length !== 3) {
    console.error("Malformed token received:", token);
    return res.status(400).json({
      error: "Malformed token received. Please log in again.",
    });
  }

  try {
    // 5. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // 6. Optional: Calculate and send time remaining
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = decoded.exp - currentTime;
    res.setHeader("X-Token-Expires-In", remainingTime);

    // 7. Log user info
    console.log("Authenticated user:", decoded.username || decoded.id);

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
