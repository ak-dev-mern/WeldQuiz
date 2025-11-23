import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Star, HelpCircle } from "lucide-react";
import HomeHeader from "../../components/Layout/HomeHeader";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // monthly or yearly

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Access to 50+ courses",
        "Basic learning analytics",
        "Community support",
        "Limited AI assistance",
        "Basic certificates",
      ],
      limitations: [
        "Advanced course materials",
        "Personalized learning paths",
        "Priority support",
        "Downloadable resources",
      ],
      popular: false,
      cta: "Get Started Free",
      color: "gray",
    },
    {
      name: "Pro",
      description: "Most popular for serious learners",
      monthlyPrice: 19,
      yearlyPrice: 190, // 2 months free
      features: [
        "Unlimited course access",
        "Advanced AI analytics",
        "Personalized learning paths",
        "Downloadable resources",
        "Professional certificates",
        "Priority email support",
        "Offline access",
      ],
      limitations: [],
      popular: true,
      cta: "Start Pro Trial",
      color: "blue",
    },
    {
      name: "Enterprise",
      description: "For teams and organizations",
      monthlyPrice: 49,
      yearlyPrice: 490, // 2 months free
      features: [
        "Everything in Pro",
        "Team management dashboard",
        "Advanced analytics & reporting",
        "Custom learning paths",
        "Dedicated account manager",
        "SAML/SSO integration",
        "Custom certificates",
        "API access",
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales",
      color: "purple",
    },
  ];

  const savings = plans.map((plan) => ({
    name: plan.name,
    savings: plan.yearlyPrice
      ? Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
      : 0,
  }));

  const faqs = [
    {
      question: "Can I change plans later?",
      answer:
        "Yes, you can upgrade, downgrade, or cancel your plan at any time.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes, we offer a 7-day free trial for all paid plans. No credit card required.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
    },
    {
      question: "Do you offer student discounts?",
      answer:
        "Yes, we offer 50% off for students with valid student ID verification.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "We offer a 30-day money-back guarantee for all annual subscriptions.",
    },
    {
      question: "Are certificates included?",
      answer:
        "Yes, all plans include certificates. Pro and Enterprise plans include professional certificates.",
    },
  ];

  const getPrice = (plan) =>
    billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your learning journey. All plans include
            access to our core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-2">
            <span
              className={`text-lg font-medium ${
                billingPeriod === "monthly"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === "yearly" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex items-center space-x-2">
              <span
                className={`text-lg font-medium ${
                  billingPeriod === "yearly"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500"
                }`}
              >
                Yearly
              </span>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                Save up to 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-white dark:bg-dark-800 ring-2 ring-blue-500 shadow-xl"
                  : "bg-white dark:bg-dark-800 shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${getPrice(plan)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-gray-500 ml-2">
                      /{billingPeriod === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </div>
                {billingPeriod === "yearly" && plan.monthlyPrice > 0 && (
                  <p className="text-green-600 text-sm">
                    Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} annually
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <li
                    key={limitationIndex}
                    className="flex items-center opacity-50"
                  >
                    <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-500">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.name === "Enterprise" ? "/contact" : "/register"}
                className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105"
                    : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-start space-x-3">
                  <HelpCircle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Need a custom plan for your organization?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Contact Sales Team
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
