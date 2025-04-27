import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../auth/auth";
import { Link } from "react-router-dom";
import { useState } from "react";
import DeleteConfirmModal from "./DeleteConfirmModal";

const API_URL = import.meta.env.VITE_API_URL;

const MyDiscussion = () => {
  const token = getToken();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15); // ✅ Dynamic limit
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [discussionToDelete, setDiscussionToDelete] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["mydiscussions", page, limit],
    queryFn: async () => {
      const res = await axios.get(
        `${API_URL}/api/discussions/mydiscussions?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    enabled: !!token,
    keepPreviousData: true,
  });

  const deleteDiscussionMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(
        `${API_URL}/api/discussions/mydiscussions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mydiscussions"]);
    },
  });

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (data?.totalPages && page < data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDelete = (id) => {
    setDiscussionToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (discussionToDelete) {
      deleteDiscussionMutation.mutate(discussionToDelete, {
        onSuccess: () => {
          setShowModal(false);
        },
        onError: (error) => {
          alert(error.response?.data?.message || "Failed to delete.");
          setShowModal(false);
        },
      });
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="container student-dashboard">
        <h1 className="text-center fw-bold mb-3 text-light">Discussions</h1>

        {/* Limit Dropdown */}
        <div className="d-flex justify-content-end mb-3">
          <label className="me-2">Discussions per page:</label>
          <select
            className="form-select w-auto"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Reset to first page when limit changes
            }}
          >
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={15}>15</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="alert alert-danger text-center">
            Error: {error.message}
          </div>
        ) : (
          <>
            {data?.discussions?.length === 0 ? (
              <div className="alert alert-warning text-center">
                No discussions available.
              </div>
            ) : (
              <div className="row px-md-5">
                {data?.discussions?.map((d) => (
                  <div key={d.discussion_id} className="col-md-4 mb-4">
                    <div className="card text-center border-0 h-100 shadow-sm">
                      <div className="card-body">
                        <i className="fa fa-comments fs-2 mb-2 text-primary"></i>
                        <h5 className="card-title">
                          {d.discussion_id}.{d.title}
                        </h5>
                        <p className="card-text text-muted small">
                          {d.description?.substring(0, 100)}...
                        </p>
                        <div className="d-flex justify-content-center align-items-center flex-column">
                          <Link
                            to={`/others/discussion/${d.discussion_id}`}
                            className="btn btn-sm btn-primary mt-2 py-0 px-2"
                          >
                            View Discussion
                          </Link>
                          <button
                            className="btn btn-sm btn-danger mt-3 ms-2 py-0 px-3"
                            onClick={() => handleDelete(d.discussion_id)}
                            disabled={deleteDiscussionMutation.isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DeleteConfirmModal
              show={showModal}
              onHide={() => setShowModal(false)}
              onConfirm={confirmDelete}
              title="Delete Discussion?"
              message="Are you sure you want to delete this discussion? This action cannot be undone."
            />

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-4">
              <div className="custom-pagination d-flex flex-wrap gap-2 align-items-center">
                <button
                  onClick={handlePrev}
                  className="btn btn-light border d-flex align-items-center"
                  disabled={page === 1}
                >
                  ⬅️ Prev
                </button>

                {Array.from({ length: data.totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`btn ${
                      page === i + 1 ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={handleNext}
                  className="btn btn-light border d-flex align-items-center"
                  disabled={page === data.totalPages}
                >
                  Next ➡️
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyDiscussion;
