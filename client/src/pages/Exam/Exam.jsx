import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { examsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";
import { usePreventCapture } from "../../hooks/usePreventCapture";

const Exam = () => {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = unitId === "demo";

  // Enable screen capture protection
  usePreventCapture();

  const [examData, setExamData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const startExamMutation = useMutation({
    mutationFn: () =>
      examsAPI.startExam(courseId, isDemo ? courseId : unitId, isDemo),
    onSuccess: (data) => {
      setExamData(data.data);
      setAnswers(
        data.data.questions.map((q) => ({
          questionId: q._id,
          selectedAnswer: null,
          timeSpent: 0,
        }))
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to start exam");
      navigate(-1);
    },
  });

  const submitExamMutation = useMutation({
    mutationFn: (examResults) =>
      examsAPI.submitExam(courseId, isDemo ? courseId : unitId, examResults),
    onSuccess: (data) => {
      if (isDemo) {
        navigate("/courses");
        toast.success("Demo exam completed!");
      } else {
        navigate(`/exam-result/${data.data.examResultId}`);
        toast.success("Exam submitted successfully!");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit exam");
    },
  });

  useEffect(() => {
    startExamMutation.mutate();
  }, []);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Track time per question
  useEffect(() => {
    const now = Date.now();
    const timeSpentOnPrevQuestion = now - questionStartTime;

    if (currentQuestion > 0) {
      setAnswers((prev) =>
        prev.map((answer, index) =>
          index === currentQuestion - 1
            ? {
                ...answer,
                timeSpent: Math.floor(timeSpentOnPrevQuestion / 1000),
              }
            : answer
        )
      );
    }

    setQuestionStartTime(now);
  }, [currentQuestion]);

  const handleAnswerSelect = (answer) => {
    setAnswers((prev) =>
      prev.map((ans, index) =>
        index === currentQuestion ? { ...ans, selectedAnswer: answer } : ans
      )
    );
  };

  const handleNext = () => {
    if (currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const finalAnswers = answers.map((answer, index) => ({
      ...answer,
      timeSpent:
        index === currentQuestion
          ? Math.floor((Date.now() - questionStartTime) / 1000)
          : answer.timeSpent,
    }));

    submitExamMutation.mutate({
      answers: finalAnswers,
      timeSpent,
      isDemo,
    });
  };

  if (startExamMutation.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading exam...</span>
      </div>
    );
  }

  if (!examData) return null;

  const question = examData.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion]?.selectedAnswer;
  const progress = ((currentQuestion + 1) / examData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 exam-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isDemo ? "Demo Exam" : "Unit Exam"}
              </h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {examData.questions.length}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-600">Time Spent</div>
                <div className="font-mono font-bold text-gray-900">
                  {Math.floor(timeSpent / 60)}:
                  {(timeSpent % 60).toString().padStart(2, "0")}
                </div>
              </div>

              {!isDemo && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Time Limit</div>
                  <div className="font-mono font-bold text-gray-900">
                    {Math.floor(examData.timeLimit / 60)}:
                    {(examData.timeLimit % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8">
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  question.difficulty === "easy"
                    ? "bg-success-100 text-success-800"
                    : question.difficulty === "medium"
                    ? "bg-warning-100 text-warning-800"
                    : "bg-error-100 text-error-800"
                }`}
              >
                {question.difficulty}
              </span>
              <span className="text-sm text-gray-500">
                {question.marks} mark{question.marks !== 1 ? "s" : ""}
              </span>
            </div>

            {question.timeLimit && (
              <div className="text-sm text-gray-500">
                Time limit: {question.timeLimit}s
              </div>
            )}
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {question.question}
            </h2>

            {question.image && (
              <div className="mb-6">
                <img
                  src={question.image}
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options?.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  currentAnswer === index
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      currentAnswer === index
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300"
                    }`}
                  >
                    {currentAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {currentQuestion + 1} of {examData.questions.length}
              </span>

              <button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === examData.questions.length - 1
                  ? "Submit"
                  : "Next"}
              </button>
            </div>
          </div>
        </div>

        {/* Warning for demo */}
        {isDemo && (
          <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-warning-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-warning-800">
                  Demo Mode
                </h3>
                <p className="text-sm text-warning-700 mt-1">
                  This is a demo exam. Your results will not be saved.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exam;
