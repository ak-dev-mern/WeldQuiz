import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { coursesAPI } from "../../services/api";
import {
  MessageSquare,
  Star,
  Send,
  ThumbsUp,
  ThumbsDown,
  User,
  Clock,
  Filter,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import EmptyState from "../../components/UI/EmptyState";
import toast from "react-hot-toast";

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("give");
  const [selectedCourse, setSelectedCourse] = useState("");

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["user-courses"],
    queryFn: () => coursesAPI.getCourses({ enrolled: true }),
  });

  const giveFeedbackMutation = useMutation({
    mutationFn: ({ courseId, rating, review }) =>
      coursesAPI.rateCourse(courseId, { rating, review }),
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const rating = watch("rating");

  const onSubmit = async (data) => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    giveFeedbackMutation.mutate({
      courseId: selectedCourse,
      rating: parseInt(data.rating),
      review: data.review,
    });
    reset();
    setSelectedCourse("");
  };

  if (coursesLoading) return <LoadingSpinner />;

  const enrolledCourses = courses?.courses || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Feedback
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your experience and help us improve
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-600">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("give")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "give"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Give Feedback
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            My Feedback
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "give" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Selection */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Course
              </h3>
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => setSelectedCourse(course._id)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      selectedCourse === course._id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400"
                        : "border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {course.category}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {enrolledCourses.length === 0 && (
                <EmptyState
                  icon={MessageSquare}
                  title="No courses enrolled"
                  description="You need to enroll in courses to provide feedback"
                  action={
                    <a href="/courses" className="btn btn-primary">
                      Browse Courses
                    </a>
                  }
                />
              )}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Share Your Feedback
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      How would you rate this course?
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            // Set rating value
                            const event = {
                              target: { value: star.toString() },
                            };
                            register("rating").onChange(event);
                          }}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= (rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <input
                      type="hidden"
                      {...register("rating", {
                        required: "Rating is required",
                      })}
                    />
                    {errors.rating && (
                      <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                        {errors.rating.message}
                      </p>
                    )}
                  </div>

                  {/* Review */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Review
                    </label>
                    <textarea
                      {...register("review", {
                        required: "Review is required",
                        minLength: {
                          value: 10,
                          message: "Review must be at least 10 characters",
                        },
                        maxLength: {
                          value: 1000,
                          message: "Review must be less than 1000 characters",
                        },
                      })}
                      rows={6}
                      className="input"
                      placeholder="Share your experience with this course. What did you like? What could be improved?"
                    />
                    {errors.review && (
                      <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                        {errors.review.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={giveFeedbackMutation.isLoading}
                      className="btn btn-primary"
                    >
                      {giveFeedbackMutation.isLoading ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Course
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a course from the left to provide feedback
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "my" && <MyFeedbackTab courses={enrolledCourses} />}
    </div>
  );
};

const MyFeedbackTab = ({ courses }) => {
  const [filterCourse, setFilterCourse] = useState("");

  // This would typically come from an API
  const myFeedback = courses
    .flatMap(
      (course) =>
        course.ratings?.filter(
          (rating) => rating.user?._id === "current-user-id"
        ) || []
    )
    .map((feedback) => ({
      ...feedback,
      course: courses.find((c) =>
        c.ratings?.some((r) => r._id === feedback._id)
      ),
    }));

  const filteredFeedback = myFeedback.filter(
    (feedback) => !filterCourse || feedback.course?._id === filterCourse
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="border border-gray-300 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <FeedbackCard key={feedback._id} feedback={feedback} />
        ))}

        {filteredFeedback.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="No feedback submitted"
            description={
              filterCourse
                ? "You haven't submitted feedback for this course yet"
                : "You haven't submitted any feedback yet"
            }
          />
        )}
      </div>
    </div>
  );
};

const FeedbackCard = ({ feedback }) => {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={feedback.course?.image}
            alt={feedback.course?.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {feedback.course?.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {feedback.course?.category}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < feedback.rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4">{feedback.review}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ThumbsUp className="h-4 w-4" />
            <span>Helpful</span>
          </button>
          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ThumbsDown className="h-4 w-4" />
            <span>Not Helpful</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
