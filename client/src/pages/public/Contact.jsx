import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import chat from "../../assets/images/chat.svg";
import call from "../../assets/images/call.svg";
import email from "../../assets/images/email.svg";
import "../../style/contact.css";
import Poster from "../../components/Poster";
import Header from "../../components/Header";
import ContactForm from "../../components/ContactForm";

const Contact = () => {
  return (
    <>
      <Navbar />
      <Header title={"Contact Us"} />
      <div className="container-fluid contact">
        <div className="container">
          <div className="row">
            {[
              {
                img: chat,
                title: "Chat with us",
                text: "We're available Monday-Friday from 9 am to 5 pm EST.",
              },
              {
                img: call,
                title: "Give us a call",
                text: "Call us at (+012-345-567-890) from 9 am to 5 pm.",
              },
              {
                img: email,
                title: "Email Us",
                text: "Email us at weldquiz@gmail.com and get a reply within 24 hours.",
              },
            ].map((contact, index) => (
              <div key={index} className="col-md-4 my-5 pt-5 m-auto">
                <div className="card p-4 shadow p-3">
                  <div className="card-top-image">
                    <img
                      src={contact.img}
                      alt={contact.title}
                      className="img-fluid"
                    />
                  </div>
                  <div className="card-header mt-3 border-0 bg-transparent">
                    <h3>{contact.title}</h3>
                  </div>
                  <div className="card-body fs-5">
                    <p>{contact.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>

        <div className="row">
          <Poster />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;
