import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../style/RegisterPage.css";
import orangeWave from "../../assets/images/Shape.png";
import logo from "../../assets/images/book-logo.png";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    age: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    termsAccepted: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showPasswordPopover, setShowPasswordPopover] = useState(false); // Popover visibility state
  const navigate = useNavigate();

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    if (password.length < minLength) {
      return "Password must be at least 6 characters long.";
    }
    if (!hasUppercase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowercase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character.";
    }
    return ""; // No error
  };

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        userData
      );
      return response.data;
    },
    onSuccess: () => {
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    },
    onError: (err) => {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    const errors = {};

    if (!formData.username) {
      errors.username = "Username is required.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        errors.password = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.fullName) {
      errors.fullName = "Full name is required.";
    }

    if (!formData.age) {
      errors.age = "Age is required.";
    }

    if (!formData.email) {
      errors.email = "Email is required.";
    }

    if (!formData.phone) {
      errors.phone = "Phone number is required.";
    }

    if (!formData.country) {
      errors.country = "Country is required.";
    }

    if (!formData.city) {
      errors.city = "City is required.";
    }

    if (!formData.address) {
      errors.address = "Address is required.";
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted =
        "You read and must accept the terms and conditions.";
    }

    // If there are any errors, set the first one
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      setError(errors[firstErrorKey]); // Or show all errors if needed
      return;
    }

    // Prepare user data for registration
    const userData = {
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      age: formData.age,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      address: formData.address,
      termsAccepted: formData.termsAccepted,
      role: "student", // Default role for new users
    };

    // Trigger the registration mutation
    registerMutation.mutate(userData);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <div className="container-fluid register">
      <div>
        <img className="bg-img" src={orangeWave} alt="orangeWave" />
      </div>

      <div className="register-form-container">
        <h1 className="text-center text-light fw-bold display-3 mt-5">
          Register a New Account
        </h1>
        <form onSubmit={handleRegister} className="px-5 pt-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <div className="form-group my-3">
                <input
                  className="form-control shadow"
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div
                className="form-group my-3"
                onClick={() => setShowPasswordPopover(true)}
                onMouseLeave={() => setShowPasswordPopover(false)}
              >
                <div className="input-group shadow">
                  <input
                    className="form-control"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? (
                      <i className="bi bi-eye-slash"></i>
                    ) : (
                      <i className="bi bi-eye"></i>
                    )}
                  </span>
                </div>
                {showPasswordPopover && (
                  <div className="password-popover">
                    <ul>
                      <li>Be at least 6 characters long</li>
                      <li>Contain at least one uppercase letter</li>
                      <li>Contain at least one lowercase letter</li>
                      <li>Contain at least one number</li>
                      <li>Contain at least one special character</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="form-group my-3">
                <div className="input-group shadow">
                  <input
                    className="form-control"
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {confirmPasswordVisible ? (
                      <i className="bi bi-eye-slash"></i>
                    ) : (
                      <i className="bi bi-eye"></i>
                    )}
                  </span>
                </div>
              </div>
              <div className="form-group my-3">
                <input
                  className="form-control shadow"
                  type="text"
                  placeholder="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group my-3">
                <input
                  className="form-control shadow"
                  type="number"
                  placeholder="Age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <div className="form-group my-3">
                <input
                  className="form-control shadow"
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group my-3">
                <input
                  className="form-control shadow"
                  type="text"
                  placeholder="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group my-3">
                <input
                  className="form-control shadow"
                  type="text"
                  placeholder="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group my-3">
                <input
                  className="form-control"
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group my-3">
                <input
                  className="form-control shadow"
                  type="text"
                  placeholder="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-check my-2">
            <input
              type="checkbox"
              className="form-check-input shadow"
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="terms">
              I accept the{" "}
              <Link className="link-dark" to="/legal/terms&conditions">
                terms and conditions
              </Link>
            </label>
          </div>

          <div className="d-flex justify-content-center my-3">
            <button
              className="btn btn-primary w-50 shadow btn-register"
              type="submit"
              disabled={registerMutation.isLoading}
            >
              {registerMutation.isLoading ? "Registering..." : "Register"}
            </button>
          </div>
          <p className="fw-bold my-4 text-center">
            If you have account please{" "}
            <Link to="/login" className="link-danger">
              Login
            </Link>
          </p>
        </form>
        <p className="fw-bold  text-center">
          <Link to="/" className="link-light">
            <button className="btn btn-light text-danger fw-bold">
              <i className="bi bi-house-door me-2"></i>
              Go to Home
            </button>
          </Link>
        </p>
      </div>
      <div className="register-card d-flex flex-column justify-content-center align-items-center">
        <div>
          <h1 className="text-light text-center display-2 fw-bold my-5">
            Welcome to
          </h1>
        </div>

        <Link to="/">
          {" "}
          <div className="image my-5 py-5">
            <img src={logo} alt="logo" />
          </div>
        </Link>
        <div>
          <h1 className="text-light fw-bold my-5 text-center mt-5 pt-4">
            Weld Quiz
          </h1>
        </div>
        <div>
          <p className="my-5 fs-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos
            reprehenderit sed odit sequi voluptatibus non dolorem repellat nulla
            repellendus minima, libero in aliquid cum. Eaque eligendi dolore
            tempora nisi quasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
