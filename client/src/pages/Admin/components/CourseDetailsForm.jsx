import React from "react";
import { BookOpen, Check, DollarSign, Eye, EyeOff, Plus, Save, Upload, X } from "lucide-react";
import LoadingSpinner from "../../../components/UI/LoadingSpinner";

const CourseDetailsForm = ({
  register,
  errors,
  watch,
  setValue,
  showAdvanced,
  setShowAdvanced,
  imagePreview,
  handleImageChange,
  removeImage,
  onSave,
  isEditing,
  saveCourseMutation,
}) => {
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

  return (
    <>
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
                    message: "Description must be less than 1000 characters",
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
              <Check className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
                      onChange={(e) => updateRequirement(index, e.target.value)}
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

      {/* Save Details Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saveCourseMutation.isLoading}
          className="btn btn-primary"
        >
          {saveCourseMutation.isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Details" : "Save Details"}
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default CourseDetailsForm;
