import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Area,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";
import { Card } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "../auth/auth";
import "../style/AdminDashboard.css"; // Ensure this file includes the new CSS for masonry layout
import {
  FaComments,
  FaStar,
  FaEnvelope,
  FaQuestion,
  FaUsers,
  FaClipboardList,
  FaTags,
  FaBook,
  FaUserCheck,
  FaRupeeSign,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

const fetchWithAuth = async (url) => {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };
  const res = await axios.get(url, { headers });
  return res.data;
};

const groupByMonth = (items, dateKey = "createdAt") => {
  const counts = {};
  items.forEach((item) => {
    const date = new Date(item[dateKey]);
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    counts[month] = (counts[month] || 0) + 1;
  });
  return Object.entries(counts).map(([month, count]) => ({ month, count }));
};

const fetchAdminOverviewData = async () => {
  try {
    const [
      discussionsRes,
      feedbacksRes,
      messagesRes,
      questionsRes,
      usersRes,
      plansRes,
      customerRes,
      revenueRes,
    ] = await Promise.all([
      fetchWithAuth(`${API_URL}/api/discussions/getdiscussions`),
      fetchWithAuth(`${API_URL}/api/feedbacks/getfeedbacks`),
      fetchWithAuth(`${API_URL}/api/discussions/getmessages`),
      fetchWithAuth(`${API_URL}/api/questions/getquestions`),
      fetchWithAuth(`${API_URL}/api/users/getusers`),
      fetchWithAuth(`${API_URL}/api/payment/plans`),
      fetchWithAuth(`${API_URL}/api/payment/all-customers`),
      fetchWithAuth(`${API_URL}/api/payment/total-revenue`),
    ]);

    const categoryList = questionsRes || [];
    const lessonList = categoryList.flatMap((cat) => cat.lessons || []);
    const allQuestions = lessonList.flatMap((lesson) => lesson.questions || []);

    const paidUsers = customerRes.count || 0; // Updated paid users logic
    const unpaidUsers = usersRes.length - paidUsers;

    // ✅ FIXED: Get revenue directly
    const revenue = revenueRes?.totalRevenue || 0;

    return {
      chartData: {
        discussions: groupByMonth(discussionsRes?.discussions || []),
        feedbacks: groupByMonth(feedbacksRes?.feedbacks || []),
        messages: groupByMonth(messagesRes?.messages || []),
        questions: groupByMonth(allQuestions),
        users: groupByMonth(usersRes || []),
      },
      counts: {
        discussions: discussionsRes?.discussions?.length || 0,
        feedbacks: feedbacksRes?.feedbacks?.length || 0,
        messages: messagesRes?.messages?.length || 0,
        questions: allQuestions.length,
        users: usersRes.length || 0,
        plans: plansRes.length || 0,
        categories: categoryList.length,
        lessons: lessonList.length,
        customers: customerRes.length || 0,
      },
      paidUsers,
      unpaidUsers,
      revenue,
    };
  } catch (err) {
    console.error("AdminOverview fetch error:", err);
    return {
      chartData: {},
      counts: {},
      paidUsers: 0,
      unpaidUsers: 0,
      revenue: 0,
    };
  }
};

