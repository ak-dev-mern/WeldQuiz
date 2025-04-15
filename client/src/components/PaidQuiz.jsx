import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../auth/auth";
import { Spinner, Alert } from "react-bootstrap";
import "../style/PaidQuiz.css";

const API_URL = import.meta.env.VITE_API_URL;
const token = getToken();

const PaidQuiz = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  // ✅ Fetch subscription status
  const {
    data: subscriptionStatus,
    isLoading: isSubLoading,
    isError: isSubError,
    error: subError,
  } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const res = await axios.get(
        `${API_URL}/api/payment/subscription-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });

  const activeSubscription = Array.isArray(subscriptionStatus?.subscriptions)
    ? subscriptionStatus.subscriptions.find((sub) => sub.status === "active")
    : null;

  const isSubscribed = !!activeSubscription;

  // ✅ Fetch questions only if subscription is active
  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    error: questionsError,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/questions/getquestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token && isSubscribed,
  });

  const isLoading = isSubLoading || (isSubscribed && isQuestionsLoading);

  const sortedCategories = Array.isArray(questions)
    ? [...new Set(questions.map((q) => q.category))].sort((a, b) =>
        a.localeCompare(b)
      )
    : [];

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading quiz categories...</p>
      </div>
    );
  }

  // ✅ Show fallback if subscription is not active or has errors
  if (!isSubscribed || isSubError) {
    const fallbackReason = subscriptionStatus?.status
      ? `Your subscription is currently "${subscriptionStatus.status}".`
      : "You do not have an active subscription.";

    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h3 className="mb-3 text-danger">Access Restricted</h3>
                <p>{fallbackReason}</p>
                <button
                  className="btn"
                  style={{ backgroundColor: "orangered", color: "white" }}
                  onClick={() => navigate("/others/pricedetails")}
                >
                  View Plans & Subscribe
                </button>
                {subError && (
                  <Alert variant="danger" className="mt-3">
                    <strong>Error:</strong> {subError.message}
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isQuestionsError) {
    return (
      <div className="text-center text-danger my-4">
        <Alert variant="danger">
          <strong>Error:</strong> {questionsError.message}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-light">Choose a Category</h2>
      <div className="row">
        {sortedCategories.length > 0 ? (
          sortedCategories.map((category, index) => (
            <div className="col-md-4 col-sm-6 mb-4" key={index}>
              <Link
                to={`/student/paid-quiz/category/${encodeURIComponent(
                  category
                )}`}
                className="text-decoration-none"
              >
                <div
                  className="card shadow h-100 p-3 border-primary category-card border-0"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="folder-icon-wrapper">
                      <i
                        className={`fas fa-folder fa-2x text-primary ${
                          hoveredCard === index ? "hidden" : ""
                        }`}
                      />
                      <i
                        className={`fas fa-folder-open fa-2x text-primary ${
                          hoveredCard === index ? "" : "hidden"
                        }`}
                      />
                    </div>
                    <h5 className="mb-0 text-dark">{category}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center">No categories found.</div>
        )}
      </div>
    </div>
  );
};

export default PaidQuiz;
