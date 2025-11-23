// pages/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  BookOpen,
  Calendar,
  Award,
  MapPin,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  BarChart3,
  Upload,
  Trash2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { authAPI } from "../../services/api";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const Profile = () => {
  const { user: authUser, logout, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarPreview, setAvatarPreview] = useState("/default-avatar.png");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authAPI.getProfile(),
    retry: (failureCount, error) => {
      if (error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: !!authUser && authUser.isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const userProfile = profileData?.data?.data || authUser;

  // Get current avatar - handle case where avatar might not exist
  const currentAvatar = userProfile?.profile?.avatar || null;

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfile,
    watch: watchProfile,
  } = useForm({
    mode: "onChange",
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isDirty: isPasswordDirty },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm({
    mode: "onChange",
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (userProfile) {
      resetProfile({
        firstName: userProfile?.profile?.firstName || "",
        lastName: userProfile?.profile?.lastName || "",
        bio: userProfile?.profile?.bio || "",
        phone: userProfile?.profile?.phone || "",
        location: userProfile?.profile?.location || "",
        website: userProfile?.profile?.website || "",
      });

      // Set avatar preview - handle case where avatar doesn't exist
      if (currentAvatar) {
        setAvatarPreview(`${import.meta.env.VITE_SOCKET_URL}${currentAvatar}`);
      } else {
        setAvatarPreview("/default-avatar.png");
      }
    }
  }, [userProfile, resetProfile, currentAvatar]);

  // Avatar handling
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  // Profile update mutation (TEXT DATA ONLY)
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (response) => {
      console.log("Profile update successful:", response);
      toast.success("Profile updated successfully");
      setIsEditing(false);

      // Safely update auth context
      if (response.data && typeof updateUser === "function") {
        updateUser(response.data);
      }

      // Always invalidate queries to refresh data
      queryClient.invalidateQueries(["userProfile"]);
    },
    onError: (error) => {
      console.error("Profile update mutation error:", error);

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log("Authentication error - logging out");
        toast.error("Session expired. Please log in again.");
        if (typeof logout === "function") {
          logout();
        }
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile";
        console.log("Error message:", errorMessage);
        toast.error(errorMessage);
      }
    },
  });

  // Upload profile image mutation
  const uploadImageMutation = useMutation({
    mutationFn: (formData) => authAPI.uploadUserImage(formData),
    onSuccess: (response) => {
      console.log("Image upload successful:", response);
      toast.success("Profile image uploaded successfully");
      setUploadingImage(false);

      // Safely update auth context
      if (response.data && typeof updateUser === "function") {
        updateUser(response.data);
      }

      queryClient.invalidateQueries(["userProfile"]);
    },
    onError: (error) => {
      console.error("Image upload mutation error:", error);
      setUploadingImage(false);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        if (typeof logout === "function") {
          logout();
        }
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to upload image";
        toast.error(errorMessage);
      }
    },
  });

  // Remove profile image mutation
  const removeImageMutation = useMutation({
    mutationFn: () => authAPI.removeProfileImage(),
    onSuccess: (response) => {
      console.log("Image remove successful:", response);
      toast.success("Profile image removed successfully");
      setAvatarPreview("/default-avatar.png");

      // Safely update auth context
      if (response.data && typeof updateUser === "function") {
        updateUser(response.data);
      }

      queryClient.invalidateQueries(["userProfile"]);
    },
    onError: (error) => {
      console.error("Image remove mutation error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        if (typeof logout === "function") {
          logout();
        }
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to remove image";
        toast.error(errorMessage);
      }
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      resetPassword();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    },
    onError: (error) => {
      if (error.response?.status === 401 && typeof logout === "function") {
        logout();
      } else {
        toast.error(
          error.response?.data?.message || "Failed to change password"
        );
      }
    },
  });

  // Handle image upload separately
  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, GIF)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await uploadImageMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload the image automatically when selected
      handleImageUpload(file);
    }
  };

  const removeAvatar = () => {
    removeImageMutation.mutate();
  };

  // Handle profile form submit (TEXT DATA ONLY)
  const onProfileSubmit = (data) => {
    if (!isProfileDirty) {
      toast("No changes to save", { icon: "ℹ️" });
      return;
    }
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    resetProfile({
      firstName: userProfile?.profile?.firstName || "",
      lastName: userProfile?.profile?.lastName || "",
      bio: userProfile?.profile?.bio || "",
      phone: userProfile?.profile?.phone || "",
      location: userProfile?.profile?.location || "",
      website: userProfile?.profile?.website || "",
    });

    // Reset avatar preview
    if (currentAvatar) {
      setAvatarPreview(`${import.meta.env.VITE_SOCKET_URL}${currentAvatar}`);
    } else {
      setAvatarPreview("/default-avatar.png");
    }

    setIsEditing(false);
  };

  // Calculate user stats
  const userStats = {
    totalCourses: userProfile?.coursesEnrolled?.length || 0,
    completedCourses: userProfile?.coursesCompleted || 0,
    inProgressCourses: Math.max(
      0,
      (userProfile?.coursesEnrolled?.length || 0) -
        (userProfile?.coursesCompleted || 0)
    ),
    totalProgress:
      userProfile?.coursesEnrolled?.reduce(
        (acc, course) => acc + (course.progress || 0),
        0
      ) || 0,
    averageProgress: userProfile?.coursesEnrolled?.length
      ? Math.round(
          userProfile.coursesEnrolled.reduce(
            (acc, course) => acc + (course.progress || 0),
            0
          ) / userProfile.coursesEnrolled.length
        )
      : 0,
    memberSince: userProfile?.createdAt
      ? new Date(userProfile.createdAt).getFullYear()
      : new Date().getFullYear(),
  };

  // Show loading only if we have an authenticated user but data is loading
  if (authUser && profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // If no authenticated user, show message
  if (!authUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Please log in to view your profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          You need to be logged in to access your profile page and manage your
          account settings.
        </p>
        <a href="/login" className="btn btn-primary">
          Go to Login
        </a>
      </div>
    );
  }

  // If there's an error (other than 401), show error message
  if (profileError && profileError.response?.status !== 401) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load profile data
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {profileError.response?.data?.message ||
            "An unexpected error occurred"}
        </p>
        <div className="space-x-3">
          <button onClick={() => refetchProfile()} className="btn btn-primary">
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information, security settings, and track your
            learning progress
          </p>
        </div>
        {!isEditing && activeTab === "profile" && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary shrink-0"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Navigation */}
          <div className="card p-4 space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "profile"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 border border-primary-200 dark:border-primary-800"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
              }`}
            >
              <User className="h-4 w-4 mr-3" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "security"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 border border-primary-200 dark:border-primary-800"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
              }`}
            >
              <Shield className="h-4 w-4 mr-3" />
              Security & Password
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "courses"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 border border-primary-200 dark:border-primary-800"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
              }`}
            >
              <BookOpen className="h-4 w-4 mr-3" />
              My Courses
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "achievements"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 border border-primary-200 dark:border-primary-800"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
              }`}
            >
              <Award className="h-4 w-4 mr-3" />
              Achievements
            </button>
          </div>

          {/* Quick Stats */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Learning Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Courses
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userStats.totalCourses}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Completed
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userStats.completedCourses}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-500" />
                  In Progress
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userStats.inProgressCourses}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg. Progress
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userStats.averageProgress}%
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-dark-600">
                <span className="text-gray-600 dark:text-gray-400">
                  Member Since
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userStats.memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6 mb-8">
                <div className="relative group">
                  <img
                    src={avatarPreview}
                    alt={userProfile?.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-dark-700 shadow-lg"
                  />
                  {isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      {avatarPreview &&
                        avatarPreview !== "/default-avatar.png" && (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                            disabled={removeImageMutation.isLoading}
                          >
                            {removeImageMutation.isLoading ? (
                              <LoadingSpinner size="xs" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        )}
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile?.profile?.firstName}{" "}
                    {userProfile?.profile?.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    @{userProfile?.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    Member since{" "}
                    {userProfile?.createdAt
                      ? new Date(userProfile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                  {userProfile?.profile?.bio && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
                      {userProfile.profile.bio}
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      {...registerProfile("firstName", {
                        required: "First name is required",
                        minLength: {
                          value: 2,
                          message: "First name must be at least 2 characters",
                        },
                      })}
                      type="text"
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-gray-400"
                    />
                    {profileErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {profileErrors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...registerProfile("lastName", {
                        required: "Last name is required",
                        minLength: {
                          value: 2,
                          message: "Last name must be at least 2 characters",
                        },
                      })}
                      type="text"
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-gray-400"
                    />
                    {profileErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {profileErrors.lastName.message}
                      </p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 dark:text-white">
                        {userProfile?.email}
                      </span>
                      {userProfile?.emailVerified && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Contact support to change your email address
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <input
                        {...registerProfile("phone", {
                          pattern: {
                            value: /^[+]?[\d\s-()]+$/,
                            message: "Please enter a valid phone number",
                          },
                        })}
                        type="tel"
                        disabled={!isEditing}
                        className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-gray-400 flex-1"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {profileErrors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <input
                        {...registerProfile("location")}
                        type="text"
                        disabled={!isEditing}
                        className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-gray-400 flex-1"
                        placeholder="Your city or country"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-400 mr-3" />
                      <input
                        {...registerProfile("website", {
                          pattern: {
                            value:
                              /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                            message: "Please enter a valid website URL",
                          },
                        })}
                        type="url"
                        disabled={!isEditing}
                        className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-gray-400 flex-1"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    {profileErrors.website && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {profileErrors.website.message}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...registerProfile("bio", {
                        maxLength: {
                          value: 500,
                          message: "Bio must be less than 500 characters",
                        },
                      })}
                      rows={4}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-gray-400 resize-none"
                      placeholder="Tell us a little about yourself, your interests, or your professional background..."
                    />
                    <div className="flex justify-between mt-1">
                      {profileErrors.bio && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {profileErrors.bio.message}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                        {watchProfile("bio")?.length || 0}/500 characters
                      </p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-dark-600">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-secondary order-2 sm:order-1"
                      disabled={updateProfileMutation.isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        updateProfileMutation.isLoading || !isProfileDirty
                      }
                      className="btn btn-primary order-1 sm:order-2"
                    >
                      {updateProfileMutation.isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Security Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage your password and account security
              </p>

              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit)}
                className="space-y-6 max-w-2xl"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("currentPassword", {
                        required: "Current password is required",
                      })}
                      type={showCurrentPassword ? "text" : "password"}
                      className="input pr-10"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message:
                            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                        },
                      })}
                      type={showNewPassword ? "text" : "password"}
                      className="input pr-10"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === watchPassword("newPassword") ||
                          "Passwords do not match",
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      className="input pr-10"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={
                      changePasswordMutation.isLoading || !isPasswordDirty
                    }
                    className="btn btn-primary"
                  >
                    {changePasswordMutation.isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Courses
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Track your learning progress and continue your courses
              </p>

              <div className="space-y-4">
                {userProfile?.coursesEnrolled?.map((enrollment) => (
                  <div
                    key={enrollment.course?._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <img
                      src={
                        enrollment.course?.image || "/course-placeholder.png"
                      }
                      alt={enrollment.course?.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {enrollment.course?.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Enrolled on{" "}
                        {new Date(enrollment.enrolledAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {enrollment.progress || 0}% Complete
                          </p>
                        </div>
                        <button className="btn btn-primary text-sm whitespace-nowrap">
                          {enrollment.progress === 100 ? "Review" : "Continue"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!userProfile?.coursesEnrolled ||
                  userProfile.coursesEnrolled.length === 0) && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No courses enrolled yet
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Start your learning journey by exploring our course
                      catalog and enrolling in courses that interest you.
                    </p>
                    <a href="/courses" className="btn btn-primary">
                      Browse Courses
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Achievements
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Earn achievements by completing courses and reaching learning
                milestones
              </p>

              <div className="text-center py-12">
                <Award className="mx-auto h-20 w-20 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No achievements yet
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Complete courses and reach learning milestones to unlock
                  achievements and showcase your progress.
                </p>
                <a href="/courses" className="btn btn-primary">
                  Start Learning
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
