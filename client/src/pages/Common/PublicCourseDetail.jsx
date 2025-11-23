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
} from "lucide-react";
import { coursesAPI } from "../../services/api";

const PublicCourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await coursesAPI.getCourse(id);

        // Fix: Use course (singular) instead of courses (plural)
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
    </div>
  );
};

export default PublicCourseDetail;
