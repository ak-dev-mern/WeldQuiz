import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Star, Users, Clock, BookOpen } from "lucide-react";
import { coursesAPI } from "../../services/api";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const Courses = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    level: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", filters],
    queryFn: () => coursesAPI.getCourses(filters),
  });

  const categories = [
    "Programming",
    "Mathematics",
    "Science",
    "Business",
    "Arts",
    "Languages",
    "Technology",
    "Health",
  ];

  const levels = ["beginner", "intermediate", "advanced"];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
          <p className="text-gray-600 mt-1">
            Discover and enroll in courses that match your interests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => handleFilterChange("level", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="createdAt">Newest</option>
            <option value="averageRating">Highest Rated</option>
            <option value="totalStudents">Most Popular</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.courses?.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>

      {/* Empty State */}
      {(!courses?.courses || courses.courses.length === 0) && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No courses found
          </h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}

      {/* Pagination */}
      {courses?.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            disabled={courses.currentPage === 1}
            onClick={() => handleFilterChange("page", courses.currentPage - 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Page {courses.currentPage} of {courses.totalPages}
          </span>

          <button
            disabled={courses.currentPage === courses.totalPages}
            onClick={() => handleFilterChange("page", courses.currentPage + 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course }) => {
  return (
    <div className="card-hover p-6">
      <div className="flex flex-col h-full">
        {/* Course Image */}
        <div className="relative mb-4">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.level === "beginner"
                  ? "bg-success-100 text-success-800"
                  : course.level === "intermediate"
                  ? "bg-warning-100 text-warning-800"
                  : "bg-error-100 text-error-800"
              }`}
            >
              {course.level}
            </span>
          </div>
        </div>

        {/* Course Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.shortDescription || course.description}
          </p>

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
              {course.category}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{course.averageRating?.toFixed(1) || "0.0"}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-1" />
                <span>{course.totalStudents}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span>{course.duration}h</span>
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center mb-4">
            <img
              src={course.instructor?.profile?.avatar || "/default-avatar.png"}
              alt={course.instructor?.username}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">
              {course.instructor?.profile?.firstName ||
                course.instructor?.username}
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${course.price.monthly}/mo
            </span>
            <span className="text-sm text-gray-500 ml-2">
              or ${course.price.yearly}/yr
            </span>
          </div>
          <Link
            to={`/courses/${course._id}`}
            className="btn btn-primary text-sm"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Courses;
