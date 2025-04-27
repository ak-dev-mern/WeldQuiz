import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../auth/auth";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import "../style/App.css";
import React from "react";
import { format } from "date-fns";
import { Modal } from "react-bootstrap"; // Import Modal from react-bootstrap
import DeleteConfirmModal from "./DeleteConfirmModal";

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
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  // Debounce state to delay the filter action
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Set debounce delay time (500ms)
  const debounceDelay = 500;

  useEffect(() => {
    // Set a timer to update the debounced filters
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceDelay);

    // Cleanup function to clear the timer if the user is still typing
    return () => clearTimeout(timer);
  }, [filters]);

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", debouncedFilters],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/users/getusers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: debouncedFilters, // Use debounced filters for API request
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    onError: (error) => {
      console.error("Error fetching users:", error);
    },
  });

  // Fetch all customers

  const fetchAllCustomers = async () => {
    const token = localStorage.getItem("token"); // Adjust if you store token differently
    const { data } = await axios.get(`${API_URL}/api/payment/all-customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.customers;
  };

  const { data: customers = [] } = useQuery({
    queryKey: ["allCustomers"],
    queryFn: fetchAllCustomers,
    enabled: !!token,
    staleTime: 0,
    refetchInterval: 5000,
    keepPreviousData: true,
  });

  // Match email address local to stripe

  const customerList = customers.map((cust) => cust.email);
  const customerEmailsLower = customerList.map((email) => email?.toLowerCase());

  const usersWithStatus = users.map((user) => ({
    ...user,
    status: customerEmailsLower.includes(user.email?.toLowerCase())
      ? "Active"
      : "Inactive",
  }));

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      return await axios.delete(`${API_URL}/api/users/deleteuser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to delete user.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedUser) => {
      const { password, ...dataWithoutPassword } = updatedUser;

      return await axios.put(
        `${API_URL}/api/users/updateuser/${updatedUser.id}`,
        dataWithoutPassword,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUserId(null);
      setEditedUser(null); // Reset the edited user after saving
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
    setUserToDelete(userId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
      setShowModal(false);
    }
  };

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
            {/* Filter inputs */}
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
              {" "}
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
              {" "}
              <input
                type="text"
                className="form-control"
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
                placeholder="Filter by Country"
              />
            </div>
            <div>
              {" "}
              <input
                type="text"
                className="form-control"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                placeholder="Filter by Address"
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
                  <th>Subscription Status</th>
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
                {users.length === 0 && (
                  <tr>
                    <td colSpan="13">No users found</td>
                  </tr>
                )}
                {usersWithStatus.map((user, index) => (
                  <tr key={user.id || user._id}>
                    <td>{index + 1}</td>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.fullName}</td>
                    <td>{user.age}</td>
                    <td>{user.email}</td>
                    <td
                      className={` ${
                        user.status === "Active"
                          ? "text-success  fw-bold"
                          : "text-danger fw-bold"
                      }`}
                    >
                      {user.status}
                    </td>
                    <td>{user.phone}</td>
                    <td>{user.city}</td>
                    <td>{user.country}</td>
                    <td>{user.address}</td>
                    <td>
                      {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td>
                      {format(new Date(user.updatedAt), "yyyy-MM-dd HH:mm")}
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
                        className="btn btn-danger btn-sm py-0 px-2"
                        onClick={() => handleDelete(user.id || user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                <DeleteConfirmModal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  onConfirm={confirmDelete}
                  title="Delete User Record?"
                  message="Are you sure you want to delete this record? This action cannot be undone."
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        <Modal show={editingUserId !== null} onHide={handleCancelEdit} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editedUser && (
              <form>
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={editedUser.username || ""}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editedUser.email || ""}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={editedUser.fullName || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      name="age"
                      value={editedUser.age || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3 col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={editedUser.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={editedUser.city || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={editedUser.country || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={editedUser.address || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary btn-default "
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-default"
              onClick={handleSaveEdit}
            >
              Save Changes
            </button>
          </Modal.Footer>
        </Modal>
      </ErrorBoundary>
    </>
  );
};

export default UsersList;
