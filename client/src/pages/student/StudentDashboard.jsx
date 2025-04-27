import { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import "../../style/StudentDashboard.css";
import {
  FaBars,
  FaCommentAlt,
  FaUser,
  FaQuestionCircle,
  FaRegClipboard,
  FaRegThumbsUp,
} from "react-icons/fa"; // Import icons
import PaidQuiz from "../../components/PaidQuiz";
import DemoQuestions from "../../components/DemoQuestions";
import MyDiscussion from "../../components/MyDiscussion";
import MyFeedback from "../../components/MyFeedback";
import SubscriptionDetails from "../../components/SubscriptionDetails";
import UserOverview from "../../components/UserOverview";

function StudentDashboard() {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <Navbar />
      <Header title={"Student Dashboard"} />

      <div className=" dashboard border-top">
        {/* Sidebar or Topbar */}
        <div
          className={`${
            isMobile
              ? "topbar d-flex justify-content-around align-items-center p-md-2 border-bottom"
              : `sidebar border-end text-white p-md-3 ${
                  sidebarCollapsed ? "sidebar-collapsed" : ""
                }`
          }`}
          style={{
            width: isMobile ? "100%" : sidebarCollapsed ? "80px" : "250px",
            transition: "width 0.3s",
          }}
        >
          {!isMobile && (
            <Button
              variant="link"
              onClick={toggleSidebar}
              className="toggle-sidebar-btn d-block mb-3 bg-light w-100 text-start py-1 px-2 text-decoration-none"
              style={{
                fontSize: "22px",
                color: "orangered",
              }}
            >
              <FaBars />{" "}
              <span
                className={`fw-bold fs-5 ms-3 ${
                  sidebarCollapsed ? "d-none" : "d-none d-md-inline"
                }`}
              >
                Menu
              </span>
            </Button>
          )}

          <ul
            className={`list-unstyled ${
              isMobile
                ? "d-flex flex-row w-100 justify-content-around m-0 p-0"
                : "d-flex flex-column"
            }`}
          >
            {/* Overview */}
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Overview"
                onClick={() => setSelectedSection("overview")}
              >
                <FaRegClipboard className="fs-4" />
                {!isMobile && !sidebarCollapsed && (
                  <span className="ms-2">Overview</span>
                )}
              </Button>
            </li>

            {/* Paid Quiz */}
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Paid Quiz"
                onClick={() => setSelectedSection("paidquiz")}
              >
                <FaQuestionCircle className="fs-4" />
                {!isMobile && !sidebarCollapsed && (
                  <span className="ms-2">Paid Quiz</span>
                )}
              </Button>
            </li>

            {/* Demo Questions */}
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Demo Questions"
                onClick={() => setSelectedSection("demoquestions")}
              >
                <FaRegThumbsUp className="fs-4" />
                {!isMobile && !sidebarCollapsed && (
                  <span className="ms-2">Demo Questions</span>
                )}
              </Button>
            </li>

            {/* Subscription */}
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Subscription Status"
                onClick={() => setSelectedSection("subcription")}
              >
                <FaUser className="fs-4" />
                {!isMobile && !sidebarCollapsed && (
                  <span className="ms-2">Subscription</span>
                )}
              </Button>
            </li>

            {/* Feedbacks */}
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Feedbacks"
                onClick={() => setSelectedSection("feedbacks")}
              >
                <FaRegClipboard className="fs-4" />
                {!isMobile && !sidebarCollapsed && (
                  <span className="ms-2">Feedbacks</span>
                )}
              </Button>
            </li>

            {/* Discussion */}
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Discussion"
                onClick={() => setSelectedSection("discussion")}
              >
                <FaCommentAlt className="fs-4" />
                {!isMobile && !sidebarCollapsed && (
                  <span className="ms-2">Discussion</span>
                )}
              </Button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="content py-3" style={{ flex: 1 }}>
          {selectedSection === "overview" && (
            <Container>
              <UserOverview />
            </Container>
          )}
          {selectedSection === "paidquiz" && (
            <Container>
              <PaidQuiz />
            </Container>
          )}
          {selectedSection === "demoquestions" && (
            <Container>
              <DemoQuestions />
            </Container>
          )}
          {selectedSection === "subcription" && (
            <Container>
              <SubscriptionDetails />
            </Container>
          )}
          {selectedSection === "feedbacks" && (
            <Container>
              <MyFeedback />
            </Container>
          )}
          {selectedSection === "discussion" && (
            <Container>
              <MyDiscussion />
            </Container>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default StudentDashboard;
