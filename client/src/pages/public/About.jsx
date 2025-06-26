import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import Poster from "../../components/Poster";
import about from "../../assets/images/about-img.jpg";
import "../../style/About.css";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";

const About = () => {
  return (
    <>
      <Navbar />
      <Header title={"About Us"} />
      <div className="container-fluid">
        <div className="container about">
          <div className="row d-flex justify-content-center align-items-center my-5">
            {/* <div className="col-md-6">
              <div className="about-image">
                <img className="img-fluid" src={about} alt="about" />
                <div className="main-name-lable d-flex flex-column justify-content-center align-items-center text-center">
                  <div>
                    <h4>Name</h4>
                    <span>Designation</span>
                  </div>
                  <div className="main-social-media-link my-md-2">
                    <Link className="text-light">
                      <i className="fab fa-facebook-f px-2 fs-4"></i>
                    </Link>
                    <Link className="text-light">
                      <i className="bi bi-instagram px-2 fs-4"></i>
                    </Link>
                    <Link className="text-light">
                      <i className="bi bi-telephone-fill px-2 fs-4"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div> */}
            <Card style={{ maxWidth: "700px" }}>
              <div className="col-md-6 mt-3 text-center w-100 p-md-5">
                <p className="fs-5">
                  With over a decade of experience in the field of Welding and
                  Non-Destructive Testing (NDT), we bring a strong foundation of
                  technical expertise and quality assurance to industrial
                  projects across various sectors. Founded and led by a
                  qualified Mechanical Engineer holding a Bachelor's degree (BE
                  – Mechanical), our journey began with hands-on quality control
                  (QC) inspection roles across diverse industries including
                  power plants, pipelines, cement plants, refineries, and
                  petrochemical facilities.
                </p>
                <p className="fs-5 fst-italic">
                  "Our commitment to excellence, adherence to international
                  standards, and deep understanding of inspection and welding
                  procedures have made us a trusted name in the industry.
                  Whether it's construction, maintenance, or shutdown projects,
                  we deliver reliable solutions with precision and integrity."
                </p>
              </div>
            </Card>
          </div>
          {/* <div className="row employee-img my-5">
            <div className="single-image">
              <img className="img-fluid" src={about} alt="about" />
              <div className="name-lable d-flex justify-content-between align-items-center">
                <div>
                  <h5>Name</h5>
                  <span>Designation</span>
                </div>
                <div className="main-social-media-link my-md-2">
                  <Link className="text-light">
                    <i className="fab fa-facebook-f px-2 fs-4"></i>
                  </Link>
                  <Link className="text-light">
                    <i className="bi bi-instagram px-2 fs-4"></i>
                  </Link>
                  <Link className="text-light">
                    <i className="bi bi-telephone-fill px-2 fs-4"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="single-image">
              <img className="img-fluid" src={about} alt="about" />
              <div className="name-lable d-flex justify-content-between align-items-center">
                <div>
                  <h5>Name</h5>
                  <span>Designation</span>
                </div>
                <div className="main-social-media-link my-md-2">
                  <Link className="text-light">
                    <i className="fab fa-facebook-f px-2 fs-4"></i>
                  </Link>
                  <Link className="text-light">
                    <i className="bi bi-instagram px-2 fs-4"></i>
                  </Link>
                  <Link className="text-light">
                    <i className="bi bi-telephone-fill px-2 fs-4"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="single-image">
              <img className="img-fluid" src={about} alt="about" />
              <div className="name-lable d-flex justify-content-between align-items-center">
                <div>
                  <h5>Name</h5>
                  <span>Designation</span>
                </div>
                <div className="main-social-media-link my-md-2">
                  <Link className="text-light">
                    <i className="fab fa-facebook-f px-2 fs-4"></i>
                  </Link>
                  <Link className="text-light">
                    <i className="bi bi-instagram px-2 fs-4"></i>
                  </Link>
                  <Link className="text-light">
                    <i className="bi bi-telephone-fill px-2 fs-4"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <Poster />
      <Footer />
    </>
  );
};

export default About;
