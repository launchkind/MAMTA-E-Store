"use client";
import React, { useState } from "react";
import LeftSideBar from "./LeftSideBar";

// Simple client-side menu icon to prevent hydration issues
const MenuIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide-menu"
    >
      <line x1="4" x2="20" y1="12" y2="12"></line>
      <line x1="4" x2="20" y1="6" y2="6"></line>
      <line x1="4" x2="20" y1="18" y2="18"></line>
    </svg>
  );
};

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={toggleSidebar}
        className="hover:text-primary hoverEffect mt-1"
        aria-label="Toggle menu"
      >
        <MenuIcon />
      </button>
      <LeftSideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
