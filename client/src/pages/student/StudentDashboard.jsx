import { useState } from "react";
import { Container, Table, Button } from "react-bootstrap";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import "../../style/StudentDashboard.css";
import {
  FaBars,
  FaCommentAlt,
  FaUser,
  FaCreditCard,
  FaQuestionCircle,
  FaRegClipboard,
  FaRegThumbsUp,
} from "react-icons/fa"; // Import icons
import PaidQuiz from "../../components/PaidQuiz";
import DemoQuestions from "../../components/Demoquestions";
import MyDiscussion from "../../components/MyDiscussion";
import MyFeedback from "../../components/MyFeedback";
import SubscriptionDetails from "../../components/SubscriptionDetails";

function StudentDashboard() {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // State to control sidebar visibility

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <>
      <Navbar />
      <Header title={"Student Dashboard"} />

      <div className="d-flex border-top dashboard">
        {/* Sidebar Navigation */}
        <div
          className={`sidebar border-end text-white p-3 ${
            sidebarCollapsed ? "sidebar-collapsed" : ""
          }`}
          style={{
            width: sidebarCollapsed ? "80px" : "200px",
            transition: "width 0.3s",
          }}
        >
          <Button
            variant="link"
            onClick={toggleSidebar}
            className=" toggle-sidebar-btn d-block mb-3 bg-light w-100 text-start py-1 px-2 text-decoration-none"
            style={{
              fontSize: "22px",
              color: "orangered",
            }}
          >
            <FaBars />{" "}
            {!sidebarCollapsed ? (
              <span className="fw-bold fs-5 ms-3">Menu</span>
            ) : (
              ""
            )}
          </Button>
          <ul className="list-unstyled">
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Overview"
                onClick={() => setSelectedSection("overview")}
              >
                {!sidebarCollapsed && "Overview"}
                {sidebarCollapsed && <FaRegClipboard />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Paid Quiz"
                onClick={() => setSelectedSection("paidquiz")}
              >
                {!sidebarCollapsed && "Paid Quiz"}
                {sidebarCollapsed && <FaQuestionCircle />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Demo Questions"
                onClick={() => setSelectedSection("demoquestions")}
              >
                {!sidebarCollapsed && "Start Demo"}
                {sidebarCollapsed && <FaRegThumbsUp />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="Subcription Status"
                onClick={() => setSelectedSection("subcription")}
              >
                {!sidebarCollapsed && "Subcription Status"}
                {sidebarCollapsed && <FaUser />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="My Feedbacks"
                onClick={() => setSelectedSection("feedbacks")}
              >
                {!sidebarCollapsed && "My Feedbacks"}
                {sidebarCollapsed && <FaRegClipboard />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                title="My Discussion"
                onClick={() => setSelectedSection("discussion")}
              >
                {!sidebarCollapsed && "My Discussion"}
                {sidebarCollapsed && <FaCommentAlt />}
              </Button>
            </li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="content py-3" style={{ flex: 1 }}>
          {/* Conditionally render sections based on selectedSection */}
          {selectedSection === "overview" && (
            <Container>
              <h4>Overview of Activity</h4>
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
    </>
  );
}

export default StudentDashboard;