const AdminOverview = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminOverview"],
    queryFn: fetchAdminOverviewData,
    staleTime: 0,
    refetchInterval: 5000,
    keepPreviousData: true,
  });

  if (isLoading) {
    return <p className="text-center mt-5">Loading Admin Overview...</p>;
  }

  if (isError) {
    return <p className="text-center mt-5 text-danger">Error loading data</p>;
  }

  const cardItems = [
    {
      title: "Discussions",
      count: data.counts.discussions,
      icon: <FaComments />,
    },
    { title: "Feedbacks", count: data.counts.feedbacks, icon: <FaStar /> },
    { title: "Messages", count: data.counts.messages, icon: <FaEnvelope /> },
    { title: "Questions", count: data.counts.questions, icon: <FaQuestion /> },
    { title: "Users", count: data.counts.users, icon: <FaUsers /> },
    { title: "Plans", count: data.counts.plans, icon: <FaClipboardList /> },
    {
      title: "Question Categories",
      count: data.counts.categories,
      icon: <FaTags />,
    },
    { title: "Question Lessons", count: data.counts.lessons, icon: <FaBook /> },
    {
      title: "Paid / Unpaid Users",
      count: `${data.paidUsers} / ${data.unpaidUsers}`,
      icon: <FaUserCheck />,
    },
    {
      title: "Total Revenue",
      count: `₹${data.revenue} `,
      icon: <FaRupeeSign />,
    },
  ];

  return (
    <div className="container py-4">
      <h1 className="mb-4 fw-bold text-center text-light mb-5">
        Admin Overview
      </h1>

      <div className="masonry-grid">
        {shuffleArray([
          // Count Cards
          ...cardItems.map((item, index) => (
            <div className="masonry-card" key={`count-${index}`}>
              <Card className="shadow-sm rounded-4 p-3 text-center border-0">
                <div className="d-flex justify-content-center align-items-center mb-2 fs-3 text-primary">
                  {item.icon}
                </div>
                <h6 className="text-muted">{item.title}</h6>
                <h4 className="fw-bold text-dark">
                  {item.count !== undefined ? item.count : "N/A"}
                </h4>
              </Card>
            </div>
          )),

          // Paid vs Unpaid Users (Column Chart)
          <div className="masonry-card" key="paid-vs-unpaid">
            <Card className="shadow rounded-4 p-3">
              <h6 className="text-center mb-3">
                Paid vs Unpaid Users (Column)
              </h6>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: "Paid", count: data.paidUsers },
                    { name: "Unpaid", count: data.unpaidUsers },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    <Cell fill="#198754" />
                    <Cell fill="#dc3545" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>,
          // Questions per Month (Line Chart)
          <div className="masonry-card" key="questions-chart">
            <Card className="shadow rounded-4 p-3">
              <h6 className="text-center mb-3">Questions per Month (Line)</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.chartData.questions}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#28a745"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>,

          // Discussions per Month (Pie Chart)
          <div className="masonry-card" key="discussions-pie-chart">
            <Card className="shadow rounded-4 p-3">
              <h6 className="text-center mb-3">Discussions per Month (Pie)</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.chartData.discussions}
                    dataKey="count"
                    nameKey="month"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {data.chartData.discussions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#0d6efd",
                            "#6610f2",
                            "#6f42c1",
                            "#d63384",
                            "#dc3545",
                            "#fd7e14",
                            "#ffc107",
                            "#198754",
                            "#20c997",
                            "#0dcaf0",
                            "#6c757d",
                            "#343a40",
                          ][index % 12]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>,
          // User Registrations (Area Chart)
          <div className="masonry-card" key="user-registrations-area">
            <Card className="shadow rounded-4 p-3">
              <h6 className="text-center mb-3">User Registrations (Area)</h6>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.chartData.users}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#28a745"
                    fill="#28a745"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>,
          // Messages per Month (Column Chart)
          <div className="masonry-card" key="messages-chart">
            <Card className="shadow rounded-4 p-3">
              <h6 className="text-center mb-3">Messages per Month (Column)</h6>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chartData.messages}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc107" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>,

          // Feedbacks per Month (Donut Chart)
          <div className="masonry-card" key="feedbacks-donut-chart">
            <Card className="shadow rounded-4 p-3">
              <h6 className="text-center mb-3">Feedbacks per Month (Donut)</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.chartData.feedbacks}
                    dataKey="count"
                    nameKey="month"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {data.chartData.feedbacks.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#17a2b8",
                            "#20c997",
                            "#0dcaf0",
                            "#6610f2",
                            "#6f42c1",
                            "#d63384",
                            "#fd7e14",
                            "#ffc107",
                            "#198754",
                            "#0d6efd",
                            "#dc3545",
                            "#6c757d",
                          ][index % 12]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>,
        ])}
      </div>
    </div>
  );
};

export default AdminOverview;
