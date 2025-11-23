import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discussionsAPI, coursesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  MessageSquare,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Pin,
  CheckCircle,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import EmptyState from "../../components/UI/EmptyState";
import toast from "react-hot-toast";

const Discussion = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    courseId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);

  const { data: discussions, isLoading } = useQuery({
    queryKey: ["discussions", filters],
    queryFn: () => discussionsAPI.getDiscussions(filters),
  });

  const { data: courses } = useQuery({
    queryKey: ["user-courses"],
    queryFn: () => coursesAPI.getCourses({ enrolled: true }),
  });

  const createDiscussionMutation = useMutation({
    mutationFn: (data) => discussionsAPI.createDiscussion(data),
    onSuccess: () => {
      toast.success("Discussion created successfully");
      setShowNewDiscussion(false);
      queryClient.invalidateQueries(["discussions"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create discussion"
      );
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ discussionId, voteType }) =>
      discussionsAPI.voteDiscussion(discussionId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
    },
  });

  const handleVote = (discussionId, voteType) => {
    voteMutation.mutate({ discussionId, voteType });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Discussion Forum
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions and share knowledge with other learners
          </p>
        </div>
        <button
          onClick={() => setShowNewDiscussion(true)}
          className="btn btn-primary"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          New Discussion
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
              placeholder="Search discussions..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={filters.courseId}
            onChange={(e) => handleFilterChange("courseId", e.target.value)}
            className="border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            {courses?.courses?.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="createdAt">Newest</option>
            <option value="voteCount">Most Popular</option>
            <option value="replyCount">Most Active</option>
          </select>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions?.discussions?.map((discussion) => (
          <DiscussionCard
            key={discussion._id}
            discussion={discussion}
            onVote={handleVote}
          />
        ))}

        {(!discussions?.discussions ||
          discussions.discussions.length === 0) && (
          <EmptyState
            icon={MessageSquare}
            title="No discussions found"
            description={
              filters.search || filters.courseId
                ? "Try adjusting your search or filters"
                : "Be the first to start a discussion"
            }
            action={
              <button
                onClick={() => setShowNewDiscussion(true)}
                className="btn btn-primary"
              >
                Start a Discussion
              </button>
            }
          />
        )}
      </div>

      {/* New Discussion Modal */}
      {showNewDiscussion && (
        <NewDiscussionModal
          courses={courses?.courses || []}
          onSubmit={createDiscussionMutation.mutate}
          onClose={() => setShowNewDiscussion(false)}
          isLoading={createDiscussionMutation.isLoading}
        />
      )}
    </div>
  );
};

const DiscussionCard = ({ discussion, onVote }) => {
  const { user } = useAuth();

  return (
    <div className="card p-6 hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={discussion.user?.profile?.avatar || "/default-avatar.png"}
            alt={discussion.user?.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {discussion.user?.profile?.firstName}{" "}
              {discussion.user?.profile?.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{discussion.user?.username} •{" "}
              {new Date(discussion.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {discussion.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
          {discussion.isResolved && (
            <CheckCircle className="h-4 w-4 text-success-500" />
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {discussion.title}
      </h2>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {discussion.content}
      </p>

      {discussion.tags && discussion.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {discussion.tags.map((tag) => (
            <span key={tag} className="badge badge-primary text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={() => onVote(discussion._id, "upvote")}
            className={`flex items-center space-x-1 ${
              discussion.upvotes.includes(user?._id)
                ? "text-primary-600"
                : "hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{discussion.upvotes.length}</span>
          </button>

          <button
            onClick={() => onVote(discussion._id, "downvote")}
            className={`flex items-center space-x-1 ${
              discussion.downvotes.includes(user?._id)
                ? "text-error-600"
                : "hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{discussion.downvotes.length}</span>
          </button>

          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{discussion.replies.length} replies</span>
          </div>

          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{discussion.views} views</span>
          </div>
        </div>

        <button className="btn btn-outline text-sm">Join Discussion</button>
      </div>
    </div>
  );
};

const NewDiscussionModal = ({ courses, onSubmit, onClose, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              New Discussion
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course
              </label>
              <select
                {...register("courseId", {
                  required: "Please select a course",
                })}
                className="input"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.courseId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                type="text"
                className="input"
                placeholder="Enter discussion title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                {...register("content", { required: "Content is required" })}
                rows={6}
                className="input"
                placeholder="Describe your question or topic..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                {...register("tags")}
                type="text"
                className="input"
                placeholder="e.g., javascript, react, help"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  "Create Discussion"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Discussion;
