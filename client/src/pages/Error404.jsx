import { Link } from "react-router-dom";
import "../style/Error404.css"
import errorImg from "../assets/images/404-error.png"

const Error404 = () => {
  return (
    <>
      <div className="container">
        <div className="error-container">
          <img
            src={errorImg}
            alt="404 Not Found"
            className="img-fluid"
            style={{ maxWidth: "400px" }}
          />
          <h1 className="mt-4 display-3 fw-bold text-light">Oops! Page Not Found</h1>
          <p className=" text-light fw-bold fs-4 my-3">
            The page you are looking for doesn’t exist.
          </p>
          <Link to="/" className="btn btn-light mt-3">
            Go Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default Error404;
