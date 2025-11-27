import React from "react";
import { FileText, PlayCircle, Clock, CheckCircle, Edit2 } from "lucide-react";

const CourseUnitsSection = ({ course }) => {
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case "multiple_choice":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "true_false":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "short_answer":
        return <Edit2 className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-success-600 bg-success-100 dark:bg-success-900 dark:text-success-300";
      case "medium":
        return "text-warning-600 bg-warning-100 dark:bg-warning-900 dark:text-warning-300";
      case "hard":
        return "text-error-600 bg-error-100 dark:bg-error-900 dark:text-error-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (!course.units || course.units.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Course Structure ({course.units.length} Units)
      </h3>
      <div className="space-y-4">
        {course.units
          .sort((a, b) => a.order - b.order)
          .map((unit, unitIndex) => (
            <div
              key={unit._id || unitIndex}
              className="border border-gray-200 dark:border-dark-600 rounded-lg overflow-hidden"
            >
              {/* Unit Header */}
              <div className="bg-gray-50 dark:bg-dark-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Unit {unitIndex + 1}: {unit.title}
                    </h4>
                    {unit.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {unit.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <PlayCircle className="h-4 w-4" />
                      <span>{unit.lessons?.length || 0} lessons</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{unit.questions?.length || 0} questions</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{unit.duration || 0} min</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              {unit.lessons && unit.lessons.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-dark-600">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4 text-blue-500" />
                    <span>Lessons ({unit.lessons.length})</span>
                  </h5>
                  <div className="space-y-2">
                    {unit.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson, lessonIndex) => (
                        <div
                          key={lesson._id || lessonIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-medium">
                              {lessonIndex + 1}
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                                {lesson.title}
                              </h6>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {lesson.duration || 0} min
                                </span>
                                {lesson.isFree && (
                                  <span className="text-xs bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300 px-2 py-0.5 rounded-full">
                                    Free
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {lesson.videoUrl && (
                              <PlayCircle className="h-4 w-4 text-gray-400" />
                            )}
                            {lesson.resources &&
                              lesson.resources.length > 0 && (
                                <FileText className="h-4 w-4 text-gray-400" />
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Questions */}
              {unit.questions && unit.questions.length > 0 && (
                <div className="p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>Assessment Questions ({unit.questions.length})</span>
                  </h5>
                  <div className="space-y-3">
                    {unit.questions.map((question, questionIndex) => (
                      <div
                        key={question._id || questionIndex}
                        className="p-3 bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getQuestionTypeIcon(question.questionType)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Q{questionIndex + 1}: {question.question}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                question.difficulty
                              )}`}
                            >
                              {question.difficulty}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {question.marks} mark
                              {question.marks !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {/* Options for multiple choice */}
                        {question.questionType === "multiple_choice" &&
                          question.options && (
                            <div className="ml-6 space-y-1 mt-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`text-sm p-2 rounded ${
                                    option === question.correctAnswer
                                      ? "bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800"
                                      : "bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}.{" "}
                                  {option}
                                  {option === question.correctAnswer && (
                                    <CheckCircle className="h-3 w-3 text-success-500 inline ml-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                        {/* True/False options */}
                        {question.questionType === "true_false" && (
                          <div className="ml-6 space-y-1 mt-2">
                            {["True", "False"].map((option) => (
                              <div
                                key={option}
                                className={`text-sm p-2 rounded ${
                                  option === question.correctAnswer
                                    ? "bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800"
                                    : "bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {option}
                                {option === question.correctAnswer && (
                                  <CheckCircle className="h-3 w-3 text-success-500 inline ml-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short answer */}
                        {question.questionType === "short_answer" && (
                          <div className="ml-6 mt-2">
                            <div className="text-sm bg-gray-50 dark:bg-dark-700 p-2 rounded border border-gray-200 dark:border-dark-500">
                              <strong>Correct Answer:</strong>{" "}
                              {question.correctAnswer}
                            </div>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="ml-6 mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Explanation:</strong>{" "}
                              {question.explanation}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Time limit: {question.timeLimit}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CourseUnitsSection;
