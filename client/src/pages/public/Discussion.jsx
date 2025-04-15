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

const API_URL = import.meta.env.VITE_API_URL;
const DISCUSSIONS_PER_PAGE = 5; // Increased to show more discussions per page

const Discussion = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
  });
  const [editingDiscussionId, setEditingDiscussionId] = useState(null);
  const [editDiscussionData, setEditDiscussionData] = useState({
    title: "",
    description: "",
  });
  const [totalDiscussions, setTotalDiscussions] = useState(0);

  const token = getToken();
  const userName = getUsername();
  const userRole = getRole();

  // Calculate total pages based on total discussions
  const totalPages = Math.ceil(totalDiscussions / DISCUSSIONS_PER_PAGE);

  // Fetch all discussions
  const {
    data: allDiscussions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["discussions"],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/discussions/getdiscussions`
      );
      setTotalDiscussions(response.data.discussions.length);
      return response.data.discussions;
    },
    staleTime: 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  // Get paginated discussions using slice
  const getPaginatedDiscussions = () => {
    if (!allDiscussions) return [];
    const startIndex = (page - 1) * DISCUSSIONS_PER_PAGE;
    const endIndex = startIndex + DISCUSSIONS_PER_PAGE;
    return allDiscussions.slice(startIndex, endIndex);
  };

  const discussions = getPaginatedDiscussions();

  // Create new discussion mutation
  const {
    mutate: createDiscussion,
    isLoading: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (discussionData) => {
      const response = await axios.post(
        `${API_URL}/api/discussions/createnewdiscussion`,
        discussionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      setNewDiscussion({ title: "", description: "" });
      // After creating, go to the last page if not already there
      const newTotal = totalDiscussions + 1;
      const newTotalPages = Math.ceil(newTotal / DISCUSSIONS_PER_PAGE);
      if (page !== newTotalPages) {
        setPage(newTotalPages);
      }
    },
  });

  // Update discussion mutation
  const {
    mutate: updateDiscussion,
    isLoading: isUpdatingDiscussion,
    error: updateDiscussionError,
  } = useMutation({
    mutationFn: async ({ discussionId, title, description }) => {
      const response = await axios.put(
        `${API_URL}/api/discussions/${discussionId}`,
        { title, description },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      setEditingDiscussionId(null);
    },
    onError: (error) => {
      console.error("Update discussion error:", error);
    },
  });

  // Delete discussion mutation
  const { mutate: deleteDiscussion } = useMutation({
    mutationFn: async (discussionId) => {
      const response = await axios.delete(
        `${API_URL}/api/discussions/deletediscussions/${discussionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      // If we deleted the last discussion on the last page, go to previous page
      if (discussions.length === 1 && page > 1) {
        setPage(page - 1);
      }
    },
  });

  const handleCreateDiscussion = (e) => {
    e.preventDefault();
    if (!newDiscussion.title.trim()) return;
    createDiscussion(newDiscussion);
  };

  const handleDeleteDiscussion = (discussionId) => {
    if (window.confirm("Are you sure you want to delete this discussion?")) {
      deleteDiscussion(discussionId);
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
    });
  };

  const handleSaveEditDiscussion = (discussionId) => {
    if (!editDiscussionData.title.trim()) return;
    updateDiscussion({
      discussionId,
      title: editDiscussionData.title,
      description: editDiscussionData.description,
    });
  };

  const handleCancelEdit = () => {
    setEditingDiscussionId(null);
    setEditDiscussionData({ title: "", description: "" });
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
        {/* Discussion Creation Form */}
        <div className="discussion-form">
          <h3 style={{ color: "orangered" }}>Start a New Discussion</h3>
          {createError && (
            <div className="error-message">
              {createError.response?.data?.error ||
                "Failed to create discussion"}
            </div>
          )}
          <form onSubmit={handleCreateDiscussion}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Discussion Title*"
                value={newDiscussion.title}
                onChange={(e) =>
                  setNewDiscussion({ ...newDiscussion, title: e.target.value })
                }
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <textarea
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

        {/* Discussions List */}
        <div className="discussions-list">
          <div className="discussion-header-section border-bottom">
            <div>
              <h3 className="border-0" style={{ color: "orangered" }}>
                Discussions List
              </h3>
            </div>
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

          {allDiscussions?.length === 0 ? (
            <p className="no-discussions">
              No discussions yet. Be the first to start one!
            </p>
          ) : (
            <>
              {discussions.map((discussion, index) => (
                <div key={discussion.discussion_id} className="discussion-card">
                  <div className="discussion-header">
                    {editingDiscussionId === discussion.discussion_id ? (
                      <div className="w-100">
                        <p className="discussion-description fw-bold">
                          Discussion Title:
                        </p>
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
                      </div>
                    ) : (
                      <Link
                        className="nav-link"
                        to={`/others/discussion/${discussion.discussion_id}`}
                      >
                        <h4>
                          {(page - 1) * DISCUSSIONS_PER_PAGE +
                            discussion.discussion_id}
                          . {textLengthLimit(discussion.title, 80)}
                        </h4>
                      </Link>
                    )}
                  </div>

                  {editingDiscussionId === discussion.discussion_id ? (
                    <div>
                      <p className="discussion-description fw-bold">
                        Discussion description:
                      </p>
                      <textarea
                        className="form-control mb-2"
                        value={editDiscussionData.description}
                        onChange={(e) =>
                          setEditDiscussionData({
                            ...editDiscussionData,
                            description: e.target.value,
                          })
                        }
                        maxLength={500}
                      />
                    </div>
                  ) : (
                    discussion.description && (
                      <div>
                        <p className="discussion-description fw-bold mb-1">
                          Discussion description:
                        </p>
                        <p> . {textLengthLimit(discussion.description, 200)}</p>
                      </div>
                    )
                  )}

                  <div className="discussion-meta">
                    <p>
                      Posted by:{" "}
                      <strong>{discussion.created_name || "Unknown"}</strong>
                    </p>
                    <p>
                      Created At:{" "}
                      {new Date(discussion.createdAt).toLocaleString()}
                    </p>
                    <p>
                      Updated At:{" "}
                      {new Date(discussion.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Admin/Creator can edit or delete the discussion */}
                  {(userRole === "admin" ||
                    discussion.created_name === userName) && (
                    <div className="discussion-actions text-end d-flex justify-content-end align-items-center">
                      {editingDiscussionId === discussion.discussion_id ? (
                        <div>
                          <button
                            className="btn btn-success btn-sm py-0 px-2 m-end"
                            onClick={() =>
                              handleSaveEditDiscussion(discussion.discussion_id)
                            }
                            disabled={isUpdatingDiscussion}
                          >
                            {isUpdatingDiscussion ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="btn btn-danger btn-sm py-0 px-2 ms-2"
                            onClick={handleCancelEdit}
                            disabled={isUpdatingDiscussion}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              className="btn btn-primary btn-sm py-0 px-2"
                              onClick={() =>
                                handleEditDiscussion(discussion.discussion_id)
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm py-0 px-2 ms-2"
                              onClick={() =>
                                handleDeleteDiscussion(discussion.discussion_id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Bottom pagination controls */}
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
