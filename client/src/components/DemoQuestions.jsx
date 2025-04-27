import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../auth/auth";
import { Modal } from "react-bootstrap";
import "../style/DemoQuestions.css";
import { useMemo } from "react";

const DemoQuestions = () => {
  const token = getToken();
  const API_URL = import.meta.env.VITE_API_URL;

  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [unanswered, setUnanswered] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/questions/getquestions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    staleTime: 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!token,
  });

  // Flatten the questions from all categories and lessons
  const allQuestions = categories?.flatMap(
    (category) =>
      category.lessons.flatMap((lesson) =>
        lesson.questions.map((question) => ({
          ...question,
          category: category.category,
          lesson: lesson.lesson,
        }))
      ) || []
  );

  // Select 10 random questions
  const questions = useMemo(() => {
    const questionList = allQuestions || [];
    return questionList.slice(0, 10);
  }, [allQuestions]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && quizStarted) {
      handleSubmit();
    }
  }, [quizStarted, timeLeft]);

  const handleSelectAnswer = (questionId, selectedOption) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
  };

  const handleSubmit = () => {
    const unansweredQuestions = questions.filter(
      (q) => !answers.hasOwnProperty(q.id)
    );
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      setUnanswered(unansweredQuestions.map((q) => q.id));
      alert("Please answer all questions before submitting.");
      return;
    }
    let correctCount = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
    setShowModal(true);
    setUnanswered([]);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleClear = () => {
    setScore(0);
    setAnswers({});
    setSubmitted(false);
    setShowModal(false);
    setUnanswered([]);
    setTimeLeft(300);
    setQuizStarted(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="container demo-questions">
          {isLoading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center">
              Error: {error.message}
            </div>
          ) : (
            <div className="card shadow-sm border-0 rounded">
              <div className="p-3 text-center quiz-guidelines">
                <h1>Quiz Guidelines</h1>
                <h4>Description</h4>
                <ul className="p-0">
                  <li>
                    This quiz contains multiple-choice questions from different
                    categories related to welding and quality control.
                  </li>
                  <li>
                    Each question has four answer options, and you must select
                    the correct one.
                  </li>
                  <li>Some questions may include images.</li>
                </ul>

                <h4 className="mb-3">Rules & Regulations and Scoring</h4>
                <ul className="d-md-flex justify-content-center gap-3 aligin-items-center p-0">
                  <div>
                    <li>
                      <strong>Answer Selection:</strong> Click on an option to
                      choose your answer.
                    </li>
                    <li>
                      <strong>Submission:</strong> Submit your quiz after
                      answering all questions.
                    </li>
                  </div>
                  <div>
                    <strong></strong>
                    <ul className="text-center p-0">
                      <li>
                        Correct answers will be highlighted in
                        <span className="bg-success px-3 ms-2"></span>
                      </li>
                      <li>
                        Wrong answers will be highlighted in
                        <span className="bg-danger px-3 ms-2"></span>
                      </li>
                    </ul>
                  </div>
                </ul>
                <p>
                  <strong>Ready? Start your quiz now!</strong>
                </p>
              </div>
              {!quizStarted ? (
                <div className="text-center p-4">
                  <button
                    className="btn btn-primary py-1 px3"
                    onClick={handleStartQuiz}
                  >
                    Start Quiz
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="px-5 d-flex justify-content-between align-items-center sticky-top"
                    style={{
                      backgroundColor: "orangered",
                      top: "-20px",
                      zIndex: "1",
                    }}
                  >
                    <h4 className="py-3 text-light">
                      Answer the following questions:
                    </h4>
                    <h3 className="py-3 text-light">
                      Timer:{" "}
                      <span className="bg-light text-danger p-1 px-2 rounded">
                        {formatTime(timeLeft)}
                      </span>
                    </h3>
                  </div>
                  <form className="px-5 py-5">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="d-flex justify-content-between align-items-center border-bottom single-question"
                      >
                        <div
                          className={`my-4 p-4 w-100 ${
                            unanswered.includes(question.id)
                              ? "border border-danger"
                              : ""
                          }`}
                        >
                          <h5>
                            {index + 1}. {question.question}
                          </h5>
                          <div className="px-5">
                            {[
                              question.option1,
                              question.option2,
                              question.option3,
                              question.option4,
                            ].map((option, idx) => {
                              const optionId = `question-${question.id}-option-${idx}`;
                              let optionClass = "";
                              if (submitted) {
                                if (answers[question.id] === option) {
                                  optionClass =
                                    option === question.answer
                                      ? "bg-success text-white"
                                      : "bg-danger text-white";
                                } else if (option === question.answer) {
                                  optionClass = "bg-success text-white";
                                }
                              }
                              return (
                                <div
                                  key={idx}
                                  className={`form-check ${optionClass} p-2 rounded`}
                                >
                                  <input
                                    type="radio"
                                    id={optionId}
                                    name={`question-${question.id}`}
                                    value={option}
                                    className="form-check-input"
                                    checked={answers[question.id] === option}
                                    onChange={() =>
                                      handleSelectAnswer(question.id, option)
                                    }
                                    disabled={submitted}
                                  />
                                  <label
                                    htmlFor={optionId}
                                    className="form-check-label"
                                  >
                                    {option}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          {question.imageUrl ? (
                            <img
                              className="me-3"
                              src={question.imageUrl}
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
                    ))}
                    {!submitted && (
                      <button
                        type="button"
                        className="btn btn-sm py-1 px-2 mt-3"
                        onClick={handleSubmit}
                      >
                        Submit Quiz
                      </button>
                    )}
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Quiz Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            Your Score: {score} / {questions.length}
          </h4>
          <p>
            {score >= 5
              ? "Great job! Keep practicing."
              : "Keep trying! Practice makes perfect."}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary py-0 px-2" onClick={handleClear}>
            Try Again
          </button>
          <button
            className="btn btn-secondary py-0 px-2"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DemoQuestions;
