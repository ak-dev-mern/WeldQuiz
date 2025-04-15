import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import Poster from "../../components/Poster";
import about from "../../assets/images/about-img.jpg";
import "../../style/About.css";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <>
      <Navbar />
      <Header title={"About Us"} />
      <div className="container-fluid">
        <div className="container about">
          <div className="row d-flex justify-content-center align-items-center my-5">
            <div className="col-md-6">
              <div className="about-image">
                <img className="img-fluid" src={about} alt="about" />
                <div className="main-name-lable d-flex flex-column justify-content-center aligin-items-center text-center">
                  <div>
                    <h4>Name</h4>
                    <span>Designation</span>
                  </div>
                  <div className="main-social-media-link my-2">
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
            </div>
            <div className="col-md-6">
              <p className="fs-5">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Doloribus optio minus saepe, aliquam similique ipsa excepturi
                quod est modi nobis et perferendis illum commodi veritatis,
                cupiditate voluptatem quidem architecto! Accusantium! Lorem
                ipsum dolor sit amet consectetur, adipisicing elit. Doloribus
                optio minus saepe, aliquam similique ipsa excepturi quod est
                modi nobis et perferendis illum commodi veritatis, cupiditate
                voluptatem quidem architecto! Accusantium!
              </p>
              <p className="fs-5 fst-italic">
                " Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Doloribus optio minus saepe, aliquam similique ipsa excepturi
                quod est modi nobis et perferendis illum commodi veritatis,
                cupiditate voluptatem quidem architecto! Accusantium! Lorem
                ipsum dolor sit amet consectetur, adipisicing elit. Doloribus
                optio minus saepe, aliquam similique ipsa excepturi quod est
                modi nobis et perferendis illum commodi veritatis, cupiditate
                voluptatem quidem architecto! Accusantium!"
              </p>
            </div>
          </div>
          <div className="row employee-img my-5">
            <div>
              <img className="img-fluid" src={about} alt="about" />
              <div className="name-lable px-3">
                <div>
                  <h5>Name</h5>
                  <span className=" fst-italic">Designation</span>
                  <div className="social-media-link">
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
            </div>
            <div>
              <img className="img-fluid" src={about} alt="about" />
              <div className="name-lable px-3">
                <div>
                  <h5>Name</h5>
                  <span className=" fst-italic">Designation</span>
                  <div className="social-media-link">
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
            </div>
            <div>
              <img className="img-fluid" src={about} alt="about" />
              <div className="name-lable px-3">
                <div>
                  <h5>Name</h5>
                  <span className="fst-italic">Designation</span>
                  <div className="social-media-link">
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
            </div>
          </div>
        </div>
      </div>
      <Poster />
      <Footer />
    </>
  );
};

export default About;
