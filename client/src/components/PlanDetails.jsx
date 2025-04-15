import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../auth/auth";
import "../style/Payment.css";

const PlanDetails = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plansPage, setPlansPage] = useState(1);
  const perPage = 100;

  const API_URL = import.meta.env.VITE_API_URL;
  const token = getToken();

  const axiosInstance = axios.create({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansRes = await axiosInstance.get(
          `${API_URL}/api/payment/plans`
        );
        setPlans(plansRes.data || []);
      } catch (err) {
        setError("Failed to fetch plans data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  const paginate = (items, page) => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  };

  const renderPagination = (total, currentPage, setPage) => {
    const totalPages = Math.ceil(total / perPage);

    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
        <button
          className="btn btn-light border d-flex align-items-center"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ⬅️ Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`btn ${
              currentPage === i + 1 ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="btn btn-light border d-flex align-items-center"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next ➡️
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading Payment Plans...</p>
      </div>
    );
  }

  if (error) return <div className="text-danger text-center mt-4">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-center text-light mb-4">Payment Plans</h2>

      <div>
        {plans.length === 0 ? (
          <p>No plans available</p>
        ) : (
          <div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Plan ID</th>
                  <th>Plan Name</th>
                  <th>Price</th>
                  <th>Billing Cycle</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {paginate(plans, plansPage).map((plan) => (
                  <tr key={plan.plan_id}>
                    <td>{plan.plan_id}</td>
                    <td>{plan.plan_name}</td>
                    <td>{plan.price}</td>
                    <td>{plan.billing_cycle}</td>
                    <td>{plan.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination(plans.length, plansPage, setPlansPage)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDetails;
