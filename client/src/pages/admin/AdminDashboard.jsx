import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../services/api";
import {
  Users,
  BookOpen,
  BarChart3,
  DollarSign,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminAPI.getDashboardStats(),
  });

  if (isLoading) return <LoadingSpinner />;

  const dashboardStats = [
    {
      name: "Total Users",
      value: stats?.stats?.totals?.users || 0,
      icon: Users,
      change: "+12%",
      changeType: "increase",
      color: "blue",
    },
    {
      name: "Total Courses",
      value: stats?.stats?.totals?.courses || 0,
      icon: BookOpen,
      change: "+5%",
      changeType: "increase",
      color: "green",
    },
    {
      name: "Exams Taken",
      value: stats?.stats?.totals?.exams || 0,
      icon: BarChart3,
      change: "+23%",
      changeType: "increase",
      color: "purple",
    },
    {
      name: "Total Revenue",
      value: `$${(stats?.stats?.totals?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: "+18%",
      changeType: "increase",
      color: "yellow",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your learning platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Users
            </h2>
            <a
              href="admin/users"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </a>
          </div>
          <div className="space-y-4">
            {stats?.stats?.recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center space-x-3">
                <img
                  src={user.profile?.avatar || "/default-avatar.png"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user.username}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Popular Courses
            </h2>
            <a
              href="admin/courses"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </a>
          </div>
          <div className="space-y-4">
            {stats?.stats?.popularCourses?.map((course) => (
              <div key={course._id} className="flex items-center space-x-3">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {course.totalStudents} students
                  </p>
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {course.averageRating?.toFixed(1) || "0.0"} ★
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <div className="p-2 bg-success-100 dark:bg-success-800 rounded-lg">
              <UserCheck className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-success-900 dark:text-success-100">
                Database
              </p>
              <p className="text-xs text-success-700 dark:text-success-300">
                Healthy
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <div className="p-2 bg-warning-100 dark:bg-warning-800 rounded-lg">
              <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning-900 dark:text-warning-100">
                Uptime
              </p>
              <p className="text-xs text-warning-700 dark:text-warning-300">
                {stats?.stats?.systemHealth?.uptime
                  ? `${Math.floor(stats.stats.systemHealth.uptime / 60)}m`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                Performance
              </p>
              <p className="text-xs text-primary-700 dark:text-primary-300">
                Optimal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ stat }) => {
  const Icon = stat.icon;

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div
          className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}
        >
          <Icon
            className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
          />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {stat.name}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {stat.value}
          </p>
        </div>
      </div>
      <div
        className={`mt-4 flex items-center text-sm ${
          stat.changeType === "increase" ? "text-success-600" : "text-error-600"
        }`}
      >
        <TrendingUp
          className={`h-4 w-4 mr-1 ${
            stat.changeType === "increase"
              ? "text-success-600"
              : "text-error-600"
          }`}
        />
        <span>{stat.change} from last month</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
