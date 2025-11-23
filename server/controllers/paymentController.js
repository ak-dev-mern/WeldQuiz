import Stripe from "stripe";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSubscription = async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    // Create Stripe customer if not exists
    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        metadata: {
          userId: userId.toString(),
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    // Update user subscription
    user.subscription = {
      type: priceId.includes("monthly") ? "monthly" : "yearly",
      status: "active",
      startDate: new Date(),
      endDate: new Date(
        Date.now() +
          (priceId.includes("monthly")
            ? 30 * 24 * 60 * 60 * 1000
            : 365 * 24 * 60 * 60 * 1000)
      ),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
    };

    await user.save();

    // Create payment record
    const payment = new Payment({
      user: userId,
      amount: subscription.latest_invoice.amount_due / 100, // Convert from cents
      currency: "usd",
      status: "completed",
      stripePaymentIntentId: subscription.latest_invoice.payment_intent.id,
      type: "subscription",
    });

    await payment.save();

    res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subscription",
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);

    // Update user subscription
    user.subscription.status = "inactive";
    user.subscription.endDate = new Date();

    await user.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling subscription",
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
    });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let subscriptionDetails = null;

    if (user.subscription.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      );

      subscriptionDetails = {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    res.json({
      success: true,
      subscription: {
        ...user.subscription.toObject(),
        details: subscriptionDetails,
      },
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscription status",
    });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        // Update user subscription status
        await User.updateOne(
          { "subscription.stripeCustomerId": invoice.customer },
          {
            "subscription.status": "active",
            "subscription.endDate": new Date(invoice.period_end * 1000),
          }
        );
        break;

      case "customer.subscription.deleted":
        const subscription = event.data.object;
        await User.updateOne(
          { "subscription.stripeCustomerId": subscription.customer },
          {
            "subscription.status": "inactive",
            "subscription.endDate": new Date(),
          }
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};
