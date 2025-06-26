import { Link } from "react-router-dom";
import "../style/Footer.css";

const Footer = () => {
  return (
    <>
      <footer className="text-center text-lg-start text-muted">
        <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
          <div className="me-5 d-none d-lg-block">
            <span>Get connected with us on social networks:</span>
          </div>

          <div className="social-icon">
            <a href="" className="me-4 text-reset">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </section>

        <section className="">
          <div className="container text-center text-md-start mt-5">
            <div className="row mt-3">
              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  <i className="fas fa-gem me-3"></i>
                  <Link to="/" className="text-light text-decoration-none">
                    Weld Quiz
                  </Link>
                </h6>
                <p>
                  Here you can use rows and columns to organize your footer
                  content. Lorem ipsum dolor sit amet, consectetur adipisicing
                  elit.
                </p>
              </div>

              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4" area-hidden="true">
                  Customer Support
                </h6>
                <p>
                  <Link to="/others/pricedetails" className="text-reset">
                    <i className="fas fa-inr me-3" area-hidden="true"></i>
                    Pricing Information
                  </Link>
                </p>
                <p>
                  <Link to="/others/feedback" className="text-reset">
                    <i
                      className="fas fa-commenting me-3"
                      area-hidden="true"
                    ></i>
                    Feedback
                  </Link>
                </p>
                <p>
                  <Link to="/others/discussion" className="text-reset">
                    <i className="fa fa-comments me-3" area-hidden="true"></i>
                    Discussion
                  </Link>
                </p>
                <p>
                  <Link to="/others/faq" className="text-reset">
                    <i
                      className="fas fa-info-circle me-3"
                      area-hidden="true"
                    ></i>
                    Help & FAQs
                  </Link>
                </p>
              </div>

              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  Legal & Our Story
                </h6>
                <p>
                  <Link to="/legal/terms&conditions" className="text-reset">
                    <i
                      className="fa fa-check-circle me-3"
                      aria-hidden="true"
                    ></i>
                    Terms and Condition
                  </Link>
                </p>
                <p>
                  <Link to="/legal/privacypolicy" className="text-reset">
                    <i className="fa fa-book me-3" aria-hidden="true"></i>
                    Privacy Policy
                  </Link>
                </p>
                <p>
                  <Link to="/about" className="text-reset">
                    <i className="fa fa-handshake me-3" aria-hidden="true"></i>
                    About Us
                  </Link>
                </p>
                <p>
                  <Link className="text-reset">
                    <i className="fa fa-link me-3" aria-hidden="true"></i>
                    Link
                  </Link>
                </p>
              </div>

              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
                {/* <p>
                  <i className="fas fa-home me-3" area-hidden="true"></i> New
                  York, NY 10012, US
                </p> */}
                <p>
                  <i className="fas fa-envelope me-3" area-hidden="true"></i>
                  weldquiz@gmail.com
                </p>
                <p>
                  <i className="fas fa-phone me-3" area-hidden="true"></i> + 01
                  234 567 88
                </p>
                {/* <p>
                  <i className="fas fa-print me-3" area-hidden="true"></i> + 01
                  234 567 89
                </p> */}
              </div>
            </div>
          </div>
        </section>

        <div className="text-center p-4">
          <div>Copyright © 2025 Weld Quiz - All Rights Reserved.</div>
          <div className="mt-2">
            Website designed by:{" "}
            <a
              className="text-reset fw-bold text-decoration-none"
              target="_blank"
              href="https://www.akeditz.com"
            >
              Ak Editz Design and Develop
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
