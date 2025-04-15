import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Price from "../../components/Price";
import Poster from "../../components/Poster";
import Header from "../../components/Header";

const PriceDetails = () => {
  return (
    <>
      <Navbar />
      <Header title={"Price Details"} />
      <Price />
      <Poster />
      <Footer />
    </>
  );
};

export default PriceDetails;
