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

// Track refresh token attempts to prevent loops
let isRefreshing = false;
let refreshSubscribers = [];

// Function to add subscribers
const addSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to execute all subscribers
const executeSubscribers = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Request counter for rate limiting
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 30; // Reduced from 60

// Request interceptor - simplified
api.interceptors.request.use(
  (config) => {
    requestCount++;

    // Simple client-side rate limiting
    if (requestCount > MAX_REQUESTS_PER_MINUTE) {
      console.warn("Rate limit approaching - slowing requests");
      return Promise.reject(new Error("Too many requests"));
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - FIXED to prevent loops
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 - Rate Limiting
    if (error.response?.status === 429) {
      const isAuthRequest = originalRequest.url.includes("/auth/");
      if (!isAuthRequest) {
        toast.error("Too many requests. Please wait a moment.");
      }
      return Promise.reject(error);
    }

    // Handle 401 - Token Refresh (FIXED)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for the new token
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest._retry = true;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        await api.post("/auth/refresh-token");

        // Execute all waiting requests
        executeSubscribers();

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        console.error("Token refresh failed:", refreshError);

        // Execute subscribers with error
        executeSubscribers();

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

// Reset request counter every minute
setInterval(() => {
  requestCount = 0;
}, 60000);

// API methods with optimized error handling
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
      headers: { "Content-Type": "multipart/form-data" },
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
};

// Other APIs remain the same...
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
