import { FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/logo.png";

export default function Aside({ closeSidebar, toggleSidebar, sidebarOpen }) {
  return (
    <aside
      className={`sidebar p-3 border-start ${sidebarOpen ? "open" : ""}`}
      onClick={closeSidebar}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2 fw-bold fs-5 text-primary">
          <img src={Logo} className="w-100" />
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
        <NavLink to="/users" className="nav-link">
          👥 المستخدمين
        </NavLink>
        <NavLink to="/shipments" className="nav-link">
          📦 الشحنات
        </NavLink>
      </nav>
    </aside>
  );
}
