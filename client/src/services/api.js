import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// api.js - Update response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's a 401 and we're already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Don't redirect if we're already on login page
        if (!window.location.pathname.includes("/login")) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting - don't show toast for auth requests during logout
    if (error.response?.status === 429) {
      const isAuthRequest = originalRequest.url.includes("/auth/");
      if (!isAuthRequest) {
        toast.error("Too many requests. Please slow down.");
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// API methods organized by feature
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  refreshToken: () => api.post("/auth/refresh-token"),
  uploadUserImage: (formData) =>
    api.post("/auth/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  removeProfileImage: () => api.delete("/auth/profile/image"),
};

export const coursesAPI = {
  getCourses: (params) => api.get("/courses", { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post("/courses", courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getDemoQuestions: (courseId) =>
    api.get(`/courses/${courseId}/demo-questions`),
  rateCourse: (courseId, ratingData) =>
    api.post(`/courses/${courseId}/rate`, ratingData),
  getCourseRatings: (courseId) => api.get(`/courses/${courseId}/ratings`),
};

export const examsAPI = {
  startExam: (courseId, unitId, isDemo = false) =>
    api.post(`/exams/${courseId}/${unitId}/start${isDemo ? "?demo=true" : ""}`),
  submitExam: (courseId, unitId, examData) =>
    api.post(`/exams/${courseId}/${unitId}/submit`, examData),
  getExamResults: (params) => api.get("/exams/results", { params }),
  getExamAnalytics: () => api.get("/exams/analytics"),
};

export const paymentsAPI = {
  createSubscription: (subscriptionData) =>
    api.post("/payments/create-subscription", subscriptionData),
  cancelSubscription: () => api.post("/payments/cancel-subscription"),
  getPaymentHistory: (params) => api.get("/payments/history", { params }),
  getSubscriptionStatus: () => api.get("/payments/subscription-status"),
};

export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  updateUserStatus: (userId, statusData) =>
    api.patch(`/admin/users/${userId}/status`, statusData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getCourses: (params) => api.get("/admin/courses", { params }),
  updateCourseStatus: (courseId, statusData) =>
    api.patch(`/admin/courses/${courseId}/status`, statusData),
  getCourseAnalytics: (params) =>
    api.get("/admin/courses/analytics", { params }),
  getPayments: (params) => api.get("/admin/payments", { params }),
  getRevenueStats: (params) => api.get("/admin/revenue/stats", { params }),
  getUserPreferences: () => api.get("/users/preferences"),
  updateUserPreferences: (data) => api.put("/users/preferences", data),
  getAchievements: () => api.get("/users/achievements"),
};

export const discussionsAPI = {
  getDiscussions: (params) => api.get("/discussions", { params }),
  createDiscussion: (discussionData) =>
    api.post("/discussions", discussionData),
  getDiscussion: (id) => api.get(`/discussions/${id}`),
  addReply: (discussionId, replyData) =>
    api.post(`/discussions/${discussionId}/replies`, replyData),
  voteDiscussion: (discussionId, voteType) =>
    api.post(`/discussions/${discussionId}/vote`, { voteType }),
};

export const feedbackAPI = {
  submitFeedback: (data) => api.post("/feedback", data),
  getMyFeedback: (params) => api.get("/feedback/my", { params }),
  getCourseFeedback: (courseId, params) =>
    api.get(`/feedback/course/${courseId}`, { params }),
  updateFeedback: (feedbackId, data) =>
    api.put(`/feedback/${feedbackId}`, data),
  deleteFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}`),
  voteFeedback: (feedbackId, data) =>
    api.post(`/feedback/${feedbackId}/vote`, data),
  addReplyToFeedback: (feedbackId, data) =>
    api.post(`/feedback/${feedbackId}/reply`, data),
};

export const activitiesAPI = {
  getActivities: (params) => api.get("/activities", { params }),
  getActivitySummary: (params) => api.get("/activities/summary", { params }),
  getCourseActivities: (courseId, params) =>
    api.get(`/activities/course/${courseId}`, { params }),
  createActivity: (data) => api.post("/activities", data),
  getLeaderboard: (params) => api.get("/activities/leaderboard", { params }),
  getUserStats: () => api.get("/activities/user-stats"),
};

export default api;
