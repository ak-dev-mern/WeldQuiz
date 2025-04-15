import React from "react";
import "../style/Header.css";
import { Link } from "react-router-dom";

const Header = ({ title }) => {
  return (
    <header className="page-header d-flex flex-column">
      <div>
        <h1 className="text-center display-3 fw-bold text-light">{title}</h1>
      </div>
      <div>
        <nav aria-label="breadcrumb" className="bg-transparent my-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="link-light text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>
      </div>
    </header>
  );
};

export default Header;
