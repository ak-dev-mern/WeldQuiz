// pages/DemoQuestions/DemoQuestions.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  CheckCircle,
  XCircle,
  Play,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { coursesAPI } from "../../services/api";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const DemoQuestions = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [answers, setAnswers] = useState([]);

  // Fetch demo questions
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuery({
    queryKey: ["demoQuestions", courseId],
    queryFn: () => coursesAPI.getDemoQuestions(courseId),
    enabled: !!courseId,
  });

  const questions = questionsData?.data?.questions || [];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleFinishDemo();
    }
  }, [timeLeft, questions.length]);

  const handleOptionSelect = (optionIndex) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) {
      toast.error("Please select an answer");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    }

    // Record the answer
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion._id,
        question: currentQuestion.question,
        selectedOption,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        options: currentQuestion.options,
      },
    ]);

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      handleFinishDemo();
    }
  };

  const handleFinishDemo = () => {
    const percentage = Math.round((score / questions.length) * 100);

    toast.success(
      `Demo completed! Score: ${score}/${questions.length} (${percentage}%)`
    );

    // Navigate back to course detail or show results
    navigate(`/dashboard/courses/${courseId}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Loading state
  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading demo questions...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (questionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load demo questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {questionsError.response?.data?.message || "An error occurred"}
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0 && !questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Demo Questions Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There are no demo questions available for this course yet.
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Course
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white dark:bg-dark-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="font-mono text-sm font-medium">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="bg-white dark:bg-dark-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700">
              <span className="text-sm font-medium">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0">
              <HelpCircle className="h-6 w-6 text-primary-600 mt-1" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Question {currentQuestionIndex + 1}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === index
                    ? showResult
                      ? index === currentQuestion.correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedOption === index
                        ? showResult
                          ? index === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-500"
                            : "border-red-500 bg-red-500"
                          : "border-primary-500 bg-primary-500"
                        : "border-gray-300 dark:border-dark-500"
                    }`}
                  >
                    {showResult && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                    {showResult &&
                      selectedOption === index &&
                      index !== currentQuestion.correctAnswer && (
                        <XCircle className="h-4 w-4 text-white" />
                      )}
                  </div>
                  <span
                    className={`text-gray-700 dark:text-gray-300 ${
                      selectedOption === index ? "font-medium" : ""
                    }`}
                  >
                    {option}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Explanation (when showing result) */}
          {showResult && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Explanation:
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="btn btn-primary"
            >
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNextQuestion} className="btn btn-primary">
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <Play className="h-4 w-4 ml-2" />
                </>
              ) : (
                "Finish Demo"
              )}
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {score}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {currentQuestionIndex + 1}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Answered
            </div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {Math.round((score / (currentQuestionIndex + 1)) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Accuracy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoQuestions;
