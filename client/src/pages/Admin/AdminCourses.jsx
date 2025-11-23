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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses", filters],
    queryFn: () => adminAPI.getCourses(filters),
  });

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

  const handleEditCourse = (courseId) => {
    navigate(`/dashboard/admin/edit-course/${courseId}`);
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
                  onEdit={handleEditCourse}
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
          onEdit={handleEditCourse}
          onStatusToggle={handleStatusToggle}
        />
      )}
    </div>
  );
};

const CourseRow = ({
  course,
  onStatusToggle,
  onDelete,
  onViewDetails,
  onEdit,
}) => {
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
            onClick={() => onEdit(course._id)}
            title="Edit Course"
          >
            <Edit2 className="h-4 w-4" />
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

const CourseDetailModal = ({ course, onClose, onEdit, onStatusToggle }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCompletionPercentage = () => {
    if (!course.modules || course.modules.length === 0) return 0;
    const totalLessons = course.modules.reduce(
      (total, module) => total + (module.lessons?.length || 0),
      0
    );
    return totalLessons > 0
      ? Math.round(((course.completedLessons || 0) / totalLessons) * 100)
      : 0;
  };

  const getTotalDuration = () => {
    if (!course.modules || course.modules.length === 0) return "0 hours";
    const totalMinutes = course.modules.reduce(
      (total, module) => total + (module.duration || 0),
      0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="flex flex-col  gap-6">
            {/* Course Image */}
            <div className="lg:w-full">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 lg:h-64 rounded-lg object-cover"
              />
            </div>

            {/* Course Basic Info */}
            <div className="lg:w-full space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {course.description}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {course.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {course.level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Price
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getTotalDuration()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <PlayCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lessons
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.modules?.reduce(
                        (total, module) =>
                          total + (module.lessons?.length || 0),
                        0
                      ) || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Rating */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onStatusToggle(course._id, course.isActive)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    course.isActive
                      ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
                      : "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200"
                  }`}
                >
                  {course.isActive ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  {course.isActive ? "Active" : "Inactive"}
                </button>

                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {course.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
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
                {course.modules?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modules
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getCompletionPercentage()}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completion
              </p>
            </div>
          </div>

          {/* Course Modules */}
          {course.modules && course.modules.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Course Modules ({course.modules.length})
              </h3>
              <div className="space-y-3">
                {course.modules.map((module, index) => (
                  <div
                    key={module._id}
                    className="border border-gray-200 dark:border-dark-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {index + 1}. {module.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {module.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                            <PlayCircle className="h-3 w-3" />
                            <span>{module.lessons?.length || 0} lessons</span>
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.duration || 0} minutes</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

          {/* What You'll Learn */}
          {course.learnings && course.learnings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What You'll Learn
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.learnings.map((learning, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {learning}
                    </span>
                  </li>
                ))}
              </ul>
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

export default AdminCourses;
