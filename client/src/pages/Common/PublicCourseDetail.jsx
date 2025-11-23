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

const PublicCourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const coursesData = {
          1: {
            id: 1,
            title: "AI Fundamentals",
            description:
              "Master the basics of artificial intelligence and machine learning with this comprehensive course designed for beginners.",
            longDescription:
              "This course provides a solid foundation in artificial intelligence and machine learning concepts. You'll learn about neural networks, deep learning, natural language processing, and computer vision through hands-on projects and real-world examples.",
            duration: "8 weeks",
            level: "Beginner",
            students: "2.5k",
            rating: 4.8,
            image:
              "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop",
            price: 99,
            category: "AI & Machine Learning",
            instructor: {
              name: "Dr. Sarah Chen",
              bio: "AI Researcher with 10+ years of experience at Google and MIT",
              image:
                "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            },
            modules: [
              "Introduction to AI and Machine Learning",
              "Neural Networks Fundamentals",
              "Deep Learning Concepts",
              "Natural Language Processing",
              "Computer Vision Basics",
              "AI Ethics and Future Trends",
            ],
            requirements: [
              "Basic programming knowledge",
              "High school mathematics",
              "No prior AI experience required",
            ],
          },
        };
        setCourse(coursesData[id] || coursesData[1]);
        setLoading(false);
      }, 1000);
    };

    fetchCourse();
  }, [id]);

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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course not found
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
                src={course.image}
                alt={course.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {course.longDescription}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Duration
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.duration}
                    </div>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Students
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.students}
                    </div>
                  </div>
                  <div className="text-center">
                    <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Rating
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.rating}/5
                    </div>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Level
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {course.level}
                    </div>
                  </div>
                </div>

                {/* Course Modules */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    What You'll Learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.modules.map((module, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {module}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Requirements
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                    {course.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${course.price}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  One-time payment
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
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Instructor
              </h3>
              <div className="flex items-center gap-4">
                <img
                  src={course.instructor.image}
                  alt={course.instructor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {course.instructor.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {course.instructor.bio}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCourseDetail;
