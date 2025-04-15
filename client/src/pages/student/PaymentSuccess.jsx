import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import {
  FaCheckCircle,
  FaFileInvoice,
  FaUser,
  FaCreditCard,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { getUsername } from "../../auth/auth.js";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const PaymentSuccess = () => {
  const username = getUsername();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = new URLSearchParams(location.search).get("session_id");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/payment/session/${sessionId}`
        );
        setSessionDetails(res.data);
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchSession();
  }, [sessionId]);

  const handleDashboardClick = () => {
    navigate("/student/dashboard");
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading payment details...</p>
      </Container>
    );
  }

  const plan = sessionDetails?.plan || "N/A"; // Plan name fetched from session details
  const amount = sessionDetails?.amount; // Amount paid
  const transactionId = sessionDetails?.transactionId; // Transaction ID from invoice

  return (
    <Container className="payment-success-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="payment-success-card">
          <div className="text-center mb-4">
            <FaCheckCircle className="text-success success-icon" />
            <h2 className="mt-3">Payment Successful!</h2>
            <p className="lead">Your subscription is now active</p>
          </div>

          <div className="payment-details">
            <div className="detail-item">
              <div className="detail-icon">
                <FaUser />
              </div>
              <div className="detail-content">
                <span className="detail-label">Account</span>
                <span className="detail-value">{username}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaFileInvoice />
              </div>
              <div className="detail-content">
                <span className="detail-label">Plan</span>
                <span className="detail-value">{plan}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaCreditCard />
              </div>
              <div className="detail-content">
                <span className="detail-label">Amount Paid</span>
                <span className="detail-value">
                  Rs. {amount?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaFileInvoice />
              </div>
              <div className="detail-content">
                <span className="detail-label">Transaction ID</span>
                <span className="detail-value">{transactionId}</span>
              </div>
            </div>
          </div>
          <div className="action-buttons mt-5">
            <Button variant="primary" size="lg" onClick={handleDashboardClick}>
              Go to Dashboard
            </Button>

            {/* Link to view the invoice hosted on Stripe */}
            <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
              <a
                href={sessionDetails?.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline-primary" size="lg">
                  View Invoice
                </Button>
              </a>

              {/* Link to download the invoice as a PDF */}
              <a
                href={sessionDetails?.invoicePdf}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline-primary" size="lg">
                  Download Invoice
                </Button>
              </a>
            </div>
          </div>

          <div className="additional-info mt-4">
            <p>
              A confirmation email has been sent to your registered email
              address.
            </p>
            <p className="support-text">
              Need help? <a href="/support">Contact support</a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;
