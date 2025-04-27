import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../auth/auth";
import { textLengthLimit } from "../utils/utils";
import DeleteConfirmModal from "./DeleteConfirmModal";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch feedbacks with pagination and limit
const fetchMyFeedbacks = async ({ page, limit }) => {
  const token = getToken();
  const res = await axios.get(
    `${API_URL}/api/feedbacks/myfeedbacks?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

const deleteFeedback = async (id) => {
  const token = getToken();
  await axios.delete(`${API_URL}/api/feedbacks/deletefeedbacks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const renderStars = (rating) => {
  return (
    <div className="mb-2">
      {[...Array(5)].map((_, i) => (
        <i
          key={i}
          className={`bi ${
            i < rating ? "bi-star-fill text-warning" : "bi-star text-secondary"
          }`}
        ></i>
      ))}
    </div>
  );
};

const MyFeedback = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["myFeedbacks", page, limit],
    queryFn: () => fetchMyFeedbacks({ page, limit }), // ✅ passes page/limit
    keepPreviousData: true,
  });

  const mutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries(["myFeedbacks"]);
    },
  });

  const handleDelete = (id) => {
    setFeedbackToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (feedbackToDelete) {
      mutation.mutate(feedbackToDelete);
      setShowModal(false);
    }
  };

  if (isLoading)
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="alert alert-danger text-center mt-5">
        Error: {error.message}
      </div>
    );

  if (!data || !data.feedbacks || data.feedbacks.length === 0)
    return (
      <div className="container mt-5">
        <h1 className="text-center fw-bold my-3 text-light">My Feedbacks</h1>
        <div className="alert alert-info text-center">
          You haven't submitted any feedback yet.
        </div>
      </div>
    );

  const { feedbacks, totalPages, currentPage } = data;

  return (
    <div className="container mt-5">
      <h1 className="text-center fw-bold my-3 text-light">My Feedbacks</h1>

      {/* Select limit dropdown */}
      <div className="d-flex justify-content-end mb-3">
        <label className="me-2">Feedbacks per page:</label>
        <select
          className="form-select w-auto"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={3}>3</option>
          <option value={6}>6</option>
          <option value={9}>9</option>
          <option value={12}>12</option>
          <option value={15}>15</option>
        </select>
      </div>

      <div className="row">
        {feedbacks.map((fb) => (
          <div className="col-md-4 mb-4" key={fb.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{renderStars(fb.rating)}</h5>
                <p className="card-text">{textLengthLimit(fb.feedback, 100)}</p>
                <p className="card-text">
                  <small className="text-muted">
                    Submitted on {new Date(fb.createdAt).toLocaleDateString()}
                  </small>
                </p>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary py-0 px-2"
                    disabled
                    title="Only Admin can edit"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger py-0 px-2"
                    onClick={() => handleDelete(fb.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <DeleteConfirmModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onConfirm={confirmDelete}
          title="Delete Feedback?"
          message="Are you sure you want to delete this feedback? This action cannot be undone."
        />
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <div className="custom-pagination d-flex gap-2">
          <button
            className="btn btn-light border"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => p - 1)}
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
            className="btn btn-light border"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyFeedback;
