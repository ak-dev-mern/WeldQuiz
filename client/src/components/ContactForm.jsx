import React, { useState } from "react";
import profile from "../assets/images/man-head.png";
import "../style/ContactForm.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form data first
    const isValidEmail = /\S+@\S+\.\S+/.test(formData.email);

    if (!formData.name.trim() || !isValidEmail || !formData.message.trim()) {
      alert("Please enter valid details!");
      return;
    }

    // Submit the form data
    setIsSubmitting(true);

    try {
      // Send form data to the backend via POST request
      await axios.post(`${API_URL}/api/contact`, formData, {
        headers: {
          "Content-Type": "application/json", // Ensure that this is set
        },
      });

      // Show success message and reset form data
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Error sending form data:", err);
      alert("There was an issue sending your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form">
      <div className="row my-5 py-5">
        <div className="col-md-6 my-4 px-5 text-light">
          <div>
            <h1 className="my-3 display-4 fw-bold">
              Fill out this form, we’ll get back to you
            </h1>
            <p className="mb-5 fs-5">
              We are here to help! Tell us how we can assist, and we’ll reach
              out within 24 hours.
            </p>
          </div>
          <hr />
          <div className="my-5">
            <i className="bi bi-star-fill text-warning fs-5"></i>
            <i className="bi bi-star-fill text-warning fs-5 ps-1"></i>
            <i className="bi bi-star-fill text-warning fs-5 ps-1"></i>
            <i className="bi bi-star-fill text-warning fs-5 ps-1"></i>
            <i className="bi bi-star-fill text-warning fs-5 ps-1"></i>
            <h6 className="my-3 fs-5 fst-italic">
              "At Weld Quiz, we believe that learning should be simple,
              engaging, and effective. Our platform is designed to help
              students, professionals, and lifelong learners master their
              knowledge through carefully curated quizzes and real-time
              practice."
            </h6>
            <h6 className="my-3 fs-5 fst-italic">
              Whether you're preparing for competitive exams, brushing up on
              skills, or simply exploring new topics, weld quiz provides the
              tools you need to test, track, and improve your performance —
              anytime, anywhere.
            </h6>
            <h6 className="my-3 fs-5 fst-italic">
              Join thousands of users who are transforming the way they learn.
              With weld quiz, every question brings you one step closer to
              mastery.
            </h6>
            <div className="d-flex align-items-center gap-2 my-3">
              <div className="profile-pic">
                <img src={profile} alt="profile" />
              </div>
              <div>
                <h6 className="m-0">John Doe</h6>
                <span>CEO & Co-founder @ Company</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="col-md-6 my-5 px-5 border border-2 rounded p-5 shadow contact-form-container h-100">
          {submitted && (
            <div
              className="alert alert-success success-message text-center rounded-3"
              role="alert"
              aria-live="polite"
            >
              Message sent successfully!
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                name="message"
                className="form-control"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
