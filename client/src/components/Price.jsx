import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getRole, isAuthenticated, getToken } from "../auth/auth";
import { loadStripe } from "@stripe/stripe-js";
import "../style/PriceDetails.css";
import offer from "../../public/offer.png";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API_URL = import.meta.env.VITE_API_URL;
const role = getRole();

const Price = () => {
  const navigate = useNavigate();
  const token = getToken();
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const {
    data: plans = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/payment/plans`);
      if (!res.ok) throw new Error("Failed to load plans");
      return await res.json();
    },
  });

  const handlePurchaseClick = async (plan) => {
    if (!isAuthenticated()) {
      navigate("/register");
      return;
    }

    setLoadingPlanId(plan.plan_id);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe failed to load.");
        return;
      }

      const { data } = await axios.post(
        `${API_URL}/api/payment/create-checkout-session`,
        {
          planId: plan.plan_id,
          planName: plan.plan_name,
          price: plan.price,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned.");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err.message || err);
      alert("Payment initiation failed.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="container-fluid px-0 price-container">
      <div className="container my-md-5 price-details d-flex flex-column justify-content-center align-items-center">
        <h1 className="my-5 text-light text-center display-5 fw-bold">
          Choose the right pricing plan that suits your need
        </h1>

        <div className="container my-md-5 mb-5">
          <div className="row cards g-4 justify-content-center">
            <div className="offer-img">
              <img src={offer} alt="offer.png" />
            </div>
            {plans.map((plan) => (
              <div
                className="col-12 col-sm-6 col-md-4 col-lg-3"
                key={plan.plan_id}
              >
                <div className="card price-card text-center shadow h-100">
                  <div className="card-header">
                    <h4 className="fw-bold">{plan.plan_name} Plan</h4>
                    <div className="d-flex justify-content-center align-items-end">
                      <p className="mb-0">$</p>
                      <h1 className="display-5 fw-bold mb-0 mx-1">
                        {plan.price}
                      </h1>
                      <p className="mb-1">/yearly</p>
                    </div>
                    <p className="text-muted">{plan.description}</p>
                    <p
                      className="text-secondary"
                      style={{ fontSize: "0.9rem" }}
                    >
                      All prices are in <strong>USD</strong>
                    </p>
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between">
                    {plan.features?.length > 0 ? (
                      plan.features.map((feature, idx) => (
                        <h6 className="my-2" key={idx}>
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          {feature}
                        </h6>
                      ))
                    ) : (
                      <h6 className="text-muted">No features listed</h6>
                    )}

                    {plan.price != 0 ? (
                      <button
                        className="btn btn-primary w-100 mt-4 rounded-pill"
                        onClick={() => handlePurchaseClick(plan)}
                        disabled={loadingPlanId === plan.plan_id}
                      >
                        {loadingPlanId === plan.plan_id
                          ? "Redirecting..."
                          : isAuthenticated()
                          ? "Purchase Now"
                          : "Sign Up to Purchase"}
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary w-100 mt-4 rounded-pill"
                        disabled
                      >
                        {loadingPlanId === plan.plan_id
                          ? "Redirecting..."
                          : isAuthenticated()
                          ? "Free"
                          : "Sign Up to Purchase"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Price;
