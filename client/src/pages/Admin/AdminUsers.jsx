import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../services/api";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Shield,
  UserCheck,
  UserX,
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

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Courses
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
              {users?.users?.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  onStatusToggle={handleStatusToggle}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </tbody>
          </table>
        </div>

        {(!users?.users || users.users.length === 0) && (
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
      {users?.totalPages > 1 && (
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
    </div>
  );
};

const UserRow = ({ user, onStatusToggle, onRoleChange }) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <img
            src={user.profile?.avatar || "/default-avatar.png"}
            alt={user.username}
            className="w-10 h-10 rounded-full"
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
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        {user.profile?.phone && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user.profile.phone}
          </div>
        )}
      </td>

      <td className="py-4 px-4">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(user._id, e.target.value)}
          className="text-sm border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </td>

      <td className="py-4 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {user.coursesEnrolled?.length || 0} enrolled
        </div>
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
          {user.isActive ? (
            <>
              <UserCheck className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <UserX className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </button>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            <Edit2 className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-error-600 dark:hover:text-error-400">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminUsers;
