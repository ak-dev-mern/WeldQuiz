import React from "react";
import { Outlet } from "react-router-dom";
import HomeHeader from "./HomeHeader";
import Footer from "./Footer";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col">
      {/* Home Header for public pages */}
      <HomeHeader />

      {/* Main content area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer for public pages */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
