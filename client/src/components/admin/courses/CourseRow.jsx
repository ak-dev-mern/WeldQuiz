// components/admin/courses/CourseRow.jsx
import React from "react";
import {
  Edit2,
  Trash2,
  Eye,
  Users,
  Star,
  BookOpen,
  FileText,
} from "lucide-react";
import getAvatarUrl from "../../../hooks/useGetAvatarUrl";

const CourseRow = ({
  course,
  onStatusToggle,
  onDelete,
  onViewDetails,
  onEditDetails,
  onManageContent,
}) => {
  // Get total lessons from units
  const getTotalLessons = () => {
    if (!course.units || course.units.length === 0) return 0;
    return course.units.reduce(
      (total, unit) => total + (unit.lessons?.length || 0),
      0
    );
  };

  // Get total questions from units
  const getTotalQuestions = () => {
    if (!course.units || course.units.length === 0) return 0;
    return course.units.reduce(
      (total, unit) => total + (unit.questions?.length || 0),
      0
    );
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <img
            src={course.image}
            alt={course.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {course.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {course.category} • {course.level}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {course.units?.length || 0} units • {getTotalLessons()} lessons •{" "}
              {getTotalQuestions()} questions
            </div>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <img
            src={getAvatarUrl(course.instructor?.profile?.avatar)}
            alt={course.instructor?.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-900 dark:text-white">
            {course.instructor?.profile?.firstName}{" "}
            {course.instructor?.profile?.lastName}
          </span>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{course.totalStudents || 0}</span>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {course.averageRating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-xs text-gray-400">
            ({course.totalReviews || 0})
          </span>
        </div>
      </td>

      <td className="py-4 px-4">
        <button
          onClick={() => onStatusToggle(course._id, course.isActive)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            course.isActive
              ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
              : "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200"
          }`}
        >
          {course.isActive ? "Active" : "Inactive"}
        </button>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <button
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            onClick={() => onViewDetails(course)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            onClick={() => onEditDetails(course._id)}
            title="Edit Course Details"
          >
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            onClick={() => onManageContent(course._id)}
            title="Manage Course Content"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(course._id)}
            className="p-1 text-gray-400 hover:text-error-600 dark:hover:text-error-400"
            title="Delete Course"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CourseRow;
