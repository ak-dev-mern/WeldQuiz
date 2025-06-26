import Footer from "../../components/Footer.jsx";
import Header from "../../components/Header.jsx";
import Navbar from "../../components/Navbar.jsx";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";
import { getRole, getToken, getUsername } from "../../auth/auth.js";
import "../../style/Feedback.css";
import DeleteConfirmModal from "../../components/DeleteConfirmModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all feedbacks
const fetchFeedbacks = async () => {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await axios.get(`${API_URL}/api/feedbacks/getfeedbacks`, {
    headers,
  });

  const feedbacks = res.data?.feedbacks;
  return Array.isArray(feedbacks) ? feedbacks : [];
};

const Feedback = () => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const token = getToken();
  const userName = getUsername();
  const userRole = getRole();
  const [showModal, setShowModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const {
    data: allFeedbacks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: fetchFeedbacks,
  });

  // Frontend Pagination Setup
  const feedbackPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    Array.isArray(allFeedbacks) ? allFeedbacks.length / feedbackPerPage : 0
  );

  const currentFeedbacks = useMemo(() => {
    if (!Array.isArray(allFeedbacks)) return [];
    const startIndex = (currentPage - 1) * feedbackPerPage;
    return allFeedbacks.slice(startIndex, startIndex + feedbackPerPage);
  }, [allFeedbacks, currentPage]);

  const mutation = useMutation({
    mutationFn: async (newFeedback) => {
      return await axios.post(
        `${API_URL}/api/feedbacks/postfeedbacks`,
        newFeedback,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["feedbacks"]);
      setFeedback("");
      setRating(0);
      setErrorMessage("");
      setCurrentPage(1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (feedbackId) => {
      await axios.delete(
        `${API_URL}/api/feedbacks/deletefeedbacks/${feedbackId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["feedbacks"]);
    },
  });

  const handleSubmit = () => {
    if (!rating) {
      setErrorMessage("Please select a rating.");
      return;
    }
    if (!feedback.trim()) {
      setErrorMessage("Feedback cannot be empty.");
      return;
    }

    setErrorMessage("");
    mutation.mutate({ rating, feedback });
  };

  const handleDeleteFeedback = (feedbackId) => {
    setFeedbackToDelete(feedbackId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (feedbackToDelete) {
      deleteMutation.mutate(feedbackToDelete);
      setShowModal(false);
    }
  };

  const isLoggedIn = !!token;

  return (
    <>
      <Navbar />
      <Header title="Feedback" />
      <div className="container feedback-container">
        <div className="row justify-content-center">
          <div className="p-4 rounded shadow my-5">
            <div className="feedback-form">
              <h2 className="h4 mb-3">Leave Your Feedback</h2>

              {isLoggedIn ? (
                <>
                  <div className="d-flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= rating ? (
                        <FaStar
                          key={star}
                          className="text-warning cursor-pointer fs-4"
                          onClick={() => setRating(star)}
                        />
                      ) : (
                        <FaRegStar
                          key={star}
                          className="text-muted cursor-pointer fs-4"
                          onClick={() => setRating(star)}
                        />
                      )
                    )}
                  </div>
                  <textarea
                    className="form-control mb-3"
                    placeholder="Write your feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                  )}
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleSubmit}
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? "Submitting..." : "Submit"}
                  </button>
                </>
              ) : (
                <div className="alert alert-warning" role="alert">
                  You must be logged in to submit feedback. Please log in first.
                </div>
              )}
            </div>

            <h3 className="h5 mt-5">Recent Feedback</h3>
            {isLoading ? (
              <p>Loading feedbacks...</p>
            ) : error ? (
              <p>Error loading feedbacks</p>
            ) : (
              <>
                <div className="gallery-container mt-4 feedbacks">
                  {currentFeedbacks.length > 0 ? (
                    currentFeedbacks.map((fb) => (
                      <li
                        key={fb.id}
                        className=" d-flex justify-content-between "
                      >
                        <div className="single-feedback bg-light px-5 rounded  gallery-item">
                          <div className="mt-3">
                            <div className="d-flex justify-content-between">
                              <div className="d-flex gap-1">
                                <span>Rating:</span>
                                {[...Array(fb.rating)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className="text-warning fs-5"
                                  />
                                ))}
                              </div>
                              <p>
                                Posted by: <strong>{fb.username}</strong>
                              </p>
                            </div>
                            <p>{fb.feedback}</p>

                            <div className="d-flex align-items-center justify-content-between">
                              <p className="text-muted">
                                Created At:{" "}
                                {new Date(fb.createdAt).toLocaleString()}
                              </p>
                              <div>
                                {(userRole === "admin" ||
                                  userName === fb.username) && (
                                  <button
                                    onClick={() => handleDeleteFeedback(fb.id)}
                                    className="btn btn-link text-danger"
                                  >
                                    <div className="trash-btn">
                                      <Trash />
                                    </div>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <div>
                      <p>No feedback yet.</p>
                    </div>
                  )}
                  <DeleteConfirmModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Feedback?"
                    message="Are you sure you want to delete this feedback? This action cannot be undone."
                  />
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                  <div className=" d-flex justify-content-center align-items-center flex-wrap gap-2 mt-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="btn btn-light border d-flex align-items-center px-3 py-1"
                    >
                      <span className="me-1">⬅️</span> Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`btn ${
                          currentPage === i + 1
                            ? "btn-dark"
                            : "btn-outline-dark"
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="btn btn-light border d-flex align-items-center px-3 py-1"
                    >
                      Next <span className="ms-1">➡️</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Feedback;
