import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Clock, Users, Star, BookOpen } from "lucide-react";
import { coursesAPI } from "../../services/api";

const PublicCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Fetch real course data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await coursesAPI.getCourses({
          // Add any parameters you need for filtering public courses
          isPublic: true,
          status: "published",
        });

        console.log(response?.data?.courses);

        setCourses(response?.data?.courses || response?.data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Helper function to get display price
  const getDisplayPrice = (price) => {
    if (typeof price === "number") {
      return price;
    }
    if (typeof price === "object" && price !== null) {
      // Handle object price (e.g., {monthly: 99, yearly: 999})
      return price.monthly || price.yearly || Object.values(price)[0] || 0;
    }
    return 0;
  };

  // Helper function to get unique key for courses
  const getCourseKey = (course, index) => {
    return course.id || course._id || `course-${index}`;
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={`skeleton-${i}`} // Fixed: unique key with prefix
                  className="bg-white dark:bg-dark-800 rounded-lg shadow p-6"
                >
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              {error}
            </h1>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Our Courses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover a wide range of courses designed to help you master new
            skills and advance your career.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search courses by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm
                ? "No courses found matching your search."
                : "No courses available at the moment."}
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Clear search
              </button>
            )}
            {!searchTerm && (
              <Link
                to="/contact"
                className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Contact us for more information
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600 dark:text-gray-400">
              <p>
                Showing {filteredCourses.length} of {courses.length} courses
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => {
                const displayPrice = getDisplayPrice(course.price);
                const courseKey = getCourseKey(course, index);

                return (
                  <div
                    key={courseKey} // Fixed: using helper function for unique key
                    className="bg-white dark:bg-dark-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={course.image || course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {course.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                          {course.level || "All Levels"}
                        </span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${displayPrice}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {course.description || "No description available."}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{course.duration || "Self-paced"} hrs</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {course.enrollmentCount ||
                              course.students ||
                              course.enrolledStudents ||
                              "0"}{" "}
                            students
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span>
                            {course.rating || course.averageRating
                              ? `${course.rating || course.averageRating}/5`
                              : "No ratings"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        {course.instructor && (
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrl(
                                course.instructor?.profile?.avatar
                              )}
                              alt={course.instructor?.username}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {course.instructor.username}
                            </span>
                          </div>
                        )}
                        <Link
                          to={`/courses/${course.id || course._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                          View Details
                          <span className="group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl p-8 text-white">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of students and unlock your potential with our
              comprehensive courses. Start your learning journey today and
              transform your career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                Sign Up Free
              </Link>
              <Link
                to="/pricing"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCourses;
