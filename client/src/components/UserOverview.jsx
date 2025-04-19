import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { Card } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "../auth/auth";
import { FaComments, FaStar, FaEnvelope, FaToggleOn } from "react-icons/fa";
import "../style/AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

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

const fetchUserOverviewData = async () => {
  try {
    const [feedbacksRes, messagesRes, discussionsRes, subscriptionRes] =
      await Promise.all([
        fetchWithAuth(`${API_URL}/api/feedbacks/myfeedbacks`),
        fetchWithAuth(`${API_URL}/api/discussions/mymessages`),
        fetchWithAuth(`${API_URL}/api/discussions/mydiscussions`),
        fetchWithAuth(`${API_URL}/api/payment/subscription-status`),
      ]);

    const subscriptions = subscriptionRes?.subscriptions || [];

    const activeSub = subscriptions.find((sub) => sub.status === "active");
    const subscriptionStatus = activeSub ? "Active" : "Inactive";
    const activePlanName = activeSub?.plan || "N/A";

    return {
      chartData: {
        feedbacks: groupByMonth(feedbacksRes?.feedbacks || []),
        messages: groupByMonth(messagesRes?.messages || []),
        discussions: groupByMonth(discussionsRes?.discussions || []),
      },
      counts: {
        feedbacks: feedbacksRes?.total || 0,
        messages: messagesRes?.messages?.length || 0,
        discussions: discussionsRes?.total || 0,
        subscriptionStatus,
        activePlanName,
      },
    };
  } catch (err) {
    console.error("UserOverview fetch error:", err);
    return {
      chartData: {},
      counts: {
        subscriptionStatus: "Unknown",
        activePlanName: "N/A",
      },
    };
  }
};

const shuffleArray = (array) => {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const UserOverview = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userOverview"],
    queryFn: fetchUserOverviewData,
  });

  if (isLoading) return <p className="text-center mt-5">Loading...</p>;
  if (isError)
    return <p className="text-center mt-5 text-danger">Error loading data</p>;

  const cardItemsMapped = [
    {
      title: "Feedbacks",
      count: data.counts.feedbacks,
      icon: <FaStar />,
    },
    {
      title: "Messages",
      count: data.counts.messages,
      icon: <FaEnvelope />,
    },
    {
      title: "Discussions",
      count: data.counts.discussions,
      icon: <FaComments />,
    },
    {
      title: "Subscription Status",
      status: data.counts.subscriptionStatus,
      icon: <FaToggleOn />,
    },

    {
      title: "Active Plan",
      status: data.counts.activePlanName,
      icon: <FaToggleOn />,
    },
  ].map((item, idx) => ({
    type: "card",
    key: `card-${idx}`,
    element: (
      <Card className="shadow-sm rounded-4 p-3 text-center border-0">
        <div className="d-flex justify-content-center align-items-center mb-2 fs-3 text-primary">
          {item.icon}
        </div>
        <h6 className="text-muted">{item.title}</h6>
        {item.status ? (
          <h4
            className="fw-bold"
            style={{
              color: item.status === "Active" ? "#4CAF50" : "#F44336",
            }}
          >
            {item.status}
          </h4>
        ) : (
          <h4 className="fw-bold text-dark">
            {item.count !== undefined ? item.count : "N/A"}
          </h4>
        )}
      </Card>
    ),
  }));

  const chartItems = [
    {
      type: "chart",
      key: "messages-chart",
      element: (
        <Card className="shadow rounded-4 p-3">
          <h6 className="text-center mb-3">Messages per Month (Bar)</h6>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.chartData.messages}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc107" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ),
    },
    {
      type: "chart",
      key: "discussions-pie-chart",
      element: (
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
      ),
    },
    {
      type: "chart",
      key: "feedbacks-donut-chart",
      element: (
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
      ),
    },
  ];

  const allItemsShuffled = shuffleArray([...cardItemsMapped, ...chartItems]);

  return (
    <div className="container py-4">
      <h1 className="mb-4 fw-bold text-center text-light mb-5">
        User Overview
      </h1>

      <div className="masonry-grid">
        {allItemsShuffled.map((item) => (
          <div className="masonry-card" key={item.key}>
            {item.element}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOverview;
