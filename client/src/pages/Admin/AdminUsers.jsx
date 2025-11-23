import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI, authAPI } from "../../services/api";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  UserCheck,
  UserX,
  X,
  Camera,
  Save,
  MapPin,
  Globe,
  Eye,
  Grid,
  List,
  Calendar,
  BookOpen,
  Award,
  Shield,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import EmptyState from "../../components/UI/EmptyState";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    page: 1,
    limit: 10,
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => adminAPI.getUsers(filters),
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }) =>
      adminAPI.updateUserStatus(userId, { isActive: status }),
    onSuccess: () => {
      toast.success("User status updated successfully");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update user status"
      );
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminAPI.updateUser(userId, { role }),
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update user role"
      );
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => adminAPI.updateUser(userId, data),
    onSuccess: () => {
      toast.success("User updated successfully");
      closeEditModal();
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (formData) => authAPI.uploadUserImage(formData),
    onSuccess: (data) => {
      toast.success("Profile image uploaded successfully");
      return data.imageUrl;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to upload image");
      setUploadingImage(false);
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleStatusToggle = (userId, currentStatus) => {
    updateUserStatusMutation.mutate({
      userId,
      status: !currentStatus,
    });
  };

  const handleRoleChange = (userId, newRole) => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      profile: {
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        phone: user.profile?.phone || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        website: user.profile?.website || "",
      },
      username: user.username,
      email: user.email,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditForm({});
    setUploadingImage(false);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;

    updateUserMutation.mutate({
      userId: editingUser._id,
      data: editForm,
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => {
      if (field.startsWith("profile.")) {
        const profileField = field.replace("profile.", "");
        return {
          ...prev,
          profile: {
            ...prev.profile,
            [profileField]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleImageUpload = async (file) => {
    if (!file || !editingUser) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", editingUser._id);

      const imageUrl = await uploadImageMutation.mutateAsync(formData);

      setEditForm((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: imageUrl,
        },
      }));

      setEditingUser((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: imageUrl,
        },
      }));
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all platform users
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-dark-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-dark-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
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
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

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

      {/* Users Content */}
      <div className="card">
        {viewMode === "list" ? (
          <UsersListView
            users={users?.data?.users}
            onStatusToggle={handleStatusToggle}
            onRoleChange={handleRoleChange}
            onEdit={openEditModal}
            onViewDetails={openDetailModal}
          />
        ) : (
          <UsersGridView
            users={users?.data?.users}
            onStatusToggle={handleStatusToggle}
            onRoleChange={handleRoleChange}
            onEdit={openEditModal}
            onViewDetails={openDetailModal}
          />
        )}

        {(!users?.data?.users || users.data.users.length === 0) && (
          <EmptyState
            icon={UserCheck}
            title="No users found"
            description={
              filters.search || filters.role || filters.status
                ? "Try adjusting your search or filters"
                : "No users have registered yet"
            }
          />
        )}
      </div>

      {/* Pagination */}
      {users?.data?.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            disabled={users.currentPage === 1}
            onClick={() => handleFilterChange("page", users.currentPage - 1)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {users.currentPage} of {users.totalPages}
          </span>

          <button
            disabled={users.currentPage === users.totalPages}
            onClick={() => handleFilterChange("page", users.currentPage + 1)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <EditUserModal
          user={editingUser}
          editForm={editForm}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onSave={handleSaveEdit}
          onClose={closeEditModal}
          uploadingImage={uploadingImage}
          isSaving={updateUserMutation.isLoading}
        />
      )}

      {/* User Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={closeDetailModal}
          onEdit={openEditModal}
        />
      )}
    </div>
  );
};

// Minimal List View Component
const UsersListView = ({
  users,
  onStatusToggle,
  onRoleChange,
  onEdit,
  onViewDetails,
}) => {
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-dark-600">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              User
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
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
          {users?.map((user) => (
            <tr
              key={user._id}
              className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={getAvatarUrl(user?.profile?.avatar)}
                    alt={user?.username}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-4 px-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
              </td>

              <td className="py-4 px-4">
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user._id, e.target.value)}
                  className="text-sm border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded px-7 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              <td className="py-4 px-4">
                <button
                  onClick={() => onStatusToggle(user._id, user.isActive)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
                      : "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </button>
              </td>

              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    title="Edit User"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-error-600 dark:hover:text-error-400"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Grid View Component
const UsersGridView = ({
  users,
  onStatusToggle,
  onRoleChange,
  onEdit,
  onViewDetails,
}) => {
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {users?.map((user) => (
        <div
          key={user._id}
          className="bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 p-4 hover:shadow-md transition-all"
        >
          {/* User Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img
                src={getAvatarUrl(user?.profile?.avatar)}
                alt={user?.username}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {user.profile?.firstName} {user.profile?.lastName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onViewDetails(user)}
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user.email}</span>
            </div>

            {user.profile?.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                <span>{user.profile.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.coursesEnrolled?.length || 0} courses
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Shield
                  className={`h-3 w-3 ${
                    user.role === "admin" ? "text-primary-600" : "text-gray-400"
                  }`}
                />
                <span className="text-xs capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-600">
            <button
              onClick={() => onStatusToggle(user._id, user.isActive)}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.isActive
                  ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
                  : "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </button>

            <div className="flex items-center space-x-2">
              <select
                value={user.role}
                onChange={(e) => onRoleChange(user._id, e.target.value)}
                className="text-xs border border-gray-300 dark:border-dark-500 dark:bg-dark-600 dark:text-white rounded px-2 py-1 focus:ring-1 focus:ring-primary-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={() => onEdit(user)}
                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                title="Edit User"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ user, onClose, onEdit }) => {
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Details
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
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img
                src={getAvatarUrl(user?.profile?.avatar)}
                alt={user.username}
                className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-dark-600"
              />
              <div
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-dark-800 ${
                  user.isActive ? "bg-success-500" : "bg-error-500"
                }`}
              />
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.profile?.firstName} {user.profile?.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                @{user.username}
              </p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
                      : "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Email
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.profile?.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 flex items-center justify-center">
                      <span className="text-sm text-gray-400">📱</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Phone
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.profile.phone}
                      </p>
                    </div>
                  </div>
                )}

                {user.profile?.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Location
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.profile.location}
                      </p>
                    </div>
                  </div>
                )}

                {user.profile?.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Website
                      </p>
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        {user.profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Statistics
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 text-center">
                  <BookOpen className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.coursesEnrolled?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Courses
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 text-center">
                  <Award className="h-6 w-6 text-success-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.certificates?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Certificates
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Member Since
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.profile?.bio && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About
              </h4>
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {user.profile.bio}
                </p>
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
              onEdit(user);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal (Keep your existing EditUserModal component)
const EditUserModal = ({
  user,
  editForm,
  onInputChange,
  onImageUpload,
  onSave,
  onClose,
  uploadingImage,
  isSaving,
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit User
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
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={
                  editForm.profile?.avatar ||
                  user.profile?.avatar ||
                  "/default-avatar.png"
                }
                alt={user.username}
                className="w-24 h-24 rounded-full"
              />
              <label
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click camera icon to upload new profile image
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={editForm.profile?.firstName || ""}
                onChange={(e) =>
                  onInputChange("profile.firstName", e.target.value)
                }
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={editForm.profile?.lastName || ""}
                onChange={(e) =>
                  onInputChange("profile.lastName", e.target.value)
                }
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={editForm.username || ""}
                onChange={(e) => onInputChange("username", e.target.value)}
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={editForm.email || ""}
                onChange={(e) => onInputChange("email", e.target.value)}
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={editForm.profile?.phone || ""}
                onChange={(e) => onInputChange("profile.phone", e.target.value)}
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={editForm.profile?.location || ""}
                onChange={(e) =>
                  onInputChange("profile.location", e.target.value)
                }
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </label>
              <input
                type="url"
                value={editForm.profile?.website || ""}
                onChange={(e) =>
                  onInputChange("profile.website", e.target.value)
                }
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com (Optional)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={editForm.profile?.bio || ""}
                onChange={(e) => onInputChange("profile.bio", e.target.value)}
                rows="3"
                className="w-full border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about yourself... (Optional)"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-dark-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || uploadingImage}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
