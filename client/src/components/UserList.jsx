import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../auth/auth";
import axios from "axios";
import { useState } from "react";
import "../style/App.css";
import React from "react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger">
          Something went wrong. Please try again later.
        </div>
      );
    }

    return this.props.children;
  }
}

const UsersList = () => {
  const token = getToken();
  const queryClient = useQueryClient();

  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState(null);

  // Filter states for each column
  const [filters, setFilters] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    address: "",
  });

  const {
    data: users = [], // Default to an empty array if data is undefined
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/users/getusers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters, // Pass filters to API
      });
      return response.data;
    },
    enabled: true, // Ensures auto-fetching when component mounts
    staleTime: 1000,
    refetchOnWindowFocus: true, // Auto-refetch when the tab is focused
    refetchOnReconnect: true, // Auto-refetch when internet reconnects
    enabled: !!token,
    onError: (error) => {
      console.error("Error fetching users:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      return await axios.delete(`${API_URL}/api/users/deleteuser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      // Invalidate users list to trigger a refetch and ensure data is up to date
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to delete user.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedUser) => {
      // Exclude password from the updated data
      const { password, ...dataWithoutPassword } = updatedUser;

      return await axios.put(
        `${API_URL}/api/users/updateuser/${updatedUser.id}`,
        dataWithoutPassword, // Send data without password
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUserId(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to update user.");
    },
  });

  const handleEdit = (user) => {
    setEditingUserId(user.id || user._id);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveEdit = () => {
    if (editedUser) {
      updateMutation.mutate(editedUser);
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(userId);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="container text-center my-5">
        <h2>Loading users...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error.response?.data?.message || "Error fetching users."}
      </div>
    );
  }

  return (
    <>
      <ErrorBoundary>
        <div className="container-fluid">
          <h1 className="text-center fw-bold my-3 text-light">Users</h1>

          {/* Filter row */}
          <div className="mb-3 d-flex justify-content-center align-items-center gap-3 flex-wrap">
            <div>
              <input
                type="text"
                className="form-control"
                name="username"
                value={filters.username}
                onChange={handleFilterChange}
                placeholder="Filter by Username"
              />
            </div>
            <div>
              <input
                type="text"
                className="form-control"
                name="fullName"
                value={filters.fullName}
                onChange={handleFilterChange}
                placeholder="Filter by Full Name"
              />
            </div>
            <div>
              <input
                type="text"
                className="form-control"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                placeholder="Filter by Email"
              />
            </div>
            <div>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={filters.phone}
                onChange={handleFilterChange}
                placeholder="Filter by Phone"
              />
            </div>
            <div>
              <input
                type="text"
                className="form-control"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Filter by City"
              />
            </div>
            <div>
              <input
                type="text"
                className="form-control"
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
                placeholder="Filter by Country"
              />
            </div>
          </div>

          <div className="table-responsive user-table-custom-scroll">
            <table className="table table-hover table-bordered border-secondary text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Full Name</th>
                  <th>Age</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Address</th>
                  <th>CreatedAt</th>
                  <th>UpdatedAt</th>
                  <th colSpan={2}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!users || users.length === 0 ? (
                  <div className="text-light mt-3">User not found</div>
                ) : null}

                {users.map((user, index) => (
                  <tr
                    key={user.id || user._id}
                    className={
                      editingUserId === user.id || editingUserId === user._id
                        ? "table-danger"
                        : ""
                    }
                  >
                    <td>{index + 1}</td>
                    {editingUserId === user.id || editingUserId === user._id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={editedUser?.id || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={editedUser?.username || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name="fullName"
                            value={editedUser?.fullName || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name="age"
                            value={editedUser?.age || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={editedUser?.email || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={editedUser?.phone || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name="city"
                            value={editedUser?.city || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name="country"
                            value={editedUser?.country || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={editedUser?.address || ""}
                            onChange={handleInputChange}
                          />
                        </td>
                        <td>
                          {format(
                            new Date(user.createdAt),
                            "dd-MMM-yyyy HH:mm:SS"
                          )}
                        </td>
                        <td>
                          {format(
                            new Date(user.updatedAt),
                            "dd-MMM-yyyy HH:mm:ss"
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm w-100 w-md-auto px-2 py-0"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm w-100 w-md-auto px-2 py-0"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.fullName}</td>
                        <td>{user.age}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.city}</td>
                        <td>{user.country}</td>
                        <td>{user.address}</td>
                        <td>
                          {format(
                            new Date(user.createdAt),
                            "dd-MMM-yyyy HH:mm:ss"
                          )}
                        </td>
                        <td>
                          {format(
                            new Date(user.updatedAt),
                            "dd-MMM-yyyy HH:mm:ss"
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-warning btn-sm px-2 py-0"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm px-2 py-0"
                            onClick={() => handleDelete(user.id || user._id)}
                            disabled={deleteMutation.isLoading}
                          >
                            {deleteMutation.isLoading
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default UsersList;
