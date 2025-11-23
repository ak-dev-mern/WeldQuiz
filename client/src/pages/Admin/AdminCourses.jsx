import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminAPI, coursesAPI } from "../../services/api";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Plus,
  BookOpen,
  Users,
  Star,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import EmptyState from "../../components/UI/EmptyState";
import toast from "react-hot-toast";

const AdminCourses = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses", filters],
    queryFn: () => adminAPI.getCourses(filters),
  });


  console.log(courses?.data?.courses);
  

  const updateCourseStatusMutation = useMutation({
    mutationFn: ({ courseId, status }) =>
      adminAPI.updateCourseStatus(courseId, { isActive: status }),
    onSuccess: () => {
      toast.success("Course status updated successfully");
      queryClient.invalidateQueries(["admin-courses"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update course status"
      );
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId) => coursesAPI.deleteCourse(courseId),
    onSuccess: () => {
      toast.success("Course deleted successfully");
      queryClient.invalidateQueries(["admin-courses"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete course");
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleStatusToggle = (courseId, currentStatus) => {
    updateCourseStatusMutation.mutate({
      courseId,
      status: !currentStatus,
    });
  };

  const handleDeleteCourse = (courseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage all courses
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard/admin/add-course")}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters:
            </span>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instructor
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Students
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
              {courses?.courses?.map((course) => (
                <CourseRow
                  key={course._id}
                  course={course}
                  onStatusToggle={handleStatusToggle}
                  onDelete={handleDeleteCourse}
                />
              ))}
            </tbody>
          </table>
        </div>

        {(!courses?.courses || courses.courses.length === 0) && (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description={
              filters.search || filters.status
                ? "Try adjusting your search or filters"
                : "Create your first course to get started"
            }
          />
        )}
      </div>

      {/* Pagination */}
      {courses?.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            disabled={courses.currentPage === 1}
            onClick={() => handleFilterChange("page", courses.currentPage - 1)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {courses.currentPage} of {courses.totalPages}
          </span>

          <button
            disabled={courses.currentPage === courses.totalPages}
            onClick={() => handleFilterChange("page", courses.currentPage + 1)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const CourseRow = ({ course, onStatusToggle, onDelete }) => {
  const navigate = useNavigate();

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
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <img
            src={course.instructor?.profile?.avatar || "/default-avatar.png"}
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
          <span>{course.totalStudents}</span>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {course.averageRating?.toFixed(1) || "0.0"}
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
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => navigate(`/dashboard/courses/${course._id}`)}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            onClick={() =>
              navigate(`/dashboard/admin/edit-course/${course._id}`)
            }
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(course._id)}
            className="p-1 text-gray-400 hover:text-error-600 dark:hover:text-error-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminCourses;
