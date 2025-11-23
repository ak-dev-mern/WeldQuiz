import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { activitiesAPI } from "../../services/api";
import {
  Clock,
  BookOpen,
  Award,
  BarChart3,
  Filter,
  Calendar,
  TrendingUp,
  Target,
  Users,
  Trophy,
  Star,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import EmptyState from "../../components/UI/EmptyState";

const Activities = () => {
  const [timeRange, setTimeRange] = useState("all");
  const [activityType, setActivityType] = useState("all");

  // Fetch activities data
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities", timeRange],
    queryFn: () =>
      activitiesAPI.getActivities({
        timeRange,
        type: activityType !== "all" ? activityType : undefined,
        limit: 50,
      }),
  });

  // Fetch activity summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["activity-summary"],
    queryFn: () => activitiesAPI.getActivitySummary(),
  });

  // Fetch user stats
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => activitiesAPI.getUserStats(),
  });

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => activitiesAPI.getLeaderboard({ limit: 10 }),
  });

  const isLoading =
    activitiesLoading ||
    summaryLoading ||
    userStatsLoading ||
    leaderboardLoading;

  const activities = activitiesData?.data || [];
  const summary = summaryData?.data || {};
  const userStatsData = userStats?.data || {};
  const leaderboard = leaderboardData?.data?.data || [];

  // Filter activities by type
const activityItems = Array.isArray(activities)
  ? activities
  : Array.isArray(activities?.data)
  ? activities.data
  : [];

const filteredActivities = activityItems.filter((activity) => {
  if (activityType === "all") return true;
  return activity.type === activityType;
});

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Learning Activities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your learning progress and achievements
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 mb-3">
            <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.totalActivities || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Activities
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900 mb-3">
            <Award className="h-6 w-6 text-success-600 dark:text-success-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.completedCourses || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Courses Completed
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning-100 dark:bg-warning-900 mb-3">
            <Clock className="h-6 w-6 text-warning-600 dark:text-warning-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(summary.totalStudyTime / 60) || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Study Hours
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 mb-3">
            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userStatsData.currentStreak || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Day Streak
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Learning Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Weekly Goal
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userStatsData.weeklyGoalProgress || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary-600"
                style={{ width: `${userStatsData.weeklyGoalProgress || 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Total Points
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userStatsData.totalPoints || 0}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Level</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userStatsData.level || 1}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Rank</span>
              <span className="font-medium text-gray-900 dark:text-white">
                #{userStatsData.rank || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Learners
          </h3>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((user, index) => (
              <div
                key={user._id || user.userId}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-dark-600 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {user.username || user.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Level {user.level || 1}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {user.points || user.totalPoints || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.completedCourses || 0} courses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activities
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Filter:
            </span>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="exam">Exams</option>
              <option value="course_completed">Course Completed</option>
              <option value="lesson_completed">Lesson Completed</option>
              <option value="enrollment">Enrollment</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <ActivityItem key={activity._id} activity={activity} />
          ))}

          {filteredActivities.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No activities found"
              description={
                activityType !== "all" || timeRange !== "all"
                  ? "No activities match your current filters"
                  : "Start learning to see your activity history"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "exam":
        return (
          <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        );
      case "course_completed":
        return (
          <Award className="h-6 w-6 text-success-600 dark:text-success-400" />
        );
      case "lesson_completed":
        return (
          <BookOpen className="h-6 w-6 text-warning-600 dark:text-warning-400" />
        );
      case "enrollment":
        return (
          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        );
      default:
        return (
          <BookOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case "exam":
        return `Completed exam: ${activity.courseTitle || "Unknown Course"}`;
      case "course_completed":
        return `Completed course: ${activity.courseTitle || "Unknown Course"}`;
      case "lesson_completed":
        return `Completed lesson: ${activity.lessonTitle || "Unknown Lesson"}`;
      case "enrollment":
        return `Enrolled in: ${activity.courseTitle || "Unknown Course"}`;
      default:
        return activity.description || "Activity completed";
    }
  };

  const getActivityDescription = (activity) => {
    const date = new Date(
      activity.createdAt || activity.timestamp
    ).toLocaleDateString();
    const time = new Date(
      activity.createdAt || activity.timestamp
    ).toLocaleTimeString();

    if (activity.type === "exam" && activity.score !== undefined) {
      return `Score: ${activity.score}% • ${date} at ${time}`;
    }

    if (activity.points) {
      return `+${activity.points} points • ${date} at ${time}`;
    }

    return `Completed on ${date} at ${time}`;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "exam":
        return "bg-primary-100 dark:bg-primary-900";
      case "course_completed":
        return "bg-success-100 dark:bg-success-900";
      case "lesson_completed":
        return "bg-warning-100 dark:bg-warning-900";
      case "enrollment":
        return "bg-purple-100 dark:bg-purple-900";
      default:
        return "bg-gray-100 dark:bg-gray-900";
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
      <div className={`p-3 rounded-lg ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {getActivityTitle(activity)}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getActivityDescription(activity)}
        </p>
        {activity.duration && (
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Duration: {Math.floor(activity.duration / 60)}m{" "}
              {activity.duration % 60}s
            </span>
          </div>
        )}
      </div>

      <div className="text-right">
        {activity.points && (
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
            <Star className="h-4 w-4" />+{activity.points}
          </div>
        )}
        {activity.score !== undefined && (
          <div
            className={`text-lg font-bold ${
              activity.score >= 80
                ? "text-success-600"
                : activity.score >= 60
                ? "text-warning-600"
                : "text-error-600"
            }`}
          >
            {activity.score}%
          </div>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {activity.type?.replace("_", " ")}
        </div>
      </div>
    </div>
  );
};

export default Activities;
