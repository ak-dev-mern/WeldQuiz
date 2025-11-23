import React, { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  PlayCircle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { coursesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeUnit, setActiveUnit] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesAPI.getCourse(id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => coursesAPI.enrollCourse(id),
    onSuccess: () => {
      toast.success("Successfully enrolled in course!");
      queryClient.invalidateQueries(["course", id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Enrollment failed");
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const { course, isEnrolled } = courseData;

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        <Link to="/courses" className="btn btn-primary mt-4">
          Browse Courses
        </Link>
      </div>
    );
  }

  const currentUnit = course.units[activeUnit];
  const totalLessons = course.units.reduce(
    (total, unit) => total + unit.lessons.length,
    0
  );
  const totalQuestions = course.units.reduce(
    (total, unit) => total + unit.questions.length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-1 p-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {course.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.level === "beginner"
                    ? "bg-success-100 text-success-800"
                    : course.level === "intermediate"
                    ? "bg-warning-100 text-warning-800"
                    : "bg-error-100 text-error-800"
                }`}
              >
                {course.level}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            <p className="text-gray-600 text-lg mb-6">{course.description}</p>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span>{course.averageRating?.toFixed(1) || "0.0"} rating</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-1" />
                <span>{course.totalStudents} students</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-1" />
                <span>{course.duration} total hours</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-gray-400 mr-1" />
                <span>{totalLessons} lessons</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isEnrolled ? (
                <Link
                  to={`/exam/${course._id}/${course.units[0]?._id}`}
                  className="btn btn-primary"
                >
                  Start Learning
                </Link>
              ) : (
                <button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isLoading}
                  className="btn btn-primary"
                >
                  {enrollMutation.isLoading ? "Enrolling..." : "Enroll Now"}
                </button>
              )}

              <button
                onClick={() =>
                  Navigate(`/dashboard/demo-questions/${courseId}`)
                }
                className="btn btn-outline"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Demo Questions
              </button>
            </div>
          </div>

          <div className="md:w-96 p-8 bg-gray-50 border-l border-gray-200">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${course.price.monthly}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Yearly</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${course.price.yearly}
                </span>
                <span className="text-sm text-success-600 bg-success-100 px-2 py-1 rounded">
                  Save $
                  {(course.price.monthly * 12 - course.price.yearly).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-gray-900">
                This course includes:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  {totalLessons} on-demand lessons
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  {totalQuestions} practice questions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Full lifetime access
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Curriculum */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Course Content
            </h2>
            <div className="space-y-4">
              {course.units.map((unit, unitIndex) => (
                <div
                  key={unit._id}
                  className="border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => setActiveUnit(unitIndex)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Unit {unitIndex + 1}: {unit.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {unit.lessons.length} lessons • {unit.duration} minutes
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {activeUnit === unitIndex ? "▲" : "▼"}
                    </div>
                  </button>

                  {activeUnit === unitIndex && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-2">
                        {unit.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson._id}
                            className={`flex items-center p-3 rounded-lg ${
                              isEnrolled || lesson.isFree
                                ? "bg-white hover:bg-gray-50 cursor-pointer"
                                : "bg-gray-100"
                            }`}
                            onClick={() => {
                              if (isEnrolled || lesson.isFree) {
                                setActiveLesson(lessonIndex);
                              }
                            }}
                          >
                            <PlayCircle
                              className={`h-5 w-5 mr-3 ${
                                isEnrolled || lesson.isFree
                                  ? "text-primary-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <div className="flex-1">
                              <h4
                                className={`text-sm font-medium ${
                                  isEnrolled || lesson.isFree
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {lesson.duration} min
                              </p>
                            </div>
                            {!isEnrolled && !lesson.isFree && (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Unit Exam */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Unit Exam
                            </h4>
                            <p className="text-sm text-gray-500">
                              {unit.questions.length} questions
                            </p>
                          </div>
                          <Link
                            to={
                              isEnrolled
                                ? `/exam/${course._id}/${unit._id}`
                                : `/exam/${course._id}/demo`
                            }
                            className="btn btn-primary text-sm"
                          >
                            {isEnrolled ? "Take Exam" : "Try Demo"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {course.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Instructor
            </h2>
            <div className="flex items-center space-x-3">
              <img
                src={
                  course.instructor?.profile?.avatar || "/default-avatar.png"
                }
                alt={course.instructor?.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-medium text-gray-900">
                  {course.instructor?.profile?.firstName}{" "}
                  {course.instructor?.profile?.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  @{course.instructor?.username}
                </p>
              </div>
            </div>
          </div>

          {/* Progress (if enrolled) */}
          {isEnrolled && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Course Completion</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-success-50 rounded-lg">
                    <div className="text-lg font-bold text-success-600">3</div>
                    <div className="text-xs text-success-700">Exams Passed</div>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <div className="text-lg font-bold text-primary-600">12</div>
                    <div className="text-xs text-primary-700">
                      Lessons Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
