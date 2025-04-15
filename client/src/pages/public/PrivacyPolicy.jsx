import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <Header title={"Privacy Policy"} />
      <div className="container my-5 py-5 w-75 text-light border border-5 border-light p-5 shadow-lg rounded rounded-5">
        <h1>Privacy Policy</h1>
        <p>
          <strong>Effective Date:</strong> 01-May-2025
        </p>

        <h2>1. Introduction</h2>
        <p>
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your information when you use [Your Website
          Name].
        </p>

        <h2>2. Information We Collect</h2>
        <ul>
          <li>
            Personal details (such as name, email, and login credentials).
          </li>
          <li>
            Activity data (such as quiz attempts, browsing behavior, and
            interactions on the platform).
          </li>
          <li>
            Technical data (such as IP address, browser type, and device
            information).
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide and improve our question-and-answer platform.</li>
          <li>
            To personalize user experience and enhance website functionality.
          </li>
          <li>To communicate with users about updates or inquiries.</li>
          <li>To analyze website performance and user behavior.</li>
        </ul>

        <h2>4. Data Protection</h2>
        <p>
          We implement security measures to protect your data from unauthorized
          access, but no online platform is 100% secure.
        </p>

        <h2>5. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies to improve user experience. Users can control cookie
          settings in their browser.
        </p>

        <h2>6. Third-Party Services</h2>
        <p>
          We do not sell or share personal information with third parties,
          except as required by law or for essential service providers.
        </p>

        <h2>7. User Rights</h2>
        <p>
          Users may request access, correction, or deletion of their personal
          data by contacting us.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted on
          this page.
        </p>

        <p>
          For any concerns or questions, contact us at{" "}
          <a
            className="link-danger text-decoration-none"
            href="mailto:welquiz@gmail.com"
          >
            weldquiz@gmail.com
          </a>
        </p>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
