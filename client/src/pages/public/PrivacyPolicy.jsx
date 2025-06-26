import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <Header title={"Privacy Policy"} />
      <div className="px-2">
        <div className="container my-5 py-5 w-100 w-md-75 text-light border border-5 border-light p-md-5 shadow-lg rounded rounded-5">
          <h1>Privacy Policy</h1>
          <p>
            <strong>Effective Date:</strong> 01-May-2025
          </p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to [Your Website Name]! This Privacy Policy explains how we
            collect, use, and protect your personal information when you visit
            our website, register for training programs, or take part in online
            exams.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>
              Personal Information: Name, email address, phone number, location,
              and educational background when you register or contact us.
            </li>
            <li>Account Information: Login credentials and preferences.</li>
            <li>
              Usage Data: Pages visited, time spent, exam activity, and
              technical data (IP address, browser type, etc.).
            </li>
            <li>
              Payment Information: When you enroll in paid courses, payment is
              processed securely through trusted third-party services.
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information to:</p>
          <ul>
            <li>Create and manage your user account.</li>
            <li>Deliver training materials and conduct online exams.</li>
            <li>Communicate important updates or promotions.</li>
            <li>Improve our services and user experience.</li>
            <li>Comply with legal or regulatory requirements.</li>
          </ul>

          <h2>4. Data Protection</h2>
          <p>
            We implement industry-standard security measures to protect your
            personal data from unauthorized access, misuse, or disclosure.
          </p>

          <h2>5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies to improve site functionality and user experience.
            You can control or disable cookies through your browser settings.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>
            We may use third-party tools (e.g., payment gateways, analytics
            services) that collect limited data to help us operate our platform
            effectively. These providers are obligated to maintain the
            confidentiality and security of your information.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            You may access, update, or delete your personal data at any time by
            contacting us. If you wish to unsubscribe from promotional emails,
            you may do so using the link provided in the email.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We reserve the right to update this Privacy Policy from time to
            time. Any changes will be posted on this page with an updated
            effective date.
          </p>
          <h2>Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at:{" "}
          </p>
          <ul style={{ listStyleType: "none" }}>
            <li>
              <a
                className=" text-decoration-none text-light"
                href="mailto:welquiz@gmail.com"
              >
                <i className="bi bi-envelope"></i> Email : welquiz@gmail.com
              </a>
            </li>
            <li>
              <a
                className=" text-decoration-none text-light"
                href="tel:123456789"
              >
                <i className="bi bi-telephone"></i> Phone : 123456789
              </a>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
