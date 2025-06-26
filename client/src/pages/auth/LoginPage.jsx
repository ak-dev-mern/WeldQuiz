import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setStudent } from "../../features/studentSlice";
import { Link, useNavigate } from "react-router-dom";
import "../../style/LoginPage.css";
import orangeWave from "../../assets/images/shape.png";
import logo from "../../assets/images/book-logo.png";
import Cookies from "js-cookie";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.student);
  const navigationAttempted = useRef(false);

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Stable redirect function with navigation guard
  const redirectUser = useCallback(
    (userRole) => {
      if (navigationAttempted.current) return;

      navigationAttempted.current = true;
      const targetPath =
        userRole === "admin" ? "/admin/dashboard" : "/student/dashboard";
      navigate(targetPath, { replace: true });
    },
    [navigate]
  );

  // Single auth check on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = () => {
      try {
        const savedToken = Cookies.get("token");
        const savedRole = Cookies.get("role");
        const savedUsername = Cookies.get("username");
        const savedEmail = Cookies.get("email");

        if (savedToken && savedRole && savedEmail && isMounted) {
          dispatch(
            setStudent({
              username: savedUsername,
              role: savedRole,
              token: savedToken,
              email: savedEmail,
            })
          );
          redirectUser(savedRole);
        } else if (token && role && email && isMounted) {
          redirectUser(role);
        }
      } finally {
        if (isMounted) {
          setIsAuthChecked(true);
        }
      }
    };

    // Delay the auth check to ensure single execution
    const timer = setTimeout(checkAuth, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [dispatch, redirectUser, token, role]);

  const validateForm = () => {
    if (!credentials.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!credentials.password) {
      setError("Password is required");
      return false;
    }
    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      const { token, role, username, email } = data;

      dispatch(setStudent({ username, role, token, email }));

      if (rememberMe) {
        const expires = new Date(new Date().setDate(new Date().getDate() + 7));
        Cookies.set("token", token, { expires });
        Cookies.set("role", role, { expires });
        Cookies.set("username", username, { expires });
        Cookies.set("email", email, { expires });
      }

      redirectUser(role);
    },
    onError: (error) => {
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.status === 401) {
        errorMessage = "Invalid username or password";
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      setError(errorMessage);
    },
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (validateForm()) {
      loginMutation.mutate();
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid login">
      <div className="background-shape">
        <img src={orangeWave} alt="Background Shape" />
      </div>

      <div className="login-form-container">
        <h1 className="text-center text-light fw-bold display-3 mb-4">
          Login to Your Account
        </h1>

        <form onSubmit={handleLogin} className="px-5" noValidate>
          {error && (
            <div
              className="alert alert-danger"
              role="alert"
              aria-live="assertive"
            >
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          <div className="form-group my-4 shadow">
            <input
              className="form-control py-2"
              type="text"
              placeholder="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loginMutation.isLoading}
              aria-label="Username"
              aria-describedby="usernameHelp"
            />
          </div>

          <div className="form-group my-4">
            <div className="input-group shadow">
              <input
                className="form-control py-2"
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loginMutation.isLoading}
                aria-label="Password"
                aria-describedby="passwordHelp"
              />
              <button
                type="button"
                className="input-group-text"
                style={{ cursor: "pointer" }}
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                disabled={loginMutation.isLoading}
              >
                {passwordVisible ? (
                  <i className="bi bi-eye-slash"></i>
                ) : (
                  <i className="bi bi-eye"></i>
                )}
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loginMutation.isLoading}
              />
              <label
                className="form-check-label text-light"
                htmlFor="rememberMe"
              >
                Remember me
              </label>
            </div>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
              className="text-decoration-none link-light"
              aria-label="Forgot Password"
            >
              Forgot Password?
            </a>
          </div>

          <button
            className="btn btn-primary shadow w-100 py-2 mb-3"
            type="submit"
            disabled={loginMutation.isLoading}
            aria-label="Login"
          >
            {loginMutation.isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <p className="fw-bold my-4 text-center text-light">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="link-danger"
              aria-disabled={loginMutation.isLoading}
            >
              Register here
            </Link>
          </p>
        </form>

        <p className="fw-bold text-center mt-4">
          <Link to="/" className="link-light">
            <button
              className="btn btn-light text-danger fw-bold px-4 py-2"
              disabled={loginMutation.isLoading}
            >
              <i className="bi bi-house-door me-2"></i>
              Go to Home
            </button>
          </Link>
        </p>
      </div>

      <div className="login-card d-flex flex-column justify-content-center align-items-center">
        <h1 className="text-light text-center display-2 fw-bold my-5">
          Welcome to
        </h1>

        <Link to="/">
          <div className="image my-5 py-5">
            <img src={logo} alt="Weld Quiz Logo" width="180" height="180" />
          </div>
        </Link>

        <h1 className="text-light fw-bold my-5 text-center mt-5 pt-5">
          Weld Quiz
        </h1>

        <p className="my-5 fs-5 text-center text-light px-5">
          Master your knowledge with our interactive quiz platform. Perfect for
          students and educators alike, Weld Quiz offers a seamless learning
          experience with real-time feedback and progress tracking.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
