import React, { useState } from "react";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { getUsernameInitials } from "../../utils/utils";
import "../../style/MyProfile.css";
import Cookies from "js-cookie";

const fetchUserProfile = async () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("User not logged in");

  const API_URL = import.meta.env.VITE_API_URL;
  if (!API_URL) throw new Error("API URL not set");

  try {
    const decoded = jwtDecode(token);
    const { data } = await axios.get(
      `${API_URL}/api/users/getusers/${decoded.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    throw new Error("Failed to fetch user profile");
  }
};

const MyProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    retry: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    country: "",
    city: "",
    address: "",
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updatedData) => {
      const token = Cookies.get("token");
      const API_URL = import.meta.env.VITE_API_URL;

      // Exclude password from the updated data
      const { password, ...dataWithoutPassword } = updatedData;

      const { data } = await axios.put(
        `${API_URL}/api/users/updateuser/${user.id}`,
        dataWithoutPassword, // Send data without password
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile"]);
      setEditMode(false);
    },
  });

  const handleEdit = () => {
    setEditMode(true);
    setFormData(user);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

  if (error) {
    console.error(error.message);
    if (error.message === "User not logged in") {
      navigate("/login");
    }
    return <p className="text-danger text-center">{error.message}</p>;
  }

  if (isLoading) return <p>Loading profile...</p>;

  return (
    <>
      <Navbar />
      <Header title="My Profile" />
      <div className="container mt-5">
        <div className="row justify-content-center my-5">
          <div className="user-info border-0 d-md-flex justify-content-start align-items-center">
            <div className="box rounded shadow-lg box-1 p-5 d-flex align-items-center flex-column justify-content-center text-center">
              <div
                className="profile-pic rounded-circle d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "orangered" }}
              >
                <h1 className="display-2 fw-bold">
                  {" "}
                  {getUsernameInitials(user.username)}
                </h1>
              </div>
              <h3 className="mb-1 mt-3 text-uppercase">{user.fullName}</h3>
              <p className="text-muted">@{user.username}</p>
            </div>
            <div className="box box-2 px-5 py-3 w-100 rounded shadow-lg">
              <h2 className="py-4 text-center border-bottom border-5 border-danger">
                User Information
              </h2>
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <div className="d-md-flex justify-content-around align-items-center gap-5">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control mb-3"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-around align-items-center gap-5">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="d-md-flex justify-content-around align-items-center gap-5">
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="w-100 user-details">
                    <div className="d-md-flex justify-content-between align-items-center my-5">
                      <p className="fs-5 p-2 px-5">
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p className="fs-5 p-2 px-5">
                        <strong>Phone:</strong> {user.phone}
                      </p>
                    </div>
                    <div className="d-md-flex justify-content-between align-items-center mb-5">
                      <p className="fs-5 p-2 px-5">
                        <strong>Age:</strong> {user.age}
                      </p>
                      <p className="fs-5 p-2 px-5">
                        <strong>Country:</strong> {user.country}
                      </p>
                    </div>
                    <div className="d-md-flex justify-content-between align-items-center mb-5">
                      <p className="fs-5 p-2 px-5">
                        <strong>City:</strong> {user.city}
                      </p>
                      <p className="fs-5 p-2 px-5">
                        <strong>Address:</strong> {user.address}
                      </p>
                    </div>
                    <div className="d-md-flex justify-content-center">
                      <div className="d-md-flex justify-content-center align-items-center mt-2">
                        <p className=" px-5">
                          <strong>Created At:</strong>{" "}
                          {new Date(user.createdAt).toLocaleString()}
                        </p>
                        <p className=" px-5">
                          <strong>Updated At:</strong>{" "}
                          {new Date(user.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-center my-3">
                      <button
                        className="btn"
                        style={{ backgroundColor: "orangered", color: "white" }}
                        onClick={handleEdit}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyProfile;
