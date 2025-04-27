import React from "react";
import "../../style/App.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <Header title={"Terms and Conditions"} />
      <div className="px-2">
        <div className="container my-5 w-100 py-5 w-75 text-light border border-5 border-light p-md-5 shadow-lg rounded rounded-5">
          <h1>Terms and Conditions</h1>
          <p>
            <strong>Effective Date:</strong> 01-May-2025
          </p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to [Your Website Name], a platform dedicated to welding and
            quality control (QC) questions and answers. By using our website,
            you agree to comply with these Terms and Conditions.
          </p>

          <h2>2. Use of the Website</h2>
          <ul>
            <li>
              This website is intended for educational and practice purposes
              only.
            </li>
            <li>
              Users must not post misleading, offensive, or harmful content.
            </li>
            <li>
              Unauthorized attempts to access restricted sections of the website
              are strictly prohibited.
            </li>
          </ul>

          <h2>3. User Accounts</h2>
          <ul>
            <li>
              Users may need to register an account to access certain features.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              login credentials.
            </li>
            <li>
              We reserve the right to suspend or terminate accounts that violate
              these terms.
            </li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All content, including text, images, and videos, is either owned by
            [Your Website Name] or used with permission. Unauthorized copying or
            distribution is strictly prohibited.
          </p>

          <h2>5. Disclaimer</h2>
          <p>
            The website provides educational content but does not guarantee
            certification or job placement. We are not responsible for any
            inaccuracies in user-generated content.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            We are not liable for any direct, indirect, or incidental damages
            resulting from the use of our website.
          </p>

          <h2>7. Changes to These Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the website
            after changes are posted constitutes acceptance of the new terms.
          </p>

          <p>
            For any questions, please contact us at{" "}
            <a
              className="link-danger text-decoration-none"
              href="mailto:welquiz@gmail.com"
            >
              weldquiz@gmail.com
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
