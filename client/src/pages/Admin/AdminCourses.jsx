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
  FileText,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import EmptyState from "../../components/UI/EmptyState";
import toast from "react-hot-toast";
import CourseDetailModal from "../../components/admin/courses/CourseDetailModal";
import CourseRow from "../../components/admin/courses/CourseRow";

const AdminCourses = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses", filters],
    queryFn: () => adminAPI.getCourses(filters),
  });

    console.log(courses);

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

  const openDetailModal = (course) => {
    setSelectedCourse(course);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCourse(null);
  };

  const handleEditCourseDetails = (courseId) => {
    navigate(`/dashboard/admin/edit-course/${courseId}`);
  };

  const handleManageCourseContent = (courseId) => {
    navigate(`/dashboard/admin/course-content/${courseId}`);
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
              {courses?.data?.courses?.map((course) => (
                <CourseRow
                  key={course._id}
                  course={course}
                  onStatusToggle={handleStatusToggle}
                  onDelete={handleDeleteCourse}
                  onViewDetails={openDetailModal}
                  onEditDetails={handleEditCourseDetails}
                  onManageContent={handleManageCourseContent}
                />
              ))}
            </tbody>
          </table>
        </div>

        {(!courses?.data?.courses || courses.data.courses.length === 0) && (
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
      {courses?.data?.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            disabled={courses.data.currentPage === 1}
            onClick={() =>
              handleFilterChange("page", courses.data.currentPage - 1)
            }
            className="px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {courses.data.currentPage} of {courses.data.totalPages}
          </span>

          <button
            disabled={courses.data.currentPage === courses.data.totalPages}
            onClick={() =>
              handleFilterChange("page", courses.data.currentPage + 1)
            }
            className="px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
          >
            Next
          </button>
        </div>
      )}

      {/* Course Detail Modal */}
      {isDetailModalOpen && selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={closeDetailModal}
          onEdit={handleEditCourseDetails}
          onStatusToggle={handleStatusToggle}
        />
      )}
    </div>
  );
};

export default AdminCourses;
