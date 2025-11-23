import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  BookOpen,
  BarChart3,
  Clock,
  Award,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import { coursesAPI, examsAPI } from "../../services/api";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["user-courses"],
    queryFn: () => coursesAPI.getCourses({ limit: 6, enrolled: true }),
    enabled: !!user,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["exam-analytics"],
    queryFn: () => examsAPI.getExamAnalytics(),
    enabled: !!user,
  });

  const { data: recentResults, isLoading: resultsLoading } = useQuery({
    queryKey: ["recent-results"],
    queryFn: () => examsAPI.getExamResults({ limit: 5 }),
    enabled: !!user,
  });

  if (coursesLoading || analyticsLoading || resultsLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      name: "Enrolled Courses",
      value: user?.coursesEnrolled?.length || 0,
      icon: BookOpen,
      color: "blue",
    },
    {
      name: "Exams Taken",
      value: analytics?.overall?.totalExams || 0,
      icon: FileText,
      color: "green",
    },
    {
      name: "Success Rate",
      value: `${analytics?.overall?.successRate?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: "purple",
    },
    {
      name: "Average Score",
      value: `${analytics?.overall?.averageScore?.toFixed(1) || 0}%`,
      icon: BarChart3,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.profile?.firstName || user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Continue your learning journey and track your progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Courses
            </h2>
            <Link
              to="courses"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {courses?.courses?.slice(0, 4).map((course) => (
              <div
                key={course._id}
                className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500">{course.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {course.progress || 0}%
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-primary-600 h-1 rounded-full"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}

            {(!courses?.courses || courses.courses.length === 0) && (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No courses
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by enrolling in your first course.
                </p>
                <div className="mt-6">
                  <Link to="/courses" className="btn btn-primary">
                    Browse Courses
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Exam Results */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Results
            </h2>
            <Link
              to="exam-result/:resultId"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {recentResults?.results?.map((result) => (
              <div
                key={result._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {result.course?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      result.passed ? "text-success-600" : "text-error-600"
                    }`}
                  >
                    {result.percentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.passed ? "Passed" : "Failed"}
                  </div>
                </div>
              </div>
            ))}

            {(!recentResults?.results ||
              recentResults.results.length === 0) && (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No results
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Take an exam to see your results here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/courses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-primary-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                Browse Courses
              </h3>
              <p className="text-sm text-gray-500">Explore new courses</p>
            </div>
          </Link>

          <Link
            to="/discussion"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Users className="h-6 w-6 text-primary-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Discussion</h3>
              <p className="text-sm text-gray-500">Join conversations</p>
            </div>
          </Link>

          <Link
            to="/activities"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Clock className="h-6 w-6 text-primary-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Activities</h3>
              <p className="text-sm text-gray-500">View your activity</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
