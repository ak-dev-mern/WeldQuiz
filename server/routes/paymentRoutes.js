import express from "express";
import Stripe from "stripe";
import Plan from "../models/Plan.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// ✅ Get all available plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.findAll();
    if (!plans || plans.length === 0) {
      return res.status(404).json({ error: "No plans found" });
    }
    res.json(plans);
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// ✅ Create a Stripe Checkout session

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  const { planId, planName, price } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Validate input
  if (!planId || !planName || !price || isNaN(price)) {
    return res.status(400).json({
      error: "Missing or invalid parameters",
      required: ["planId", "planName", "price (number)"],
    });
  }

  try {
    // Convert price to paise and validate
    const unit_amount = Math.round(parseFloat(price) * 100);
    if (unit_amount < 50) {
      return res.status(400).json({ error: "Amount must be at least ₹0.50" });
    }

    // Create session with enhanced error handling
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: planName },
            unit_amount: unit_amount,
            recurring: { interval: "year" },
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: { planId, userId },
      success_url: `${process.env.CLIENT_URL}/student/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/student/payment-cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Detailed Stripe error:", {
      message: error.message,
      type: error.type,
      stack: error.stack,
    });

    res.status(400).json({
      error: "Checkout session creation failed",
      details: error.raw ? error.raw.message : error.message,
      code: error.code,
    });
  }
});

// routes/payment.js
router.get("/session/:sessionId", async (req, res) => {
  try {
    // Retrieve the Stripe session details and expand line items
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
      {
        expand: ["line_items.data.price.product"],
      }
    );

    // Retrieve the invoice details
    const invoice = await stripe.invoices.retrieve(session.invoice);

    // Extract the plan name from the session or line items
    const lineItem = session.line_items?.data[0];
    const planName =
      lineItem?.price?.product?.name || session.metadata.planName;

    // Respond with session details, including the invoice URL and PDF URL
    res.json({
      transactionId: invoice.id, // Transaction ID
      amount: invoice.amount_paid / 100, // Paid amount (converted from cents to currency)
      plan: planName || "N/A", // Plan name
      username: session.metadata.username, // Username from session metadata
      invoiceUrl: invoice.hosted_invoice_url, // Link to the hosted invoice on Stripe
      invoicePdf: invoice.invoice_pdf, // Direct PDF URL for downloading the invoice
    });
  } catch (error) {
    console.error("Error retrieving session details:", error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

const getStripeCustomerId = async (email) => {
  try {
    // Search for the customer in Stripe by email
    const customers = await stripe.customers.list({
      email: email,
    });

    if (customers.data.length > 0) {
      return customers.data[0].id; // Return the first match (Stripe might have more than one customer with the same email)
    } else {
      throw new Error("Customer not found in Stripe");
    }
  } catch (error) {
    console.error("Error fetching customer ID from Stripe:", error);
    throw new Error("Failed to retrieve Stripe customer ID");
  }
};

router.get("/subscription-status", authMiddleware, async (req, res) => {
  try {
    // Step 1: Check if the user email exists
    const userEmail = req.user?.email;
    console.log(userEmail);

    if (!userEmail) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Step 2: Get Stripe customer ID
    const stripeCustomerId = await getStripeCustomerId(userEmail);
    if (!stripeCustomerId) {
      return res.status(400).json({ error: "Stripe customer ID not found" });
    }

    // Step 3: Fetch subscription list
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      expand: ["data.items.data.price"],
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: "No subscriptions found" });
    }

    // Step 4: Format subscription data
    const subscriptionData = subscriptions.data
      .map((subscription) => {
        const startDate = new Date(subscription.start_date * 1000); // Convert to milliseconds

        let productName = "N/A";

        // Handle missing or zero `end_date`
        let endDate = null;

        // If there's no end_date, calculate it from the billing_cycle_anchor and plan's interval
        if (subscription.end_date) {
          endDate = new Date(subscription.end_date * 1000);
        } else {
          // Check the interval (if available) to calculate the end date
          const interval = subscription.items?.data[0]?.plan?.interval; // e.g., "month", "year"
          const billingCycleAnchor = subscription.billing_cycle_anchor;

          if (interval && billingCycleAnchor) {
            const cycleStartDate = new Date(billingCycleAnchor * 1000);
            endDate = new Date(cycleStartDate);

            // Add one interval to the start date (e.g., for monthly, add 1 month)
            if (interval === "month") {
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (interval === "year") {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              // Default case if the interval is not "month" or "year"
              endDate = null; // Set to null if no interval is found
            }
          }
        }

        // Check if startDate or endDate are invalid
        if (
          isNaN(startDate.getTime()) ||
          (endDate && isNaN(endDate.getTime()))
        ) {
          console.error("Invalid date values", {
            start_date: subscription.start_date,
            end_date: subscription.end_date,
          });
          return null; // Skip this subscription if dates are invalid
        }

        return {
          id: subscription.id,
          status: subscription.status,
          plan: productName,
          startDate: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : null, // If endDate is available, include it
        };
      })
      .filter(Boolean); // Remove any invalid subscriptions from the array

    // Return subscription data
    res.json({
      hasSubscription: subscriptionData.length > 0,
      subscriptions: subscriptionData, // Return all subscriptions
    });
  } catch (error) {
    console.error("🔥 Error retrieving subscription data:", error.message);
    res.status(500).json({
      error: "Failed to fetch subscription data",
      details: error.message,
    });
  }
});

export default router;
