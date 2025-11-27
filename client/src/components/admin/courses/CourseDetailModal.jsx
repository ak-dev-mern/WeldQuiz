import React from "react";
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  BarChart3,
  FileText,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
  BookOpen,
  Edit2,
} from "lucide-react";
import CourseUnitsSection from "./CourseUnitsSection";

const CourseDetailModal = ({ course, onClose, onEdit, onStatusToggle }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalDuration = () => {
    if (!course.units || course.units.length === 0) return "0 hours";
    const totalMinutes = course.units.reduce(
      (total, unit) => total + (unit.duration || 0),
      0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTotalLessons = () => {
    if (!course.units || course.units.length === 0) return 0;
    return course.units.reduce(
      (total, unit) => total + (unit.lessons?.length || 0),
      0
    );
  };

  const getTotalQuestions = () => {
    if (!course.units || course.units.length === 0) return 0;
    return course.units.reduce(
      (total, unit) => total + (unit.questions?.length || 0),
      0
    );
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Course Header */}
          <div className="flex flex-col gap-8">
            {/* Full Width Course Image */}
            <div className="w-full">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 md:h-80 lg:h-96 rounded-xl object-cover"
              />
            </div>

            {/* Course Basic Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {course.title}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                  {course.description}
                </p>

                {course.shortDescription && (
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                    {course.shortDescription}
                  </p>
                )}
              </div>

              {/* Course Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* Category */}
                <div className="flex items-start space-x-2">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {course.category}
                    </p>
                  </div>
                </div>

                {/* Level */}
                <div className="flex items-start space-x-2">
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {course.level}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-start space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Price
                    </p>
                    <p className="font-medium">
                      Monthly:{" "}
                      {course.price?.monthly === 0
                        ? "Free"
                        : `$${course.price?.monthly}`}
                    </p>
                    <p className="font-medium">
                      Yearly:{" "}
                      {course.price?.yearly === 0
                        ? "Free"
                        : `$${course.price?.yearly}`}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration
                    </p>
                    <p className="font-medium">{getTotalDuration()}</p>
                  </div>
                </div>

                {/* Lessons */}
                <div className="flex items-start space-x-2">
                  <PlayCircle className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lessons
                    </p>
                    <p className="font-medium">{getTotalLessons()}</p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-start space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created
                    </p>
                    <p className="font-medium">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Rating */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => onStatusToggle(course._id, course.isActive)}
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                    course.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {course.isActive ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  {course.isActive ? "Active" : "Inactive"}
                </button>

                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">
                    {course.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({course.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Information */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Instructor
            </h3>
            <div className="flex items-center space-x-3">
              <img
                src={getAvatarUrl(course.instructor?.profile?.avatar)}
                alt={course.instructor?.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {course.instructor?.profile?.firstName}{" "}
                  {course.instructor?.profile?.lastName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{course.instructor?.username}
                </p>
                {course.instructor?.profile?.bio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {course.instructor.profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.totalStudents || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Students
              </p>
            </div>

            <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-4 text-center">
              <Star className="h-8 w-8 text-success-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.averageRating?.toFixed(1) || "0.0"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.units?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Units</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTotalQuestions()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questions
              </p>
            </div>
          </div>

          {/* Course Units with Lessons and Questions */}
          <CourseUnitsSection course={course} />

          {/* Learning Outcomes */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Learning Outcomes
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {outcome}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Requirements
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {course.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-dark-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(course._id);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Course</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
