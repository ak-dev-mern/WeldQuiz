import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { getToken } from "../auth/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all feedbacks
const fetchFeedbacks = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/api/feedbacks/getfeedbacks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// React component
const FeedbacksTable = () => {
  const queryClient = useQueryClient();
  const {
    data: feedbacksData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: fetchFeedbacks,
    refetchInterval: 5000,
    staleTime: 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  useEffect(() => {
    queryClient.invalidateQueries(["feedbacks"]);
  }, [queryClient]);

  const feedbacks = Array.isArray(feedbacksData?.feedbacks)
    ? feedbacksData.feedbacks
    : [];

  // Pagination state and logic
  const itemsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFeedbacks = feedbacks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading)
    return <p className="text-center mt-3">Loading feedbacks...</p>;
  if (isError)
    return (
      <p className="text-danger text-center mt-3">Error: {error.message}</p>
    );

  return (
    <div className="container mt-4">
      <h1 className="text-center fw-bold my-3 text-light">Feedback List</h1>
      <div className="table-responsive">
        <table className="table table-hover table-bordered user-table-custom-scroll">
          <thead className="table-primary">
            <tr>
              <th>Feedback ID</th>
              <th>User ID</th>
              <th>Username</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {currentFeedbacks.length > 0 ? (
              currentFeedbacks.map((feedback) => (
                <tr key={feedback.id}>
                  <td>{feedback.id}</td>
                  <td>{feedback.user_id}</td>
                  <td>{feedback.username}</td>
                  <td>{feedback.rating}</td>
                  <td>{feedback.feedback}</td>
                  <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(feedback.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No feedbacks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
          <button
            className="btn btn-light border d-flex align-items-center"
            onClick={() => goToPage(currentPage - 1)}
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
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-light border d-flex align-items-center"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbacksTable;
