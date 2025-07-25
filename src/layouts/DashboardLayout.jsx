import { useState } from "react";
import { Outlet } from "react-router-dom";
import Aside from "../components/layout/Aside";
import Header from "../components/layout/Header";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="d-flex flex-column flex-lg-row vh-100">
      {/* Sidebar (responsive) */}
      <Aside
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      {/* Main Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Topbar */}
        <Header toggleSidebar={toggleSidebar} />
        {/* Content */}
        <main
          className="p-4 overflow-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
