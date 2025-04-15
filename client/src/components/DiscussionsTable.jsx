import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { getToken } from "../auth/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch discussions with authorization header
const fetchDiscussions = async () => {
  const token = getToken(); // Get token dynamically
  const response = await axios.get(
    `${API_URL}/api/discussions/getdiscussions`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Add JWT token
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Custom hook for fetching discussions
const useDiscussions = () => {
  return useQuery({
    queryKey: ["discussions"],
    queryFn: fetchDiscussions,
    refetchInterval: 5000, // Auto refresh every 5s
    staleTime: 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
};

const DiscussionsTable = () => {
  const queryClient = useQueryClient();
  const { data: discussionsData, isLoading, isError, error } = useDiscussions();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    queryClient.invalidateQueries(["discussions"]);
  }, [queryClient]);

  if (isLoading)
    return <p className="text-center mt-3">Loading discussions...</p>;
  if (isError)
    return (
      <p className="text-danger text-center mt-3">Error: {error.message}</p>
    );

  const discussions = Array.isArray(discussionsData?.discussions)
    ? discussionsData.discussions
    : [];

  // Pagination calculations
  const totalPages = Math.ceil(discussions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDiscussions = discussions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="container mt-4">
      <h1 className="text-center fw-bold my-3 text-light">Discussion List</h1>
      <div className="table-responsive">
        <table className="table table-hover table-bordered user-table-custom-scroll">
          <thead className="table-primary">
            <tr>
              <th>Discussuion ID</th>
              <th>Created By</th>
              <th>Created Name</th>
              <th>Title</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {currentDiscussions.length > 0 ? (
              currentDiscussions.map((discussion) => (
                <tr key={discussion.discussion_id}>
                  <td>{discussion.discussion_id}</td>
                  <td>{discussion.created_by}</td>
                  <td>{discussion.created_name}</td>
                  <td>{discussion.title}</td>
                  <td>{discussion.description}</td>
                  <td>{new Date(discussion.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(discussion.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No discussions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
          <button
            className="btn btn-light border d-flex align-items-center"
            onClick={() => setCurrentPage((prev) => prev - 1)}
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
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-light border d-flex align-items-center"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscussionsTable;
