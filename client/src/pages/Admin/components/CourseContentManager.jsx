// pages/Admin/CourseContentManager.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  X,
  FileText,
  Video,
  Trash2,
  Image as ImageIcon,
  Save,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { coursesAPI } from "../../../services/api";
import LoadingSpinner from "../../../components/UI/LoadingSpinner";

const CourseContentManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [units, setUnits] = useState([]);
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);

  // Fetch course data with units
const {
  data: courseData,
  isLoading: courseLoading,
  isError,
  error,
} = useQuery({
  queryKey: ["course-with-content", courseId],
  queryFn: () => coursesAPI.getCourse(courseId),
  enabled: !!courseId, // only fetch when courseId exists
  retry: 1,
});


  // Mutation for updating course content only
  const updateContentMutation = useMutation({
    mutationFn: (contentData) =>
      coursesAPI.updateCourse(courseId, contentData || {}),
    onSuccess: () => {
      toast.success("Course content updated successfully!");
      queryClient.invalidateQueries(["course-with-content", courseId]);
      queryClient.invalidateQueries(["admin-courses"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Failed to update course content";
      toast.error(errorMessage);
    },
  });

  // Initialize units from course data
  useEffect(() => {
    if (courseData?.data?.course && !isInitialized) {
      const course = courseData.data.course;
      setCourseDetails(course); // Store course details for the update

      const courseUnits = course.units || [];

      if (courseUnits.length > 0) {
        const initializedUnits = courseUnits.map((unit, index) => {
          // Initialize lessons
          const initializedLessons = (unit.lessons || []).map(
            (lesson, lessonIndex) => ({
              _id: lesson._id,
              title: lesson.title || "",
              content: lesson.content || "",
              order: lesson.order || lessonIndex + 1,
              duration: lesson.duration || 0,
              videoUrl: lesson.videoUrl || "",
              resources: lesson.resources || [],
              isFree: lesson.isFree || false,
            })
          );

          // Initialize questions
          const initializedQuestions = (unit.questions || []).map(
            (question, qIndex) => {
              const questionType = question.questionType || "multiple_choice";
              let correctAnswer = question.correctAnswer;
              let options = question.options || [];

              if (questionType === "multiple_choice") {
                if (typeof correctAnswer === "string") {
                  correctAnswer = parseInt(correctAnswer);
                }
                if (
                  isNaN(correctAnswer) ||
                  correctAnswer === null ||
                  correctAnswer === undefined
                ) {
                  correctAnswer = 0;
                }
                if (!Array.isArray(options)) options = [];
                while (options.length < 4) {
                  options.push("");
                }
              } else if (questionType === "true_false") {
                if (typeof correctAnswer === "boolean") {
                  correctAnswer = correctAnswer ? "True" : "False";
                } else if (typeof correctAnswer === "string") {
                  correctAnswer = correctAnswer.trim();
                  if (
                    correctAnswer.toLowerCase() === "true" ||
                    correctAnswer === "1"
                  ) {
                    correctAnswer = "True";
                  } else if (
                    correctAnswer.toLowerCase() === "false" ||
                    correctAnswer === "0"
                  ) {
                    correctAnswer = "False";
                  }
                } else {
                  correctAnswer = "True";
                }
                options = [];
              } else if (questionType === "short_answer") {
                if (typeof correctAnswer !== "string") {
                  correctAnswer = String(correctAnswer || "");
                }
                options = [];
              }

              return {
                _id: question._id,
                question: question.question || "",
                questionType: questionType,
                options: options,
                correctAnswer: correctAnswer,
                explanation: question.explanation || "",
                marks: question.marks || 1,
                difficulty: question.difficulty || "medium",
                timeLimit: question.timeLimit || 60,
                image: question.image || "",
              };
            }
          );

          return {
            _id: unit._id,
            title: unit.title || "",
            description: unit.description || "",
            order: unit.order || index + 1,
            duration: unit.duration || 0,
            lessons: initializedLessons,
            questions: initializedQuestions,
          };
        });

        setUnits(initializedUnits);
      } else {
        // Start with one empty unit if no units exist
        setUnits([
          {
            title: "",
            description: "",
            order: 1,
            duration: 0,
            lessons: [],
            questions: [],
          },
        ]);
      }

      setIsInitialized(true);
    }
  }, [courseData, isInitialized]);

  // Units Management
  const addUnit = () => {
    const newUnit = {
      title: "",
      description: "",
      order: units.length + 1,
      duration: 0,
      lessons: [],
      questions: [],
    };
    setUnits([...units, newUnit]);
    setActiveUnitIndex(units.length);
  };

  const removeUnit = (index) => {
    if (units.length > 1) {
      const newUnits = units.filter((_, i) => i !== index);
      const updatedUnits = newUnits.map((unit, i) => ({
        ...unit,
        order: i + 1,
      }));
      setUnits(updatedUnits);
      setActiveUnitIndex(Math.min(activeUnitIndex, updatedUnits.length - 1));
    }
  };

  const updateUnit = (index, field, value) => {
    const newUnits = units.map((unit, i) =>
      i === index ? { ...unit, [field]: value } : unit
    );
    setUnits(newUnits);
  };

  // Lessons Management
  const addLesson = (unitIndex) => {
    const newLesson = {
      title: "",
      content: "",
      order: units[unitIndex].lessons.length + 1,
      duration: 0,
      videoUrl: "",
      resources: [],
      isFree: false,
    };

    const newUnits = units.map((unit, i) =>
      i === unitIndex
        ? { ...unit, lessons: [...unit.lessons, newLesson] }
        : unit
    );
    setUnits(newUnits);
  };

  const updateLesson = (unitIndex, lessonIndex, field, value) => {
    const newUnits = units.map((unit, i) =>
      i === unitIndex
        ? {
            ...unit,
            lessons: unit.lessons.map((lesson, j) =>
              j === lessonIndex ? { ...lesson, [field]: value } : lesson
            ),
          }
        : unit
    );
    setUnits(newUnits);
  };

  const removeLesson = (unitIndex, lessonIndex) => {
    const newUnits = units.map((unit, i) =>
      i === unitIndex
        ? {
            ...unit,
            lessons: unit.lessons.filter((_, j) => j !== lessonIndex),
          }
        : unit
    );
    setUnits(newUnits);
  };

  // Questions Management
  const addQuestion = (unitIndex) => {
    const newQuestion = {
      question: "",
      questionType: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      marks: 1,
      difficulty: "medium",
      timeLimit: 60,
      image: "",
    };

    const newUnits = units.map((unit, i) =>
      i === unitIndex
        ? {
            ...unit,
            questions: [...unit.questions, newQuestion],
          }
        : unit
    );
    setUnits(newUnits);
  };

  const updateQuestion = (unitIndex, questionIndex, field, value) => {
    const newUnits = units.map((unit, i) => {
      if (i === unitIndex) {
        const updatedQuestions = unit.questions.map((question, j) => {
          if (j === questionIndex) {
            const updatedQuestion = { ...question, [field]: value };

            if (field === "questionType") {
              if (value === "multiple_choice") {
                updatedQuestion.options = ["", "", "", ""];
                updatedQuestion.correctAnswer = 0;
              } else if (value === "true_false") {
                updatedQuestion.options = ["True", "False"];
                updatedQuestion.correctAnswer = "True";
              } else if (value === "short_answer") {
                updatedQuestion.options = [];
                updatedQuestion.correctAnswer = "";
              }
            }

            return updatedQuestion;
          }
          return question;
        });

        return { ...unit, questions: updatedQuestions };
      }
      return unit;
    });

    setUnits(newUnits);
  };

  const updateQuestionOption = (
    unitIndex,
    questionIndex,
    optionIndex,
    value
  ) => {
    const newUnits = units.map((unit, i) =>
      i === unitIndex
        ? {
            ...unit,
            questions: unit.questions.map((question, j) => {
              if (j !== questionIndex) return question;
              const options = [...question.options];
              options[optionIndex] = value;
              return { ...question, options };
            }),
          }
        : unit
    );

    setUnits(newUnits);
  };

  const removeQuestion = (unitIndex, questionIndex) => {
    const newUnits = units.map((unit, i) =>
      i === unitIndex
        ? {
            ...unit,
            questions: unit.questions.filter((_, j) => j !== questionIndex),
          }
        : unit
    );
    setUnits(newUnits);
  };

  // Handle question image upload
  const handleQuestionImageChange = (unitIndex, questionIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updateQuestion(unitIndex, questionIndex, "image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQuestionImage = (unitIndex, questionIndex) => {
    updateQuestion(unitIndex, questionIndex, "image", "");
  };

  // Save course content - Include all required course fields
  const handleSaveContent = async () => {
    if (!courseDetails) {
      toast.error("Course details not loaded. Please try again.");
      return;
    }

    // Validate units
    const validUnits = units.every(
      (unit) => unit.title.trim() && unit.description.trim()
    );
    if (!validUnits) {
      toast.error("Please fill all unit titles and descriptions");
      return;
    }

    // Validate lessons
    const validLessons = units.every((unit) =>
      unit.lessons.every(
        (lesson) => lesson.title.trim() && lesson.content.trim()
      )
    );
    if (!validLessons) {
      toast.error("Please fill all lesson titles and content in all units");
      return;
    }

    // Prepare content data with ALL required course fields
    const contentData = {
      // Include all required course fields from courseDetails
      title: courseDetails.title,
      description: courseDetails.description,
      shortDescription: courseDetails.shortDescription || "",
      category: courseDetails.category,
      subcategory: courseDetails.subcategory || "",
      level: courseDetails.level,
      duration: courseDetails.duration || 0,
      price: courseDetails.price || { monthly: 0, yearly: 0 },
      maxStudents: courseDetails.maxStudents || 0,
      image: courseDetails.image || "",
      thumbnail: courseDetails.thumbnail || "",
      tags: courseDetails.tags || [],
      requirements: courseDetails.requirements || [],
      learningOutcomes: courseDetails.learningOutcomes || [],
      isActive:
        courseDetails.isActive !== undefined ? courseDetails.isActive : true,
      isFeatured: courseDetails.isFeatured || false,

      // Add the units data
      units: units.map((unit) => {
        const processedQuestions = unit.questions.map((question) => {
          const processedQuestion = {
            question: question.question,
            questionType: question.questionType,
            explanation: question.explanation || "",
            marks: parseInt(question.marks) || 1,
            difficulty: question.difficulty || "medium",
            timeLimit: parseInt(question.timeLimit) || 60,
            image: question.image || "",
          };

          if (question.questionType === "multiple_choice") {
            processedQuestion.options = question.options.filter(
              (opt) => opt.trim() !== ""
            );
            processedQuestion.correctAnswer =
              parseInt(question.correctAnswer) || 0;
          } else if (question.questionType === "true_false") {
            processedQuestion.options = [];
            processedQuestion.correctAnswer = question.correctAnswer === "True";
          } else if (question.questionType === "short_answer") {
            processedQuestion.options = [];
            processedQuestion.correctAnswer = String(
              question.correctAnswer || ""
            );
          }

          if (question._id) {
            processedQuestion._id = question._id;
          }

          return processedQuestion;
        });

        const unitDuration = unit.lessons.reduce(
          (sum, lesson) => sum + (parseInt(lesson.duration) || 0),
          0
        );

        return {
          title: unit.title,
          description: unit.description,
          order: parseInt(unit.order) || 1,
          duration: unitDuration,
          lessons: unit.lessons.map((lesson) => ({
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.videoUrl || "",
            duration: parseInt(lesson.duration) || 0,
            order: parseInt(lesson.order) || 0,
            resources: lesson.resources || [],
            isFree: Boolean(lesson.isFree),
            ...(lesson._id && { _id: lesson._id }),
          })),
          questions: processedQuestions,
          ...(unit._id && { _id: unit._id }),
        };
      }),
    };

    console.log("Submitting course content data:", contentData); // For debugging
    updateContentMutation.mutate(contentData);
  };

  // Safe active unit with fallback
  const activeUnit = units[activeUnitIndex] || {
    title: "",
    description: "",
    order: activeUnitIndex + 1,
    duration: 0,
    lessons: [],
    questions: [],
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading course content...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Course
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading the course content.
          </p>
          <button
            onClick={() => navigate("/dashboard/admin/courses")}
            className="btn btn-primary"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/admin/courses")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Courses
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Course Content
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add and manage units, lessons, and questions for{" "}
              {courseDetails?.title || "this course"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/dashboard/admin/edit-course/${courseId}`)}
          className="btn btn-outline"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Edit Course Details
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Course Content
            </h2>

            {/* Units Navigation */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {units.map((unit, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveUnitIndex(index)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                    activeUnitIndex === index
                      ? "bg-primary-100 border-primary-500 text-primary-700 dark:bg-primary-900 dark:border-primary-600 dark:text-primary-300"
                      : "border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-dark-500"
                  }`}
                >
                  Unit {unit.order}
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUnit(index);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={addUnit}
                className="flex items-center px-4 py-2 border border-dashed border-gray-300 dark:border-dark-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-dark-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Unit
              </button>
            </div>

            {/* Active Unit Content */}
            {activeUnit && (
              <div className="space-y-6">
                {/* Unit Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Title *
                    </label>
                    <input
                      type="text"
                      value={activeUnit.title}
                      onChange={(e) =>
                        updateUnit(activeUnitIndex, "title", e.target.value)
                      }
                      className="input"
                      placeholder="Enter unit title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Description *
                    </label>
                    <textarea
                      value={activeUnit.description}
                      onChange={(e) =>
                        updateUnit(
                          activeUnitIndex,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="input resize-none"
                      placeholder="Describe what this unit covers..."
                    />
                  </div>
                </div>

                {/* Lessons Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                      Lessons ({activeUnit.lessons.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => addLesson(activeUnitIndex)}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeUnit.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="border border-gray-200 dark:border-dark-600 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Lesson {lessonIndex + 1}
                          </h4>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                removeLesson(activeUnitIndex, lessonIndex)
                              }
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Lesson Title *
                            </label>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(
                                  activeUnitIndex,
                                  lessonIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="input"
                              placeholder="Enter lesson title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Duration (minutes)
                            </label>
                            <input
                              type="number"
                              value={lesson.duration}
                              onChange={(e) =>
                                updateLesson(
                                  activeUnitIndex,
                                  lessonIndex,
                                  "duration",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="0"
                              className="input"
                              placeholder="Duration in minutes"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Content *
                            </label>
                            <textarea
                              value={lesson.content}
                              onChange={(e) =>
                                updateLesson(
                                  activeUnitIndex,
                                  lessonIndex,
                                  "content",
                                  e.target.value
                                )
                              }
                              rows={3}
                              className="input resize-none"
                              placeholder="Lesson content..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Video URL (optional)
                            </label>
                            <input
                              type="url"
                              value={lesson.videoUrl || ""}
                              onChange={(e) =>
                                updateLesson(
                                  activeUnitIndex,
                                  lessonIndex,
                                  "videoUrl",
                                  e.target.value
                                )
                              }
                              className="input"
                              placeholder="https://example.com/video"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={lesson.isFree || false}
                              onChange={(e) =>
                                updateLesson(
                                  activeUnitIndex,
                                  lessonIndex,
                                  "isFree",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Free lesson (available without enrollment)
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    {activeUnit.lessons.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg">
                        <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No lessons added yet. Add your first lesson to get
                          started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Questions Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                      Questions ({activeUnit.questions.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => addQuestion(activeUnitIndex)}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeUnit.questions.map((question, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="border border-gray-200 dark:border-dark-600 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Question {questionIndex + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() =>
                              removeQuestion(activeUnitIndex, questionIndex)
                            }
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Question Image */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Question Image (Optional)
                            </label>
                            {question.image ? (
                              <div className="relative">
                                <img
                                  src={question.image}
                                  alt="Question preview"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeQuestionImage(
                                      activeUnitIndex,
                                      questionIndex
                                    )
                                  }
                                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center">
                                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Upload question image
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleQuestionImageChange(
                                      activeUnitIndex,
                                      questionIndex,
                                      e
                                    )
                                  }
                                  className="hidden"
                                  id={`question-image-${activeUnitIndex}-${questionIndex}`}
                                />
                                <label
                                  htmlFor={`question-image-${activeUnitIndex}-${questionIndex}`}
                                  className="btn btn-outline cursor-pointer"
                                >
                                  Choose Image
                                </label>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Question Text *
                            </label>
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) =>
                                updateQuestion(
                                  activeUnitIndex,
                                  questionIndex,
                                  "question",
                                  e.target.value
                                )
                              }
                              className="input"
                              placeholder="Enter your question"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Question Type
                              </label>
                              <select
                                value={question.questionType}
                                onChange={(e) =>
                                  updateQuestion(
                                    activeUnitIndex,
                                    questionIndex,
                                    "questionType",
                                    e.target.value
                                  )
                                }
                                className="input"
                              >
                                <option value="multiple_choice">
                                  Multiple Choice
                                </option>
                                <option value="true_false">True/False</option>
                                <option value="short_answer">
                                  Short Answer
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Difficulty
                              </label>
                              <select
                                value={question.difficulty}
                                onChange={(e) =>
                                  updateQuestion(
                                    activeUnitIndex,
                                    questionIndex,
                                    "difficulty",
                                    e.target.value
                                  )
                                }
                                className="input"
                              >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Marks
                              </label>
                              <input
                                type="number"
                                value={question.marks}
                                onChange={(e) =>
                                  updateQuestion(
                                    activeUnitIndex,
                                    questionIndex,
                                    "marks",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                min="1"
                                className="input"
                              />
                            </div>
                          </div>

                          {/* Options for Multiple Choice */}
                          {question.questionType === "multiple_choice" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Options *
                              </label>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center space-x-3"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${activeUnitIndex}-${questionIndex}-correct`}
                                      checked={
                                        question.correctAnswer === optionIndex
                                      }
                                      onChange={() =>
                                        updateQuestion(
                                          activeUnitIndex,
                                          questionIndex,
                                          "correctAnswer",
                                          optionIndex
                                        )
                                      }
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) =>
                                        updateQuestionOption(
                                          activeUnitIndex,
                                          questionIndex,
                                          optionIndex,
                                          e.target.value
                                        )
                                      }
                                      className="input flex-1"
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Correct Answer for True/False */}
                          {question.questionType === "true_false" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Correct Answer *
                              </label>
                              <div className="flex space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`question-${activeUnitIndex}-${questionIndex}-true-false`}
                                    checked={question.correctAnswer === "True"}
                                    onChange={() =>
                                      updateQuestion(
                                        activeUnitIndex,
                                        questionIndex,
                                        "correctAnswer",
                                        "True"
                                      )
                                    }
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    True
                                  </span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`question-${activeUnitIndex}-${questionIndex}-true-false`}
                                    checked={question.correctAnswer === "False"}
                                    onChange={() =>
                                      updateQuestion(
                                        activeUnitIndex,
                                        questionIndex,
                                        "correctAnswer",
                                        "False"
                                      )
                                    }
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    False
                                  </span>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Correct Answer for Short Answer */}
                          {question.questionType === "short_answer" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Correct Answer *
                              </label>
                              <input
                                type="text"
                                value={question.correctAnswer || ""}
                                onChange={(e) =>
                                  updateQuestion(
                                    activeUnitIndex,
                                    questionIndex,
                                    "correctAnswer",
                                    e.target.value
                                  )
                                }
                                className="input"
                                placeholder="Enter the correct answer"
                              />
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                For short answer questions, provide the expected
                                correct answer
                              </p>
                            </div>
                          )}

                          {/* Time Limit */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Time Limit (seconds)
                            </label>
                            <input
                              type="number"
                              value={question.timeLimit}
                              onChange={(e) =>
                                updateQuestion(
                                  activeUnitIndex,
                                  questionIndex,
                                  "timeLimit",
                                  parseInt(e.target.value) || 60
                                )
                              }
                              min="10"
                              className="input"
                            />
                          </div>

                          {/* Explanation */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Explanation
                            </label>
                            <textarea
                              value={question.explanation || ""}
                              onChange={(e) =>
                                updateQuestion(
                                  activeUnitIndex,
                                  questionIndex,
                                  "explanation",
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="input resize-none"
                              placeholder="Explain why this answer is correct..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {activeUnit.questions.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No questions added yet. Add assessment questions for
                          this unit.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Summary Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Course Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Units:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {units.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Lessons:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {units.reduce(
                    (total, unit) => total + unit.lessons.length,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Questions:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {units.reduce(
                    (total, unit) => total + unit.questions.length,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Estimated Duration:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(
                    (units.reduce(
                      (total, unit) =>
                        total +
                        unit.lessons.reduce(
                          (sum, lesson) => sum + (lesson.duration || 0),
                          0
                        ),
                      0
                    ) /
                      60) *
                      100
                  ) / 100}{" "}
                  hours
                </span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h2>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSaveContent}
                disabled={updateContentMutation.isLoading}
                className="btn btn-primary w-full"
              >
                {updateContentMutation.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Content
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/admin/courses")}
                className="btn btn-secondary w-full"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentManager;
