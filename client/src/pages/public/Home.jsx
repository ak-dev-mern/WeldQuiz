import "../../style/Home.css";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import Price from "../../components/Price.jsx";
import Poster from "../../components/Poster.jsx";

// Import Images
import bulb from "../../assets/images/icon-bulb-feature-1.svg";
import man from "../../assets/images/icon-man-feature-2.svg";
import job from "../../assets/images/icon-job-feature-3.svg";
import cards from "../../assets/images/icon-cards-feature-4.svg";
import manHead from "../../assets/images/man-head.png";
import groupStudy from "../../assets/images/group-study.jpg";
import people from "../../assets/images/people.png";
import schoolBg from "../../assets/images/school-bg.png";
import { getRole, getToken } from "../../auth/auth.js";

const Home = () => {
  const token = getToken();
  const UserRole = getRole();
  const navigate = useNavigate();
  const handleDemoQuestion = () => {
    if (!token) {
      navigate("/register");
    }
    if (UserRole === "admin") {
      navigate("/");
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleRegister = () => {
    if (!token) {
      navigate("/register");
    } else {
      navigate("/");
    }
  };
  return (
    <>
      <Navbar />
      <div>
        {/* Hero Section */}
        <header className="text-light py-5 d-flex justify-content-center align-items-center">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h1 className="display-2 fw-bold">
                  Keep learning and boost your knowledge
                </h1>
                <p className="lead">
                  Looking to add new skills? We’re a leading destination for
                  online education and world-class learning anywhere. Choose
                  from a variety of courses and learn at your own pace.
                </p>

                <button
                  typeof="button"
                  className="home-btn mt-3"
                  onClick={handleDemoQuestion}
                >
                  Start a Demo Questions
                </button>
              </div>
              <div className="col-md-6 text-center">
                <img
                  src={manHead}
                  alt="Learn"
                  className="img-fluid w-100 rounded-circle"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="feature py-5 d-flex justify-content-center align-items-center">
          <div className="container text-center">
            <h1 className="display-4 mb-5 text-light">
              Special features that make our online courses the best
            </h1>
            <div className="row g-4">
              {[
                {
                  img: bulb,
                  title: "New Skills",
                  text: "Keep your mind engaged and acquire new knowledge.",
                },
                {
                  img: man,
                  title: "Made By Experts",
                  text: "Our courses are created by industry professionals.",
                },
                {
                  img: job,
                  title: "Career Opportunities",
                  text: "Gain skills to advance in your career path.",
                },
                {
                  img: cards,
                  title: "Lifetime Learning",
                  text: "Learn anytime & anywhere from trusted mentors.",
                },
              ].map((feature, index) => (
                <div key={index} className="col-md-3">
                  <div className="card p-4 shadow">
                    <div className="card-top-image">
                      <img
                        src={feature.img}
                        alt={feature.title}
                        className="img-fluid"
                      />
                    </div>
                    <div className="card-header border-0">
                      <h4>{feature.title}</h4>
                    </div>
                    <div className="card-body">
                      <p>{feature.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Price Details Section */}

        <Price />

        {/* Knowledge Section */}
        <section className="knowledge py-5 d-flex justify-content-center align-items-center">
          <div className="school-bg">
            <img className="img-fluid" src={schoolBg} alt="schoolBg" />
          </div>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6 text-center">
                <img
                  src={groupStudy}
                  alt="Expand Knowledge"
                  className="img-fluid"
                />
              </div>
              <div className="col-md-6">
                <h1 className="display-4 fw-bold">
                  Propel your career & expand your knowledge at any level
                </h1>
                <p>
                  Our platform provides courses ranging from design,
                  photography, marketing, and many more. With 250+ schools and
                  50,000+ students from multiple countries, we offer top-quality
                  learning.
                </p>
                <p>
                  Learn from industry experts anytime, anywhere, and improve
                  your skillset.
                </p>
                <button className="home-btn mt-3">Explore More</button>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Sharing Section */}
        <section className="experience py-5 d-flex justify-content-center align-items-center">
          <div className="container text-light">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h1 className="display-4 fw-bold my-3">
                  Share your knowledge & experience with others
                </h1>
                <p className="my-4 text-dark">
                  We believe everyone has something valuable to share. Teach
                  students worldwide, either for free or as a paid instructor.
                </p>
                <ul className="list-unstyled">
                  <li className="py-1">
                    <i className="bi bi-patch-check-fill"></i> Save unlimited
                    workouts & custom routines
                  </li>
                  <li className="py-1">
                    <i className="bi bi-patch-check-fill"></i> Track progress
                    with graphs & backup data
                  </li>
                  <li className="py-1">
                    <i className="bi bi-patch-check-fill"></i> Connect with
                    instructors for feedback and support
                  </li>
                </ul>
                <Link>
                  <button onClick={handleRegister} className="home-btn mt-3">
                    Become a User
                  </button>
                </Link>
              </div>
              <div className="col-md-6 text-center people-img">
                <img
                  src={people}
                  alt="Teaching Illustration"
                  className="img-fluid w-100"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Poster />
      <Footer />
    </>
  );
};

export default Home;
