import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import {
  FaTimesCircle,
  FaFileInvoice,
  FaUser,
  FaCreditCard,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUsername } from "../../auth/auth";


const PaymentCancelled = ({ plan, amount, transactionId }) => {
  const username = getUsername();
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate("/others/pricedetails"); // Or your payment page route
  };

  const handleDashboardClick = () => {
    navigate("/student/dashboard");
  };

  return (
    <Container className="payment-cancelled-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="payment-cancelled-card">
          <div className="text-center mb-4">
            <FaTimesCircle className="text-danger cancelled-icon" />
            <h2 className="mt-3">Payment Cancelled</h2>
            <p className="lead">Your payment was not completed</p>
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

            {plan && (
              <div className="detail-item">
                <div className="detail-icon">
                  <FaFileInvoice />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Selected Plan</span>
                  <span className="detail-value">{plan}</span>
                </div>
              </div>
            )}

            {amount && (
              <div className="detail-item">
                <div className="detail-icon">
                  <FaCreditCard />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">
                    Rs. {amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {transactionId && (
              <div className="detail-item">
                <div className="detail-icon">
                  <FaFileInvoice />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Transaction Reference</span>
                  <span className="detail-value">{transactionId}</span>
                </div>
              </div>
            )}
          </div>

          <div className="action-buttons mt-5">
            <Button
              variant="danger"
              size="lg"
              className="try-again-button"
              onClick={handleTryAgain}
            >
              Try Again
            </Button>
            <Button
              variant="outline-secondary"
              size="lg"
              className="dashboard-button"
              onClick={handleDashboardClick}
            >
              Go to Dashboard
            </Button>
          </div>

          <div className="additional-info mt-4">
            <p>
              Your payment was not processed. No amount was deducted from your
              account.
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

export default PaymentCancelled;
