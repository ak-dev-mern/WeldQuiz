import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../auth/auth.js";
import { Spinner, Alert } from "react-bootstrap";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const fetchSubscriptionStatus = async (token) => {
  const { data } = await axios.get(
    `${API_URL}/api/payment/subscription-status`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

const SubscriptionDetails = () => {
  const navigate = useNavigate();
  const token = getToken();

  const {
    data: subscriptionStatus,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["subscriptionStatus", token],
    queryFn: () => fetchSubscriptionStatus(token),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Fetching your subscription details...</p>
      </div>
    );
  }

  // ✅ Only consider subscriptions with status 'active'
  const activeSubscription = Array.isArray(subscriptionStatus?.subscriptions)
    ? subscriptionStatus.subscriptions.find((sub) => sub.status === "active")
    : null;

  const hasActive = !!activeSubscription;

  const plan = activeSubscription?.plan;
  const status = activeSubscription?.status;
  const formattedStartDate = activeSubscription?.startDate
    ? format(new Date(activeSubscription.startDate), "MMMM dd, yyyy")
    : "";
  const formattedEndDate = activeSubscription?.endDate
    ? format(new Date(activeSubscription.endDate), "MMMM dd, yyyy")
    : "";

  // ✅ Show subscription details only if active
  if (hasActive) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow border-0">
              <div className="card-body">
                <h3 className="mb-4 text-center">Subscription Details</h3>
                <p>
                  <strong>Plan:</strong> {plan}
                </p>
                <p>
                  <strong>Status:</strong> {status}
                </p>
                <p>
                  <strong>Start Date:</strong> {formattedStartDate}
                </p>
                <p>
                  <strong>End Date:</strong> {formattedEndDate}
                </p>
                <div className="text-center">
                  <button
                    className="btn btn-sm py-0 px-3"
                    style={{ backgroundColor: "orangered", color: "white" }}
                    onClick={() => window.history.back()}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Show fallback for non-active status or no subscription
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-3 text-danger">No Active Subscription</h3>
              <p>
                You do not have an active subscription. Please subscribe to
                access the service.
              </p>
              <button
                className="btn"
                style={{ backgroundColor: "orangered", color: "white" }}
                onClick={() => navigate("/others/pricedetails")}
              >
                View Plans & Subscribe
              </button>
              {error && (
                <Alert className="mt-3" variant="danger">
                  <strong>Error:</strong> {error.message}
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
