import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Navbar from "../../components/Navbar.jsx";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import "../../style/Discussion.css";
import { getRole, getToken, getUsername } from "../../auth/auth.js";
import { Link } from "react-router-dom";
import { textLengthLimit } from "../../utils/utils.js";
import DeleteConfirmModal from "../../components/DeleteConfirmModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const DISCUSSIONS_PER_PAGE = 5;

const Discussion = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [editingDiscussionId, setEditingDiscussionId] = useState(null);
  const [editDiscussionData, setEditDiscussionData] = useState({
    title: "",
    description: "",
    image: null, // ✅ include image in edit state
  });

  const [showModal, setShowModal] = useState(false);
  const [discussionToDelete, setDiscussionToDelete] = useState(null);

  const token = getToken();
  const userName = getUsername();
  const userRole = getRole();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["discussions", page],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/discussions/getdiscussions?page=${page}&limit=${DISCUSSIONS_PER_PAGE}`
      );
      return response.data;
    },
    keepPreviousData: true,
    refetchOnWindowFocus: true,
  });

  const discussions = data?.discussions || [];
  const totalPages = data?.pagination?.pages || 1;

  const {
    mutate: createDiscussion,
    isLoading: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (discussionData) => {
      const formData = new FormData();
      formData.append("title", discussionData.title);
      formData.append("description", discussionData.description);
      if (discussionData.image) {
        formData.append("image", discussionData.image);
      }

      const response = await axios.post(
        `${API_URL}/api/discussions/createnewdiscussion`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      setNewDiscussion({ title: "", description: "", image: "" });
      setPage(1);
    },
  });

  // ✅ update mutation to send FormData
  const { mutate: updateDiscussion, isLoading: isUpdatingDiscussion } =
    useMutation({
      mutationFn: async ({ discussionId, title, description, image }) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (image) {
          formData.append("image", image);
        }

        const response = await axios.put(
          `${API_URL}/api/discussions/${discussionId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["discussions"]);
        setEditingDiscussionId(null);
      },
    });

  const { mutate: deleteDiscussion } = useMutation({
    mutationFn: async (discussionId) => {
      const response = await axios.delete(
        `${API_URL}/api/discussions/deletediscussions/${discussionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
    },
  });

  const handleCreateDiscussion = (e) => {
    e.preventDefault();
    if (!newDiscussion.title.trim()) return;
    createDiscussion(newDiscussion);
  };

  const handleDeleteDiscussion = (discussionId) => {
    setDiscussionToDelete(discussionId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (discussionToDelete) {
      deleteDiscussion(discussionToDelete);
      setShowModal(false);
    }
  };

  const handleEditDiscussion = (discussionId) => {
    setEditingDiscussionId(discussionId);
    const discussion = discussions.find(
      (d) => d.discussion_id === discussionId
    );
    setEditDiscussionData({
      title: discussion.title,
      description: discussion.description || "",
      image: null, // ✅ reset image for optional change
    });
  };

  const handleSaveEditDiscussion = (discussionId) => {
    if (!editDiscussionData.title.trim()) return;
    updateDiscussion({
      discussionId,
      title: editDiscussionData.title,
      description: editDiscussionData.description,
      image: editDiscussionData.image,
    });
  };

  const handleCancelEdit = () => {
    setEditingDiscussionId(null);
    setEditDiscussionData({ title: "", description: "", image: null });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (isLoading) return <div className="loading">Loading discussions...</div>;
  if (isError) return <div className="error">Error: {error.message}</div>;

  return (
    <>
      <Navbar />
      <Header title="Discussion Forum" />

      <div className="discussion-page-container">
        <div className="discussion-form">
          <h3 style={{ color: "orangered" }}>Start a New Discussion</h3>
          {createError && (
            <div className="error-message">
              {createError.response?.data?.error ||
                "Failed to create discussion"}
            </div>
          )}
          <form onSubmit={handleCreateDiscussion}>
            <input
              className="form-control mb-3"
              type="text"
              placeholder="Discussion Title*"
              value={newDiscussion.title}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, title: e.target.value })
              }
              required
              maxLength={100}
            />
            <textarea
              className="form-control mb-3"
              placeholder="Description (optional)"
              value={newDiscussion.description}
              onChange={(e) =>
                setNewDiscussion({
                  ...newDiscussion,
                  description: e.target.value,
                })
              }
              maxLength={500}
            />
            <input
              className="form-control mb-3"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, image: e.target.files[0] })
              }
            />
            <div className="mb-3">
              <small className="text-danger">
                {" "}
                *Max upload file size 5 MB and accepted only (.jpg and .jpeg)
              </small>
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={isCreating || !newDiscussion.title.trim()}
            >
              {isCreating ? "Creating..." : "Create Discussion"}
            </button>
          </form>
        </div>

        <div className="discussions-list">
          <div className="discussion-header-section border-bottom">
            <h3 className="border-0" style={{ color: "orangered" }}>
              Discussions List
            </h3>
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {discussions.length === 0 ? (
            <p className="no-discussions">No discussions found.</p>
          ) : (
            discussions.map((discussion, index) => (
              <div key={discussion.discussion_id} className="discussion-card">
                <div className="discussion-header">
                  {editingDiscussionId === discussion.discussion_id ? (
                    <input
                      className="form-control mb-2"
                      type="text"
                      value={editDiscussionData.title}
                      onChange={(e) =>
                        setEditDiscussionData({
                          ...editDiscussionData,
                          title: e.target.value,
                        })
                      }
                      maxLength={100}
                    />
                  ) : (
                    <Link
                      className="nav-link"
                      to={`/others/discussion/${discussion.discussion_id}`}
                    >
                      <h4>
                        {(page - 1) * DISCUSSIONS_PER_PAGE + index + 1}.{" "}
                        {textLengthLimit(discussion.title, 80)}
                      </h4>
                    </Link>
                  )}
                </div>

                {editingDiscussionId === discussion.discussion_id ? (
                  <>
                    {/* Description editing */}
                    <label className="form-label">Edit Description</label>
                    <textarea
                      className="form-control mb-3"
                      value={editDiscussionData.description}
                      onChange={(e) =>
                        setEditDiscussionData({
                          ...editDiscussionData,
                          description: e.target.value,
                        })
                      }
                      maxLength={500}
                      rows={4}
                    />

                    {/* Image editing */}
                    <label className="form-label">Change Image</label>
                    <input
                      className="form-control mb-3"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditDiscussionData({
                          ...editDiscussionData,
                          image: e.target.files[0],
                        })
                      }
                    />
                    <div className="mb-3">
                      <small className="text-danger">
                        {" "}
                        *Max upload file size 5 MB and accepted only (.jpg and
                        .jpeg)
                      </small>
                    </div>

                    {/* Existing image preview (optional) */}
                    {discussion.image && (
                      <div className="mt-2">
                        <p>Current Image:</p>
                        <img
                          src={`${API_URL}/uploads/${discussion.image}`}
                          alt="Discussion"
                          className="img-fluid rounded mt-1"
                          style={{ height: "100px" }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Normal view mode */}
                    {discussion.description && (
                      <p>{textLengthLimit(discussion.description, 200)}</p>
                    )}
                  </>
                )}

                <div className="discussion-meta">
                  <p>
                    Posted by: <strong>{discussion.created_name}</strong>
                  </p>
                  <p>
                    Created: {new Date(discussion.createdAt).toLocaleString()}
                  </p>
                </div>

                {(userRole === "admin" ||
                  discussion.created_name === userName) && (
                  <div className="discussion-actions text-end">
                    {editingDiscussionId === discussion.discussion_id ? (
                      <>
                        <button
                          className="btn btn-success btn-sm px-2 py-0"
                          onClick={() =>
                            handleSaveEditDiscussion(discussion.discussion_id)
                          }
                        >
                          {isUpdatingDiscussion ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm ms-2 px-2 py-0"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-primary btn-sm px-2 py-0"
                          onClick={() =>
                            handleEditDiscussion(discussion.discussion_id)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm ms-2 px-2 py-0"
                          onClick={() =>
                            handleDeleteDiscussion(discussion.discussion_id)
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          <DeleteConfirmModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onConfirm={confirmDelete}
            title="Delete Discussion?"
            message="Are you sure you want to delete this discussion? This action cannot be undone."
          />

          {totalPages > 1 && (
            <div className="pagination-controls bottom">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Discussion;
