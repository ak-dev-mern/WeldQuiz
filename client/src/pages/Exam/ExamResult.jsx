import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { examsAPI } from "../../services/api";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import {
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Award,
  TrendingUp,
  BookOpen,
} from "lucide-react";

const ExamResult = () => {
  const { resultId } = useParams();

  const { data: result, isLoading } = useQuery({
    queryKey: ["exam-result", resultId],
    queryFn: () =>
      examsAPI.getExamResults().then((response) => {
        return response.data.results.find((r) => r._id === resultId);
      }),
    enabled: !!resultId,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!result) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Result not found</h1>
        <Link to="/" className="btn btn-primary mt-4">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const analytics = result.getAnalytics
    ? result.getAnalytics()
    : {
        totalQuestions: result.answers.length,
        correctAnswers: result.answers.filter((a) => a.isCorrect).length,
        wrongAnswers: result.answers.filter((a) => !a.isCorrect).length,
        accuracy: result.percentage,
        averageTimePerQuestion: result.timeSpent / result.answers.length,
      };

  const stats = [
    {
      label: "Score",
      value: `${result.score}/${result.totalMarks}`,
      icon: Award,
      color: "blue",
    },
    {
      label: "Percentage",
      value: `${result.percentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: result.passed ? "green" : "red",
    },
    {
      label: "Time Spent",
      value: `${Math.floor(result.timeSpent / 60)}:${(result.timeSpent % 60)
        .toString()
        .padStart(2, "0")}`,
      icon: Clock,
      color: "purple",
    },
    {
      label: "Accuracy",
      value: `${analytics.accuracy.toFixed(1)}%`,
      icon: BarChart3,
      color: "orange",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Result Header */}
      <div
        className={`card p-8 text-center ${
          result.passed
            ? "bg-success-50 border-success-200"
            : "bg-error-50 border-error-200"
        }`}
      >
        <div className="flex justify-center mb-4">
          {result.passed ? (
            <CheckCircle className="h-16 w-16 text-success-500" />
          ) : (
            <XCircle className="h-16 w-16 text-error-500" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {result.passed ? "Congratulations!" : "Keep Practicing!"}
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          You {result.passed ? "passed" : "did not pass"} the exam with{" "}
          <span
            className={`font-bold ${
              result.passed ? "text-success-600" : "text-error-600"
            }`}
          >
            {result.percentage.toFixed(1)}%
          </span>
        </p>

        <div className="flex justify-center space-x-4">
          <Link to="/courses" className="btn btn-primary">
            Continue Learning
          </Link>
          <Link to={`/courses/${result.course}`} className="btn btn-secondary">
            Review Course
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${stat.color}-100 mb-3`}
            >
              <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Questions</span>
              <span className="font-medium">{analytics.totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Correct Answers</span>
              <span className="font-medium text-success-600">
                {analytics.correctAnswers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wrong Answers</span>
              <span className="font-medium text-error-600">
                {analytics.wrongAnswers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Time per Question</span>
              <span className="font-medium">
                {analytics.averageTimePerQuestion.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Difficulty Breakdown
          </h2>
          <div className="space-y-3">
            {analytics.difficultyBreakdown &&
              Object.entries(analytics.difficultyBreakdown).map(
                ([difficulty, count]) => (
                  <div
                    key={difficulty}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize text-gray-600">
                      {difficulty.replace("Questions", "")}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            difficulty.includes("easy")
                              ? "bg-success-500"
                              : difficulty.includes("medium")
                              ? "bg-warning-500"
                              : "bg-error-500"
                          }`}
                          style={{
                            width: `${
                              (count / analytics.totalQuestions) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Question Review
        </h2>
        <div className="space-y-6">
          {result.answers.map((answer, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                answer.isCorrect
                  ? "border-success-200 bg-success-50"
                  : "border-error-200 bg-error-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  Question {index + 1}
                </h3>
                <div className="flex items-center space-x-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-success-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-error-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      answer.isCorrect ? "text-success-600" : "text-error-600"
                    }`}
                  >
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
              </div>

              <p className="text-gray-900 mb-3">
                {answer.questionSnapshot.question}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">
                    Your Answer:
                  </span>
                  <p
                    className={`mt-1 ${
                      answer.isCorrect ? "text-success-600" : "text-error-600"
                    }`}
                  >
                    {Array.isArray(answer.selectedAnswer)
                      ? answer.selectedAnswer.join(", ")
                      : answer.questionSnapshot.options?.[
                          answer.selectedAnswer
                        ] || answer.selectedAnswer}
                  </p>
                </div>

                {!answer.isCorrect && (
                  <div>
                    <span className="font-medium text-gray-600">
                      Correct Answer:
                    </span>
                    <p className="mt-1 text-success-600">
                      {Array.isArray(answer.questionSnapshot.correctAnswer)
                        ? answer.questionSnapshot.correctAnswer.join(", ")
                        : answer.questionSnapshot.options?.[
                            answer.questionSnapshot.correctAnswer
                          ] || answer.questionSnapshot.correctAnswer}
                    </p>
                  </div>
                )}
              </div>

              {answer.questionSnapshot.explanation && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">
                    Explanation:
                  </span>
                  <p className="mt-1 text-gray-700">
                    {answer.questionSnapshot.explanation}
                  </p>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                Time spent: {answer.timeSpent}s
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamResult;
