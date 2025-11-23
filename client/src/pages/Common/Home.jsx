import React from "react";
import { Link } from "react-router-dom";
import {
  PlayCircle,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Shield,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react";
import HomeHeader from "../../components/Layout/HomeHeader";

const Home = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Interactive Courses",
      description:
        "Engage with hands-on learning materials and practical exercises",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "AI-Powered Analytics",
      description: "Get personalized insights and progress tracking",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Skill Certification",
      description: "Earn recognized certificates upon course completion",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Learning",
      description: "Collaborate and learn with peers in discussion forums",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Learners" },
    { number: "500+", label: "Courses Available" },
    { number: "98%", label: "Success Rate" },
    { number: "24/7", label: "Support Available" },
  ];

  const courses = [
    {
      title: "AI Fundamentals",
      description:
        "Master the basics of artificial intelligence and machine learning",
      duration: "8 weeks",
      level: "Beginner",
      students: "2.5k",
      rating: 4.8,
    },
    {
      title: "Advanced Welding Techniques",
      description: "Learn professional welding methods and safety protocols",
      duration: "12 weeks",
      level: "Advanced",
      students: "1.8k",
      rating: 4.9,
    },
    {
      title: "Data Science Bootcamp",
      description: "Comprehensive data analysis and visualization course",
      duration: "10 weeks",
      level: "Intermediate",
      students: "3.2k",
      rating: 4.7,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Master Skills with
              <span className="text-blue-600 dark:text-blue-400">
                {" "}
                AI-Powered
              </span>
              <br />
              Learning
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your career with interactive courses, personalized
              learning paths, and industry-recognized certifications. Join
              thousands of learners worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Learning Free
              </Link>
              <Link
                to="/courses"
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center gap-2"
              >
                <PlayCircle className="h-5 w-5" />
                View Courses
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose LearnAI?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the future of education with our cutting-edge platform
              designed for effective learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-dark-700 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Courses
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore our most enrolled courses and start your learning journey
              today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {course.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      {course.students} students
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {course.rating} rating
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                    <Link
                      to="/courses"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/courses"
              className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have transformed their careers with
            our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="border border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-8">
              Trusted by learners from top companies
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
              {["Google", "Microsoft", "Amazon", "Tesla", "IBM", "Netflix"].map(
                (company) => (
                  <div
                    key={company}
                    className="text-gray-400 font-semibold text-lg"
                  >
                    {company}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
