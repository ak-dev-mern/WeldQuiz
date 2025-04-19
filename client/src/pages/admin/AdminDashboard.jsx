import { useState } from "react";
import { Container, Table, Button } from "react-bootstrap";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import "../../style/AdminDashboard.css";
import {
  FaBars,
  FaCommentAlt,
  FaUser,
  FaCreditCard,
  FaQuestionCircle,
  FaRegClipboard,
  FaRegThumbsUp,
} from "react-icons/fa"; // Import icons
import UsersList from "../../components/UserList";
import AddQuestions from "../../components/AddQuestions";
import DiscussionsTable from "../../components/DiscussionsTable";
import FeedbacksTable from "../../components/FeedbacksTable";
import MessagesTable from "../../components/MessagesTable";
import PlanDetails from "../../components/PlanDetails";
import AdminOverview from "../../components/AdminOverview";

function AdminDashboard() {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // State to control sidebar visibility

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <>
      <Navbar />
      <Header title={"Admin Dashboard"} />

      <div className="d-flex border-top dashboard">
        {/* Sidebar Navigation */}
        <div
          className={`sidebar border-end text-white p-3 ${
            sidebarCollapsed ? "sidebar-collapsed" : ""
          }`}
          style={{
            width: sidebarCollapsed ? "80px" : "250px",
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
                onClick={() => setSelectedSection("overview")}
                title="Admin Overview"
              >
                {!sidebarCollapsed && "Overview"}
                {sidebarCollapsed && <FaRegClipboard />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                onClick={() => setSelectedSection("discussions")}
                title="Discussions"
              >
                {!sidebarCollapsed && "Discussions"}
                {sidebarCollapsed && <FaCommentAlt />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                onClick={() => setSelectedSection("feedbacks")}
                title="Feedbacks"
              >
                {!sidebarCollapsed && "Feedbacks"}
                {sidebarCollapsed && <FaRegThumbsUp />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                onClick={() => setSelectedSection("messages")}
                title="Messages"
              >
                {!sidebarCollapsed && "Messages"}
                {sidebarCollapsed && <FaCommentAlt />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                onClick={() => setSelectedSection("questions")}
                title="Questions"
              >
                {!sidebarCollapsed && "Questions"}
                {sidebarCollapsed && <FaQuestionCircle />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                onClick={() => setSelectedSection("users")}
                title="User List"
              >
                {!sidebarCollapsed && "Users"}
                {sidebarCollapsed && <FaUser />}
              </Button>
            </li>
            <li>
              <Button
                variant="link text-light text-decoration-none"
                onClick={() => setSelectedSection("plans")}
                title="Plans"
              >
                {!sidebarCollapsed && "Plans"}
                {sidebarCollapsed && <FaCreditCard />}
              </Button>
            </li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="content py-3" style={{ flex: 1 }}>
          {/* Conditionally render sections based on selectedSection */}
          {selectedSection === "overview" && (
            <Container>
              <AdminOverview />
            </Container>
          )}

          {selectedSection === "discussions" && (
            <Container>
              <DiscussionsTable />
            </Container>
          )}

          {selectedSection === "feedbacks" && (
            <Container>
              <FeedbacksTable />
            </Container>
          )}

          {selectedSection === "messages" && (
            <Container>
              <MessagesTable />
            </Container>
          )}

          {selectedSection === "questions" && (
            <Container>
              <AddQuestions />
            </Container>
          )}

          {selectedSection === "users" && (
            <Container>
              <UsersList />
            </Container>
          )}

          {selectedSection === "plans" && (
            <Container>
              <PlanDetails />
            </Container>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AdminDashboard;
