import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Navbar from "../../components/Navbar.jsx";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import "../../style/Discussion.css";
import { getRole, getToken, getUsername } from "../../auth/auth.js";
import DeleteConfirmModal from "../../components/DeleteConfirmModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const DiscussionDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const token = getToken();
  const userName = getUsername();
  const userRole = getRole();

  // Fetch discussion details
  const {
    data: discussion,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["discussionDetail", id],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/discussions/getdiscussions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.discussion;
    },
    enabled: !!id,
  });

  // Add message mutation
  const {
    mutate: addMessage,
    isLoading: isSending,
    error: messageError,
  } = useMutation({
    mutationFn: async (message) => {
      const response = await axios.post(
        `${API_URL}/api/discussions/createmessages/${id}/messages`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussionDetail", id]);
      setNewMessage("");
    },
  });

  // Edit message mutation
  const {
    mutate: editMessage,
    isLoading: isEditingMessage,
    error: editMessageError,
  } = useMutation({
    mutationFn: async ({ messageId, message }) => {
      const response = await axios.put(
        `${API_URL}/api/discussions/updatemessage/${id}/${messageId}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussionDetail", id]);
      setEditingMessageId(null);
    },
  });

  // Delete message mutation
  const { mutate: deleteMessage } = useMutation({
    mutationFn: async (messageId) => {
      const response = await axios.delete(
        `${API_URL}/api/discussions/deletemessage/${id}/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussionDetail", id]);
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addMessage(newMessage);
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete);
      setShowModal(false);
    }
  };

  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingMessageText(currentText);
  };

  const handleSaveMessageEdit = (messageId) => {
    if (editingMessageText.trim()) {
      editMessage({ messageId, message: editingMessageText });
    }
  };

  const handleCancelMessageEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
  };

  if (isLoading) return <div className="loading">Loading discussion...</div>;
  if (isError) return <div className="error">Error: {error.message}</div>;

  return (
    <>
      <Navbar />
      <Header title="Discussion Details" />

      <div className="discussion-page-container discussion-details-container card border-0 p-md-5 shadow">
        <div className="discussion-card">
          <div className="discussion-header text-start">
            <h2>
              {discussion?.discussion_id}. {""}
              {discussion?.title}
            </h2>
          </div>

          <div className="discussion-meta">
            <p>
              Posted by:{" "}
              <strong>{discussion?.created_name || "Unknown"}</strong>
            </p>
            <p>
              Created At: {new Date(discussion?.createdAt).toLocaleString()}
            </p>
            <p>
              Updated At: {new Date(discussion?.updatedAt).toLocaleString()}
            </p>
          </div>

          {discussion?.description && (
            <div>
              <p className="discussion-description fw-bold mb-0">
                Discussion description:
              </p>
              <p className="discussion-description mb-5">
                {discussion.description}
              </p>
            </div>
          )}

          <div className="messages-section">
            <h3>
              Messages (
              {Array.isArray(discussion?.messages)
                ? discussion.messages.length
                : 0}
              )
            </h3>

            {Array.isArray(discussion?.messages) &&
            discussion.messages.length > 0 ? (
              <div className="messages-list">
                {discussion.messages.map((message) => (
                  <div key={message.message_id} className="message">
                    <div className="message-header">
                      <p>
                        Posted by:{" "}
                        <strong>
                          {message.sendername || message.senderId || "Unknown"}
                        </strong>
                      </p>
                      <span>
                        <p>
                          Created At:{" "}
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </span>
                      <span>
                        <p>
                          Updated At:{" "}
                          {new Date(message.updatedAt).toLocaleString()}
                        </p>
                      </span>
                    </div>

                    {editingMessageId === message.message_id ? (
                      <textarea
                        className="form-control mb-2"
                        value={editingMessageText}
                        onChange={(e) => setEditingMessageText(e.target.value)}
                        maxLength={500}
                      />
                    ) : (
                      <p className="message-content">{message.text}</p>
                    )}
                    {/* Show edit/delete buttons only for the message sender */}
                    {(userRole === "admin" ||
                      message.sendername === userName) && (
                      <div className="message-actions my-2 text-end pe-2">
                        {editingMessageId === message.message_id ? (
                          <>
                            <button
                              className="btn btn-success btn-sm py-0 px-2"
                              onClick={() =>
                                handleSaveMessageEdit(message.message_id)
                              }
                              disabled={isEditingMessage}
                            >
                              {isEditingMessage ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="btn btn-danger btn-sm py-0 px-2 ms-2"
                              onClick={handleCancelMessageEdit}
                              disabled={isEditingMessage}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-primary btn-sm py-0 px-2"
                              onClick={() =>
                                handleEditMessage(
                                  message.message_id,
                                  message.text
                                )
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm py-0 px-2 ms-2"
                              onClick={() =>
                                handleDeleteMessage(message.message_id)
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-messages">No messages yet</p>
            )}

            <DeleteConfirmModal
              show={showModal}
              onHide={() => setShowModal(false)}
              onConfirm={confirmDelete}
              title="Delete Message?"
              message="Are you sure you want to delete this message? This action cannot be undone."
            />

            {/* Reply Form */}
            <div className="reply-form">
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write your reply..."
                  maxLength={500}
                  disabled={isSending}
                />
                <div className="reply-footer">
                  <span className="character-count">
                    {newMessage.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                  >
                    {isSending ? "Sending..." : "Post Reply"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="back-link mt-3">
          <Link to="/others/discussion">
            <button
              onClick={() => window.history.back()}
              className="btn btn-sm btn-default"
            >
              ← Back to Discussions
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default DiscussionDetail;
