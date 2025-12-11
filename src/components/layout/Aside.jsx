import { FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../assets/logo.png";
import { getPendingDrivers } from "../../services/driverService";
import { getPendingShipments } from "../../services/shipmentService";

export default function Aside({ closeSidebar, toggleSidebar, sidebarOpen }) {
  const [pendingDriversCount, setPendingDriversCount] = useState(0);
  const [pendingShipmentsCount, setPendingShipmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
    // تحديث العدادات كل 30 ثانية
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCounts = async () => {
    try {
      // جلب عدد طلبات السائقين المعلقة
      const driversResponse = await getPendingDrivers();
      setPendingDriversCount(driversResponse.data?.length || 0);

      // جلب عدد الشحنات المنتظرة
      const shipmentsResponse = await getPendingShipments();
      setPendingShipmentsCount(shipmentsResponse.data?.length || 0);
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      className={`sidebar p-3 pe-0 border-start ${sidebarOpen ? "open" : ""}`}
      onClick={closeSidebar}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2 fw-bold fs-5 text-primary">
          <img src={Logo} className="w-100" alt="Logo" />
        </div>
        <button className="btn d-lg-none" onClick={toggleSidebar}>
          <FaTimes />
        </button>
      </div>

      <nav className="nav flex-column">
        <NavLink to="/" className="nav-link">
          🏠 الرئيسية
        </NavLink>
        <NavLink to="/drivers" className="nav-link">
          🚗 السائقين
        </NavLink>
        <NavLink to="driverapproval" className="nav-link position-relative">
          🚗 طلبات السائقين
          {!loading && pendingDriversCount > 0 && (
            <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
              {pendingDriversCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/users" className="nav-link">
          👥 المستخدمين
        </NavLink>
        <NavLink to="/shipments" className="nav-link">
          📦 الشحنات
        </NavLink>
        <NavLink
          to="/unassignedShipments"
          className="nav-link position-relative"
        >
          🛂 شحنات بانتظار التوجيه
          {!loading && pendingShipmentsCount > 0 && (
            <span className="badge bg-warning text-dark rounded-pill position-absolute top-0 start-100 translate-middle">
              {pendingShipmentsCount}
            </span>
          )}
        </NavLink>
      </nav>
    </aside>
  );
}
