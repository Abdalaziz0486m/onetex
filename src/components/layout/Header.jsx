import { FaBars } from "react-icons/fa";
import Theme from "../ui/Theme";

export default function Header({ toggleSidebar }) {
  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom"
    >
      <div className="d-flex align-items-center gap-3">
        <button className="btn d-lg-none" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h5 className="m-0">لوحة التحكم</h5>
      </div>
      <Theme />
    </header>
  );
}
