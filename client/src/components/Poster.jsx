import React from "react";
import "../style/Poster.css";
import { useNavigate } from "react-router-dom";
import { getRole, getToken } from "../auth/auth";

const Poster = () => {
  const token = getToken();
  const userRole = getRole();
  const navigate = useNavigate();
  const handlePostQuiz = () => {
    if (!token) {
      navigate("/register");
    }
    if (userRole === "admin") {
      navigate("/");
    } else {
      navigate("/student/dashboard");
    }
  };
  return (
    <div className="poster d-md-flex justify-content-around align-items-center">
      <div className="w-25">
        <h1>Ready to grow your business digitally?</h1>
      </div>
      <div>
        <button
          className="btn btn-default rounded rounded-5 px-4 py-2"
          onClick={handlePostQuiz}
        >
          Let's start the quiz
        </button>
      </div>
    </div>
  );
};

export default Poster;
