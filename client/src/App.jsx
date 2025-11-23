import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./index.css";
// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Components
import Layout from "./components/Layout/Layout";
import PublicLayout from "./components/Layout/PublicLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";
import PageLoader from "./components/UI/PageLoader";

// Public Pages (Lazy loaded)
const Home = React.lazy(() => import("./pages/Common/Home"));
const Login = React.lazy(() => import("./pages/Auth/Login"));
const Register = React.lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = React.lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/Auth/ResetPassword"));
const HelpCenter = React.lazy(() => import("./pages/Common/HelpCenter"));
const TermsAndConditions = React.lazy(() =>
  import("./pages/Common/TermsAndConditions")
);
const PrivacyPolicy = React.lazy(() => import("./pages/Common/PrivacyPolicy"));
const Pricing = React.lazy(() => import("./pages/Common/Pricing"));
const About = React.lazy(() => import("./pages/Common/About"));
const Contact = React.lazy(() => import("./pages/Common/Contact"));
const PublicCourses = React.lazy(() => import("./pages/Common/PublicCourses"));
const PublicCourseDetail = React.lazy(() =>
  import("./pages/Common/PublicCourseDetail")
);

// Protected Pages (Lazy loaded)
const Dashboard = React.lazy(() => import("./pages/Dashboard/Dashboard"));
const Courses = React.lazy(() => import("./pages/Courses/Courses"));
const CourseDetail = React.lazy(() => import("./pages/Courses/CourseDetail"));
const Exam = React.lazy(() => import("./pages/Exam/Exam"));
const ExamResult = React.lazy(() => import("./pages/Exam/ExamResult"));
const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const Discussion = React.lazy(() => import("./pages/Discussion/Discussion"));
const Activities = React.lazy(() => import("./pages/Activities/Activities"));
const AdminDashboard = React.lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminCourses = React.lazy(() => import("./pages/Admin/AdminCourses"));
const AdminUsers = React.lazy(() => import("./pages/Admin/AdminUsers"));
const AdminSettings = React.lazy(() => import("./pages/Admin/AdminSettings"));
const DemoQuestions = React.lazy(() => import("./pages/Exam/DemoQuestions"));
const AddCourse = React.lazy(() => import("./pages/Admin/AddCourse"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Component to handle authenticated home page redirection
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in, show public home page
  return <Home />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <React.Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes with HomeHeader & Footer */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomeRedirect />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route
                      path="forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="help-center" element={<HelpCenter />} />
                    <Route path="terms" element={<TermsAndConditions />} />
                    <Route path="privacy" element={<PrivacyPolicy />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="public-courses" element={<PublicCourses />} />
                    <Route
                      path="public-courses/:id"
                      element={<PublicCourseDetail />}
                    />
                  </Route>

                  {/* Protected Routes with Dashboard Layout (No Footer) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:id" element={<CourseDetail />} />
                    <Route path="exam/:courseId/:unitId" element={<Exam />} />
                    <Route
                      path="exam-result/:resultId"
                      element={<ExamResult />}
                    />
                    <Route path="profile" element={<Profile />} />
                    <Route path="discussion" element={<Discussion />} />
                    <Route path="activities" element={<Activities />} />
                    <Route
                      path="demo-questions/:courseId"
                      element={<DemoQuestions />}
                    />
                    {/* Admin Routes */}
                    <Route
                      path="admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="admin/courses"
                      element={
                        <AdminRoute>
                          <AdminCourses />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="admin/add-course"
                      element={
                        <AdminRoute>
                          <AddCourse />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="admin/edit-course/:courseId"
                      element={
                        <AdminRoute>
                          <AddCourse />
                        </AdminRoute>
                      }
                    />

                    <Route
                      path="admin/users"
                      element={
                        <AdminRoute>
                          <AdminUsers />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="admin/settings"
                      element={
                        <AdminRoute>
                          <AdminSettings />
                        </AdminRoute>
                      }
                    />
                  </Route>

                  {/* 404 Page */}
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            404
                          </h1>
                          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                            Page not found
                          </p>
                          <a href="/" className="btn btn-primary">
                            Go Home
                          </a>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </React.Suspense>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#22c55e",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
