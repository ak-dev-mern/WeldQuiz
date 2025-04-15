import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { getToken } from "../auth/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all messages
const fetchMessages = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/api/discussions/getmessages`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Custom hook for fetching messages
const useMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
    refetchInterval: 5000, // Auto refresh every 5s
    staleTime: 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
};

const MessagesTable = () => {
  const queryClient = useQueryClient();
  const { data: messagesData, isLoading, isError, error } = useMessages();
  const [page, setPage] = useState(1);
  const rowsPerPage = 100;

  useEffect(() => {
    queryClient.invalidateQueries(["messages"]);
  }, [queryClient]);

  if (isLoading) return <p className="text-center mt-3">Loading messages...</p>;
  if (isError)
    return (
      <p className="text-danger text-center mt-3">Error: {error.message}</p>
    );

  const messages = Array.isArray(messagesData?.messages)
    ? messagesData.messages
    : [];

  const totalPages = Math.ceil(messages.length / rowsPerPage);
  const paginatedMessages = messages.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center fw-bold my-3 text-light">All Messages</h1>
      <div className="table-responsive">
        <table className="table table-hover table-bordered user-table-custom-scroll">
          <thead className="table-primary">
            <tr>
              <th>Message ID</th>
              <th>Sender ID</th>
              <th>Sender Name</th>
              <th>Discussion ID</th>
              <th>Text</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMessages.length > 0 ? (
              paginatedMessages.map((message) => (
                <tr key={message.message_id}>
                  <td>{message.message_id}</td>
                  <td>{message.senderId}</td>
                  <td>{message.sendername}</td>
                  <td>{message.discussionId}</td>
                  <td>{message.text}</td>
                  <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(message.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {messages.length > rowsPerPage && (
        <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
          <button
            className="btn btn-light border d-flex align-items-center"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ⬅️ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`btn ${
                page === i + 1 ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-light border d-flex align-items-center"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesTable;
