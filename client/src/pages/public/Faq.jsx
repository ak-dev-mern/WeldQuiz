import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../style/Faq.css";
import ContactForm from "../../components/ContactForm";
import Poster from "../../components/Poster";

const Faq = () => {
  return (
    <>
      <Navbar />
      <Header title={"Help & FAQs"} />

      <div className="container-fluid">
        <div className="container faq">
          <div className="accordion-container px-md-5">
            <div className="accordion" id="accordionExample">
              <h3 className="my-3 text-light">Frequently Asked Questions</h3>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    What is Welding QC?
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    Welding QC (Quality Control) ensures that welding processes
                    and products meet specified standards and regulations.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Why is Quality Control important in welding?
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    QC ensures that welds meet strength and durability
                    requirements, reducing defects and ensuring safety.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                    How can I improve my welding inspection skills?
                  </button>
                </h2>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    Regular training, hands-on practice, and staying updated
                    with industry standards help improve welding QC skills.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <ContactForm />
        </div>
      </div>
      <Poster />
      <Footer />
    </>
  );
};

export default Faq;
