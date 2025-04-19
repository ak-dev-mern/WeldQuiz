import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../../auth/auth.js";
import { Spinner, Alert, Button } from "react-bootstrap";
import Navbar from "../../components/Navbar.jsx";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import Poster from "../../components/Poster.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const token = getToken();

const PaidQuizLessons = () => {
  const { category } = useParams();

  const {
    data: questionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["questions", category],
    queryFn: async () => {
      try {
        const res = await axios.get(`${API_URL}/api/questions/getquestions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
      } catch (err) {
        console.error("API error:", err);
        throw err;
      }
    },
  });

  const categoryData = questionsData?.find(
    (cat) => cat.category.toLowerCase() === category.toLowerCase()
  );

  const lessons =
    categoryData?.lessons
      ?.filter(
        (lesson, index, self) =>
          index ===
          self.findIndex(
            (l) => l.lesson.toLowerCase() === lesson.lesson.toLowerCase()
          )
      )
      ?.sort((a, b) => a.lesson.localeCompare(b.lesson)) || [];

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading lessons...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-danger my-4">
        <Alert variant="danger">
          <strong>Error:</strong> {error.message}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Header title={`Lessons in ${category}`} />
      <div className="container my-5">
        <div className="mb-3">
          <Link to={"/student/dashboard"}>
            <button
              className="btn shadow"
              style={{ backgroundColor: "white", color: "orangered" }}
            >
              <i className="fas fa-arrow-left me-2"></i> Back to Categories
            </button>
          </Link>
        </div>

        <div className="row">
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <div className="col-md-4 col-sm-6 mb-4" key={index}>
                <Link
                  to={`/student/paid-quiz/${encodeURIComponent(
                    category
                  )}/${encodeURIComponent(lesson.lesson)}`}
                  className="text-decoration-none"
                >
                  <div className="card shadow h-100 p-3 border-success border-0">
                    <div className="d-flex align-items-center gap-3">
                      <i className="fas fa-book fa-2x text-success" />
                      <h5 className="mb-0 text-dark">{lesson.lesson}</h5>
                    </div>
                    <div className="mt-2 text-muted">
                      {lesson.questions.length} questions
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center">
              No lessons found for this category.
            </div>
          )}
        </div>
      </div>
      <Poster />
      <Footer />
    </>
  );
};

export default PaidQuizLessons;
