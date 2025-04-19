import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/public/Home";
import Contact from "./pages/public/Contact";
import About from "./pages/public/About";
import TermsAndConditions from "./pages/public/TermsAndConditions";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import PriceDetails from "./pages/public/PriceDetails";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import Error404 from "./pages/Error404";
import PrivateRoute from "./pages/PrivateRoute";
import ScrollToTop from "./components/ScrollTop";
import MyProfile from "./pages/student/MyProfile";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { logoutStudent } from "./features/studentSlice"; // Make sure this import path is correct
import Faq from "./pages/public/Faq";
import Feedback from "./pages/public/Feedback";
import Discussion from "./pages/public/Discussion";
import PaymentReceipt from "./pages/student/PaymentReceipt";
import PaymentSuccess from "./pages/student/PaymentSuccess";
import PaymentCancelled from "./pages/student/PaymentCancelled";
import DiscussionDetail from "./pages/public/DiscussionDetail";
import PaidQuizDetails from "./pages/student/PaidQuizDetails";
import PaidQuizLessons from "./pages/student/PaidQuizLessons";

// Auth check utility function
const checkAuth = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  return { isAuthenticated: !!token, role };
};

// AppContent: Handles routing and protected routes
function AppContent() {
  const student = useSelector((state) => state.student.student);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/legal/terms&conditions" element={<TermsAndConditions />} />
      <Route path="/legal/privacypolicy" element={<PrivacyPolicy />} />
      <Route path="/others/pricedetails" element={<PriceDetails />} />
      <Route path="/others/faq" element={<Faq />} />
      <Route path="/others/feedback" element={<Feedback />} />
      <Route path="/others/discussion" element={<Discussion />} />
      <Route path="/others/discussion/:id" element={<DiscussionDetail />} />

      {/* Admin Routes (Protected) */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute role="admin" student={student}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Student Routes (Protected) */}
      <Route
        path="/student/*"
        element={
          <PrivateRoute role="student" student={student}>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="payment-cancelled" element={<PaymentCancelled />} />
              <Route path="payment-receipt" element={<PaymentReceipt />} />
              <Route
                path="paid-quiz/:category/:lesson"
                element={<PaidQuizDetails />}
              />
              <Route path="paid-quiz/:category" element={<PaidQuizLessons />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Catch-all Error Page */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

// Main App component that handles routing and auto-logout
function App() {
  const dispatch = useDispatch();

  // Session monitoring effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkAuth().isAuthenticated) {
        dispatch(logoutStudent());
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
