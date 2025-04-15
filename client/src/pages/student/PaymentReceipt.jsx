import React from "react";
import { useLocation } from "react-router-dom";
import { FaFilePdf } from "react-icons/fa";
import { jsPDF } from "jspdf";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { getUsername } from "../../auth/auth";

const PaymentReceipt = () => {
  const location = useLocation();
  const { plan, amount, transactionId } = location.state || {};
  const username = getUsername();

  // Function to download the receipt as PDF
  const downloadReceipt = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Payment Receipt", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Account: ${username}`, 20, 40);
    doc.text(`Plan: ${plan}`, 20, 50);
    doc.text(`Amount Paid: Rs. ${amount?.toLocaleString()}`, 20, 60);
    doc.text(`Transaction ID: ${transactionId}`, 20, 70);
    doc.text(
      "Thank you for your purchase. Your subscription is now active.",
      20,
      80
    );

    doc.save(`receipt_${transactionId}.pdf`);
  };

  return (
    <>
      <Navbar />
      <Header title={"Payment Receipt"} />
      <div className="container-fluid px-0">
        <div className="container my-5 d-flex flex-column justify-content-center align-items-center min-vh-100">
          <div
            className="card shadow p-5 text-center"
            style={{ maxWidth: "600px" }}
          >
            <h1 className="mb-4">Payment Receipt</h1>

            <div className="text-start mb-4">
              <p>
                <strong>Account:</strong> {username}
              </p>
              <p>
                <strong>Plan:</strong> {plan}
              </p>
              <p>
                <strong>Amount Paid:</strong> Rs. {amount?.toLocaleString()}
              </p>
              <p>
                <strong>Transaction ID:</strong> {transactionId}
              </p>
            </div>

            <p className="mb-4">
              Thank you for your purchase. Your subscription is now active.
            </p>

            <button className="btn btn-success" onClick={downloadReceipt}>
              <FaFilePdf className="mr-2" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReceipt;
