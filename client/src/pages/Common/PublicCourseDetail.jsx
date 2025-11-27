import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  PlayCircle,
  ArrowLeft,
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { coursesAPI } from "../../services/api";

const PublicCourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoQuestions, setDemoQuestions] = useState([]);
  const [showDemoQuiz, setShowDemoQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await coursesAPI.getCourse(id);
        setCourse(response?.data?.course || response?.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchDemoQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await coursesAPI.getDemoQuestions(id);
      setDemoQuestions(response?.data?.questions || response?.data || []);
      setShowDemoQuiz(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizSubmitted(false);
    } catch (err) {
      console.error("Error fetching demo questions:", err);
      setError("Failed to load demo questions. Please try again later.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < demoQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const handleCloseQuiz = () => {
    setShowDemoQuiz(false);
    setDemoQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    demoQuestions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question._id || question.id];
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  // Helper function to get display price
  const getDisplayPrice = (price) => {
    if (typeof price === "number") {
      return price;
    }
    if (typeof price === "object" && price !== null) {
      return price.monthly || price.yearly || Object.values(price)[0] || 0;
    }
    return 0;
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
  };

  // Demo Quiz Modal Component
  const DemoQuizModal = () => {
    if (!showDemoQuiz || !demoQuestions.length) return null;

    const currentQuestion = demoQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === demoQuestions.length - 1;
    const selectedAnswer =
      selectedAnswers[currentQuestion._id || currentQuestion.id];

    if (quizSubmitted) {
      const score = calculateScore();
      const totalQuestions = demoQuestions.length;
      const percentage = Math.round((score / totalQuestions) * 100);

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Completed!
              </h2>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {score}/{totalQuestions}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {percentage >= 70 ? "Great job! 🎉" : "Keep practicing! 💪"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {percentage >= 80 &&
                  "Excellent! You have a good understanding of this topic."}
                {percentage >= 60 &&
                  percentage < 80 &&
                  "Good job! You're on the right track."}
                {percentage < 60 &&
                  "Don't worry! Review the material and try again."}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleCloseQuiz}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Demo Quiz
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {demoQuestions.length}
              </p>
            </div>
            <button
              onClick={handleCloseQuiz}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Question */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleAnswerSelect(
                      currentQuestion._id || currentQuestion.id,
                      index
                    )
                  }
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedAnswer === index
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                      : "border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        selectedAnswer === index
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-dark-700">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === undefined}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswer === undefined}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Course not found"}
          </h1>
          <Link
            to="/courses"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = getDisplayPrice(course.price);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden">
              <img
                src={
                  course.image ||
                  course.thumbnail ||
                  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop"
                }
                alt={course.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop";
                }}
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {course.category || "Uncategorized"}
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                    {course.level || "All Levels"}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {course.longDescription ||
                    course.description ||
                    "No description available."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Duration
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.duration || "Self-paced"}
                    </div>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Students
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.enrollmentCount ||
                        course.students ||
                        course.enrolledStudents ||
                        "0"}
                    </div>
                  </div>
                  <div className="text-center">
                    <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Rating
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.rating || course.averageRating || "No ratings"}
                    </div>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Level
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.level || "All Levels"}
                    </div>
                  </div>
                </div>

                {/* Demo Quiz Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Test Your Knowledge
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Take our free demo quiz to see what you'll learn in this
                        course. No registration required - just test your
                        current knowledge!
                      </p>
                      <button
                        onClick={fetchDemoQuestions}
                        disabled={loadingQuestions}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <HelpCircle className="h-5 w-5" />
                        {loadingQuestions
                          ? "Loading Questions..."
                          : "Start Demo Quiz"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course Modules/Curriculum */}
                {(course.modules || course.curriculum || course.syllabus) && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      What You'll Learn
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(
                        course.modules ||
                        course.curriculum ||
                        course.syllabus ||
                        []
                      ).map((module, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {typeof module === "string"
                              ? module
                              : module.title || module.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {(course.requirements || course.prerequisites) && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Requirements
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                      {(course.requirements || course.prerequisites || []).map(
                        (req, index) => (
                          <li key={index}>
                            {typeof req === "string" ? req : req.description}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${displayPrice}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {typeof course.price === "object"
                    ? "Subscription available"
                    : "One-time payment"}
                </div>
              </div>

              <Link
                to="/register"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <PlayCircle className="h-5 w-5" />
                Enroll Now
              </Link>

              <Link
                to="/pricing"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 py-3 px-6 rounded-lg font-semibold transition-colors text-center block"
              >
                View All Plans
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  This course includes:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Downloadable resources
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Mobile and TV access
                  </li>
                </ul>
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Instructor
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    src={getAvatarUrl(course.instructor?.profile?.avatar)}
                    alt={course.instructor.username}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
                    }}
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.instructor.username}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.instructor?.profile?.bio ||
                        course.instructor.title ||
                        "Course Instructor"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo Quiz Modal */}
      <DemoQuizModal />
    </div>
  );
};

export default PublicCourseDetail;
