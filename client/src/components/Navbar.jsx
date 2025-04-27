import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutStudent } from "../features/studentSlice";
import logo from "../assets/images/book-logo.png";
import "../style/Navbar.css";
import { getUsernameInitials, textLengthLimit } from "../utils/utils";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username, role, token } = useSelector((state) => state.student);
  const isAuthenticated = !!token;
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  // NEW states for mobile and offcanvas
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleLogout = () => {
    dispatch(logoutStudent());
    navigate("/");
  };

  const commonNavItems = (
    <>
      <li className="nav-item">
        <Link className="nav-link link-light" to="/">
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link link-light" to="/about">
          About Us
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link link-light" to="/contact">
          Contact Us
        </Link>
      </li>
      <li className="nav-item dropdown me-2">
        <a
          className="nav-link link-light dropdown-toggle"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
        >
          Legal
        </a>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to="/legal/terms&conditions">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/legal/privacypolicy">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </li>
      <li className="nav-item dropdown me-2">
        <a
          className="nav-link link-light dropdown-toggle"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
        >
          Others
        </a>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to="/others/pricedetails">
              Price Details
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/others/feedback">
              Feedback
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/others/discussion">
              Discussion
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/others/faq">
              Help & FAQs
            </Link>
          </li>
        </ul>
      </li>
    </>
  );

  const profileDropdown = isAuthenticated && (
    <li className="nav-item dropdown">
      <a
        className="nav-link link-light dropdown-toggle d-flex align-items-center"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
      >
        <div className="profile-initials rounded-circle d-flex align-items-center justify-content-center">
          {getUsernameInitials(username)}
        </div>
        <span className="ms-2">{textLengthLimit(username, 10)}</span>
      </a>
      <ul className="dropdown-menu profile-menu">
        <li>
          <Link
            className="dropdown-item"
            to={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            className="dropdown-item"
            to={role === "student" ? "/student/profile" : "/"}
          >
            My Profile
          </Link>
        </li>
        <li>
          <button className="dropdown-item" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </li>
  );

  const authButtons = !isAuthenticated && (
    <>
      <li className="nav-item px-1">
        <button
          className="btn btn-outline-light px-4 py-1"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </li>
      <li className="nav-item px-1">
        <button
          className="btn btn-outline-light px-4 py-1"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </li>
    </>
  );

  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY >= 30);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg sticky-top ${
        navbarScrolled
          ? "navbar-dark border-bottom border-light"
          : "navbar-dark text-light bg-transparent"
      }`}
    >
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <img
            className="img-fluid rounded-circle logo"
            src={logo}
            alt="logo"
          />
          <Link className="navbar-brand" to="/">
            <h1 className="mt-2">Weld Quiz</h1>
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => {
            if (isMobile) {
              setShowOffcanvas(true);
            }
          }}
          data-bs-toggle={isMobile ? "" : "collapse"}
          data-bs-target={isMobile ? "" : "#navbarNav"}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isMobile ? "d-none" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            {commonNavItems}
            {profileDropdown}
            {authButtons}
          </ul>
        </div>

        {/* Offcanvas for mobile */}
        {isMobile && (
          <div
            className={`offcanvas offcanvas-start ${
              showOffcanvas ? "show" : ""
            }`}
            tabIndex="-1"
            style={{
              visibility: showOffcanvas ? "visible" : "hidden",
              backgroundColor: "#343a40",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title text-white">Weld Quiz</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowOffcanvas(false)}
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav d-flex align-items-start">
                {commonNavItems}
                {profileDropdown}
                {authButtons}
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
