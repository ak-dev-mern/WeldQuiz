import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { getToken } from "../../auth/auth";
import Footer from "../../components/Footer";
import Poster from "../../components/Poster";

const API_URL = import.meta.env.VITE_API_URL;
const token = getToken("token");

const PaidQuizDetails = () => {
  const { category, lesson } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [unanswered, setUnanswered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const {
    data: questionsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["paid-quiz-questions", category, lesson],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/questions/getquestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Find the matching category and lesson
      const categoryData = res.data.find(
        (group) => group.category === category
      );

      if (!categoryData) return [];

      const lessonData = categoryData.lessons.find((l) => l.lesson === lesson);

      return lessonData ? lessonData.questions : [];
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (!questionsData || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questionsData, submitted]);

  const handleSelectAnswer = (questionId, selectedOption) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
  };

  const handleSubmit = () => {
    if (!questionsData) return;

    const unansweredQuestions = questionsData.filter(
      (q) => !answers.hasOwnProperty(q.id)
    );
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      setUnanswered(unansweredQuestions.map((q) => q.id));
      alert("Please answer all questions before submitting.");
      return;
    }

    let correctCount = 0;
    questionsData.forEach((q) => {
      if (answers[q.id] === q.answer) correctCount++;
    });

    setScore(correctCount);
    setSubmitted(true);
    setShowModal(true);
    setUnanswered([]);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setShowModal(false);
    setScore(0);
    setTimeLeft(300);
    setUnanswered([]);
    setCurrentPage(1);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const totalPages = Math.ceil((questionsData?.length || 0) / questionsPerPage);
  const paginatedQuestions = questionsData?.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  if (isLoading)
    return <div className="text-center my-4">Loading questions...</div>;
  if (isError)
    return (
      <div className="text-danger text-center">Error loading questions.</div>
    );

  if (!questionsData || questionsData.length === 0) {
    return (
      <div className="text-center my-4">
        <p>No questions found for this lesson.</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Header title={`${category} - ${lesson}`} />
      <div className="container my-5" style={{ width: "1200px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-2 px-4 rounded rounded-2">
          <h3 className="mt-1" style={{ color: "orangered" }}>
            {lesson} Quiz
          </h3>
          {!submitted && (
            <div
              className="badge fs-6"
              style={{ backgroundColor: "orangered" }}
            >
              ⏳ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <form>
          {paginatedQuestions.map((q, index) => (
            <div
              key={q.id}
              className={`mb-4 p-3 rounded shadow-sm ${
                unanswered.includes(q.id) ? "border border-danger" : ""
              }`}
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <h5 className="text-danger">
                {index + 1 + (currentPage - 1) * questionsPerPage}. {q.question}
              </h5>
              <div className="d-flex justify-content-between align-items-center">
                <div className="ps-4 pt-2">
                  {[q.option1, q.option2, q.option3, q.option4].map(
                    (option, idx) => {
                      const optionId = `question-${q.id}-option-${idx}`;
                      let optionClass = "";

                      if (submitted) {
                        if (option === q.answer) {
                          optionClass = "bg-success text-white";
                        } else if (
                          answers[q.id] === option &&
                          option !== q.answer
                        ) {
                          optionClass = "bg-danger text-white";
                        }
                      }

                      return (
                        <div
                          key={optionId}
                          className={`form-check mb-2 p-2 rounded ${optionClass}`}
                        >
                          <input
                            type="radio"
                            id={optionId}
                            name={`question-${q.id}`}
                            value={option}
                            className="form-check-input shadow"
                            checked={answers[q.id] === option}
                            onChange={() => handleSelectAnswer(q.id, option)}
                            disabled={submitted}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={optionId}
                          >
                            {option}
                          </label>
                        </div>
                      );
                    }
                  )}
                </div>
                <div>
                  {q.imageUrl ? (
                    <img
                      className="me-3"
                      src={q.imageUrl}
                      alt="Question"
                      style={{
                        width: "300px",
                        height: "250px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          ))}
        </form>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-4">
            <button
              className="btn btn-light border d-flex align-items-center"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              ⬅️ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn ${
                  currentPage === i + 1 ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-light border d-flex align-items-center"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next ➡️
            </button>
          </div>
        )}

        {/* Submit button */}
        {!submitted && (
          <div className="text-center d-flex justify-content-center align-items-center gap-3">
            <button
              className="btn btn-default mt-3 border-0"
              onClick={() => navigate(-1)}
            >
              Back to Lessons
            </button>
            <button className="btn btn-success mt-3" onClick={handleSubmit}>
              Submit Quiz
            </button>
          </div>
        )}

        {/* Modal-style results */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-success shadow">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Quiz Result</h5>
                </div>
                <div className="modal-body text-center">
                  <h4>
                    ✅ You scored <strong>{score}</strong> out of{" "}
                    <strong>{questionsData.length}</strong>
                  </h4>
                  <p>
                    {score >= questionsData.length / 2
                      ? "Great job! You did well."
                      : "Keep practicing to improve!"}
                  </p>
                </div>
                <div className="modal-footer justify-content-center">
                  <button className="btn btn-primary" onClick={handleReset}>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Poster />
      <Footer />
    </>
  );
};

export default PaidQuizDetails;
