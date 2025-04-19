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
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.warn("No Stripe customer found for email:", email);
      return null;
    }

    return customers.data[0].id;
  } catch (err) {
    console.error("Error fetching Stripe customer:", err.message);
    return null;
  }
};

router.get("/subscription-status", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const stripeCustomerId = await getStripeCustomerId(userEmail);
    if (!stripeCustomerId) {
      console.log("No Stripe customer found for:", userEmail);
      return res.json({ hasSubscription: false, subscriptions: [] });
    }

    // Get all subscriptions with price info
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      expand: ["data.items.data.price"],
    });

    // Create a product name cache to avoid redundant fetches
    const productCache = new Map();

    // Step 4: Format subscriptions
    const subscriptionData = await Promise.all(
      subscriptions.data.map(async (subscription) => {
        const item = subscription.items?.data[0];
        const price = item?.price;
        const productId = price?.product;

        let productName = "N/A";
        if (productId) {
          if (productCache.has(productId)) {
            productName = productCache.get(productId);
          } else {
            try {
              const product = await stripe.products.retrieve(productId);
              productName = product.name;
              productCache.set(productId, productName);
            } catch (err) {
              console.error(
                "⚠️ Failed to retrieve product:",
                productId,
                err.message
              );
            }
          }
        }

        const startDate = new Date(subscription.start_date * 1000);
        let endDate = null;
        const interval = price?.recurring?.interval;
        const billingCycleAnchor = subscription.billing_cycle_anchor;

        if (subscription.ended_at) {
          endDate = new Date(subscription.ended_at * 1000);
        } else if (interval && billingCycleAnchor) {
          endDate = new Date(billingCycleAnchor * 1000);
          if (interval === "month") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (interval === "year") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }
        }

        if (
          isNaN(startDate.getTime()) ||
          (endDate && isNaN(endDate.getTime()))
        ) {
          console.error("Invalid date values", {
            start_date: subscription.start_date,
            end_date: subscription.ended_at,
          });
          return null;
        }

        return {
          id: subscription.id,
          status: subscription.status,
          plan: productName,
          amount: (price?.unit_amount || 0) / 100,
          currency: price?.currency || "N/A",
          startDate: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : null,
        };
      })
    );

    res.json({
      hasSubscription: subscriptionData.filter(Boolean).length > 0,
      subscriptions: subscriptionData.filter(Boolean),
    });
  } catch (error) {
    console.error("🔥 Error retrieving subscription data:", error.message);
    res.status(500).json({
      error: "Failed to fetch subscription data",
      details: error.message,
    });
  }
});


router.get("/all-customers", async (req, res) => {
  try {
    let allCustomers = [];
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      // Build params object
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const customers = await stripe.customers.list(params);

      allCustomers.push(...customers.data);

      hasMore = customers.has_more;
      if (hasMore) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }

    res.json({
      count: allCustomers.length,
      customers: allCustomers.map((cust) => ({
        id: cust.id,
        email: cust.email,
        name: cust.name,
        created: new Date(cust.created * 1000).toISOString(),
      })),
    });
  } catch (error) {
    console.error("🔥 Error retrieving Stripe customers:", error.message);
    res.status(500).json({
      error: "Failed to fetch customers",
      details: error.message,
    });
  }
});

// Get total revenue
router.get("/total-revenue", async (req, res) => {
  try {
    const payments = await stripe.paymentIntents.list({
      limit: 100,
    });

    let total = 0;
    for (const payment of payments.data) {
      if (payment.status === "succeeded") {
        total += payment.amount_received;
      }
    }

    res.status(200).json({
      success: true,
      totalRevenue: total / 100, // Stripe uses cents, convert to dollars
    });
  } catch (error) {
    console.error("Stripe revenue fetch error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch revenue",
    });
  }
});

export default router;
