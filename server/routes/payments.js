import express from "express";
import { authenticate } from "../middleware/auth.js";
import { cancelSubscription, createSubscription, getPaymentHistory, getSubscriptionStatus, handleStripeWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// Protected routes
router.post("/create-subscription", authenticate, createSubscription);
router.post("/cancel-subscription", authenticate, cancelSubscription);
router.get("/history", authenticate, getPaymentHistory);
router.get("/subscription-status", authenticate, getSubscriptionStatus);
router.post("/webhook", handleStripeWebhook); // Webhook doesn't need authentication

export default router;
