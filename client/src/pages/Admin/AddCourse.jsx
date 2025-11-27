// pages/Admin/AddCourse.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  BookOpen,
  DollarSign,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  FileText,
} from "lucide-react";
import { coursesAPI } from "../../services/api";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const AddCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!courseId;

  // State declarations
  const [imagePreview, setImagePreview] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch course data if editing
  const {
    data: existingCourse,
    isLoading: courseLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesAPI.getCourse(courseId),
    enabled: isEditing,
    retry: 1,
  });

  // Define mutation for course details only
  const saveCourseMutation = useMutation({
    mutationFn: (courseData) =>
      isEditing
        ? coursesAPI.updateCourse(courseId, courseData)
        : coursesAPI.createCourse(courseData),
    onSuccess: (response) => {
      const message = `Course ${
        isEditing ? "updated" : "created"
      } successfully!`;
      toast.success(message);
      queryClient.invalidateQueries(["admin-courses"]);
      queryClient.invalidateQueries(["course", courseId]);

      // If creating new course, navigate to content manager
      if (!isEditing && response?.data?.course?._id) {
        navigate(`/dashboard/admin/course-content/${response.data.course._id}`);
      } else {
        navigate("/dashboard/admin/courses");
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        `Failed to ${isEditing ? "update" : "create"} course`;
      toast.error(errorMessage);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      category: "",
      subcategory: "",
      price: { monthly: 0, yearly: 0 },
      level: "beginner",
      duration: 0, // Add duration field with default value
      tags: "",
      requirements: [""],
      learningOutcomes: [""],
      isActive: true,
      isFeatured: false,
      maxStudents: 0,
    },
  });

  // Initialize course data
  useEffect(() => {
    if (isEditing && existingCourse?.data?.course && !isInitialized) {
      const course = existingCourse.data.course;

      // Reset form with course data
      const formData = {
        title: course.title || "",
        description: course.description || "",
        shortDescription: course.shortDescription || "",
        category: course.category || "",
        subcategory: course.subcategory || "",
        price: {
          monthly: course.price?.monthly || 0,
          yearly: course.price?.yearly || 0,
        },
        level: course.level || "beginner",
        duration: course.duration || 0, // Include duration
        tags: Array.isArray(course.tags)
          ? course.tags.join(", ")
          : course.tags || "",
        requirements:
          course.requirements?.length > 0 ? course.requirements : [""],
        learningOutcomes:
          course.learningOutcomes?.length > 0 ? course.learningOutcomes : [""],
        isActive: course.isActive !== undefined ? course.isActive : true,
        isFeatured: course.isFeatured || false,
        maxStudents: course.maxStudents || 0,
      };

      reset(formData);

      // Set image preview
      if (course.image || course.thumbnail) {
        setImagePreview(course.image || course.thumbnail);
      }

      setIsInitialized(true);
    } else if (!isEditing && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isEditing, existingCourse, reset, isInitialized]);

  // Handle image upload
  const handleImageChange = (event) => {
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
        setImagePreview(reader.result);
        setValue("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image", "");
  };

  // Dynamic arrays for requirements and outcomes
  const requirements = watch("requirements") || [""];
  const learningOutcomes = watch("learningOutcomes") || [""];

  const addRequirement = () => {
    setValue("requirements", [...requirements, ""]);
  };

  const updateRequirement = (index, value) => {
    const newRequirements = requirements.map((req, i) =>
      i === index ? value : req
    );
    setValue("requirements", newRequirements);
  };

  const removeRequirement = (index) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setValue("requirements", newRequirements);
  };

  const addLearningOutcome = () => {
    setValue("learningOutcomes", [...learningOutcomes, ""]);
  };

  const updateLearningOutcome = (index, value) => {
    const newOutcomes = learningOutcomes.map((outcome, i) =>
      i === index ? value : outcome
    );
    setValue("learningOutcomes", newOutcomes);
  };

  const removeLearningOutcome = (index) => {
    const newOutcomes = learningOutcomes.filter((_, i) => i !== index);
    setValue("learningOutcomes", newOutcomes);
  };

  // Form submission - Course details only
  const onSubmit = async (data) => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    // Prepare course data (details only, no units/lessons/questions)
    const courseData = {
      title: data.title.trim(),
      description: data.description.trim(),
      shortDescription: data.shortDescription?.trim() || "",
      category: data.category,
      subcategory: data.subcategory?.trim() || "",
      level: data.level,
      duration: parseFloat(data.duration) || 0, // Include duration field
      price: {
        monthly: parseFloat(data.price.monthly) || 0,
        yearly: parseFloat(data.price.yearly) || 0,
      },
      maxStudents: parseInt(data.maxStudents) || 0,
      image: data.image || "",
      thumbnail: data.image || "",
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      requirements: data.requirements.filter((req) => req.trim()),
      learningOutcomes: data.learningOutcomes.filter((outcome) =>
        outcome.trim()
      ),
      isActive: Boolean(data.isActive),
      isFeatured: Boolean(data.isFeatured),
      // No units array - we'll manage that separately
    };

    console.log("Submitting course data:", courseData); // For debugging
    saveCourseMutation.mutate(courseData);
  };

  // Navigate to content manager
  const handleManageContent = () => {
    if (isEditing) {
      navigate(`/dashboard/admin/course-content/${courseId}`);
    } else {
      toast.error("Please save the course first before managing content");
    }
  };

  // Show loading only when actually fetching data for editing
  if (isEditing && courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading course data...</span>
      </div>
    );
  }

  // Show error state if course fetch failed
  if (isEditing && isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Course
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading the course data.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Error: {error?.message}
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
              {isEditing ? "Edit Course Details" : "Create New Course"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditing
                ? "Update course basic information and settings"
                : "Create a new course with basic information. You can add content later."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Basic Information Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Title *
                    </label>
                    <input
                      {...register("title", {
                        required: "Course title is required",
                        minLength: {
                          value: 5,
                          message: "Title must be at least 5 characters",
                        },
                        maxLength: {
                          value: 100,
                          message: "Title must be less than 100 characters",
                        },
                      })}
                      type="text"
                      className="input"
                      placeholder="Enter course title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Short Description (Max 200 characters)
                    </label>
                    <textarea
                      {...register("shortDescription", {
                        maxLength: {
                          value: 200,
                          message:
                            "Short description must be less than 200 characters",
                        },
                      })}
                      rows={2}
                      className="input resize-none"
                      placeholder="Brief description of the course..."
                    />
                    {errors.shortDescription && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.shortDescription.message}
                      </p>
                    )}
                  </div>

                  {/* Full Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Description *
                    </label>
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                        maxLength: {
                          value: 1000,
                          message:
                            "Description must be less than 1000 characters",
                        },
                      })}
                      rows={4}
                      className="input resize-none"
                      placeholder="Detailed description of what students will learn..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Category & Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      {...register("category", {
                        required: "Category is required",
                      })}
                      className="input"
                    >
                      <option value="">Select Category</option>
                      <option value="welding">Welding</option>
                      <option value="safety">Safety</option>
                      <option value="techniques">Techniques</option>
                      <option value="certification">Certification</option>
                      <option value="equipment">Equipment</option>
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subcategory
                    </label>
                    <input
                      {...register("subcategory")}
                      type="text"
                      className="input"
                      placeholder="Optional subcategory"
                    />
                  </div>

                  {/* Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level *
                    </label>
                    <select
                      {...register("level", {
                        required: "Level is required",
                        validate: (value) =>
                          ["beginner", "intermediate", "advanced"].includes(
                            value
                          ) ||
                          "Level must be beginner, intermediate, or advanced",
                      })}
                      className="input"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    {errors.level && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.level.message}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (hours) *
                    </label>
                    <input
                      {...register("duration", {
                        required: "Duration is required",
                        min: {
                          value: 0,
                          message: "Duration must be 0 or a positive number",
                        },
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      className="input"
                      placeholder="Course duration in hours"
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      {...register("tags")}
                      type="text"
                      className="input"
                      placeholder="welding, safety, techniques"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Price ($) *
                  </label>
                  <input
                    {...register("price.monthly", {
                      required: "Monthly price is required",
                      min: { value: 0, message: "Price cannot be negative" },
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    placeholder="0.00"
                  />
                  {errors.price?.monthly && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.price.monthly.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yearly Price ($) *
                  </label>
                  <input
                    {...register("price.yearly", {
                      required: "Yearly price is required",
                      min: { value: 0, message: "Price cannot be negative" },
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    placeholder="0.00"
                  />
                  {errors.price?.yearly && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.price.yearly.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Image Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Image
              </h2>

              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Course preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload course image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="course-image"
                    />
                    <label
                      htmlFor="course-image"
                      className="btn btn-outline cursor-pointer"
                    >
                      Choose Image
                    </label>
                  </div>
                )}
                {errors.image && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.image.message}
                  </p>
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="card p-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                {showAdvanced ? (
                  <EyeOff className="h-5 w-5 mr-2" />
                ) : (
                  <Eye className="h-5 w-5 mr-2" />
                )}
                Advanced Settings
              </button>

              {showAdvanced && (
                <div className="space-y-6">
                  {/* Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Requirements
                    </label>
                    <div className="space-y-2">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={requirement}
                            onChange={(e) =>
                              updateRequirement(index, e.target.value)
                            }
                            className="input flex-1"
                            placeholder={`Requirement ${index + 1}`}
                          />
                          {requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              className="btn btn-secondary"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRequirement}
                        className="btn btn-outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Requirement
                      </button>
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Learning Outcomes
                    </label>
                    <div className="space-y-2">
                      {learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={outcome}
                            onChange={(e) =>
                              updateLearningOutcome(index, e.target.value)
                            }
                            className="input flex-1"
                            placeholder={`Outcome ${index + 1}`}
                          />
                          {learningOutcomes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLearningOutcome(index)}
                              className="btn btn-secondary"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addLearningOutcome}
                        className="btn btn-outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Learning Outcome
                      </button>
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maximum Students (0 for unlimited)
                      </label>
                      <input
                        {...register("maxStudents", {
                          min: { value: 0, message: "Cannot be negative" },
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        className="input"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          {...register("isFeatured")}
                          type="checkbox"
                          id="isFeatured"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="isFeatured"
                          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          Featured Course
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...register("isActive")}
                          type="checkbox"
                          id="isActive"
                          defaultChecked
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="isActive"
                          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          Active Course
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h2>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saveCourseMutation.isLoading}
                  className="btn btn-primary w-full"
                >
                  {saveCourseMutation.isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      {isEditing ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isEditing ? "Update Course" : "Create Course"}
                    </>
                  )}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleManageContent}
                    className="btn btn-outline w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Content
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/admin/courses")}
                  className="btn btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Information
              </h2>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {isEditing
                    ? "Update course details here. Use the 'Manage Content' button to add units, lessons, and questions."
                    : "Create the course first. You can add units, lessons, and questions later from the course edit page."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
