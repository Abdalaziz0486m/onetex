// src/App.jsx
import { Routes, Route, useNavigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Shipments from "./pages/shipments/Shipments";
import Shipment from "./pages/shipments/Shipment";
import AddShipments from "./pages/shipments/AddShipments";
import EditShipments from "./pages/shipments/EditShipments";
import Drivers from "./pages/drivers/Drivers";
import Driver from "./pages/drivers/Driver";
import AddDrivers from "./pages/drivers/AddDrivers";
import EditDriver from "./pages/drivers/EditDriver";
import NotFound from "./pages/NotFound";
import Login from "./pages/regetration/Login";
import Signup from "./pages/regetration/Signup";
import "./App.css";
import VerifyOTP from "./pages/regetration/VerifyOTP";

function App() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:phone" element={<VerifyOTP />} />
        {token ? (
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="users" element={<Users />} />
            <Route path="shipments" element={<Shipments />} />
            <Route
              path="shipments/shipment/:trackingNumber"
              element={<Shipment />}
            />
            <Route path="shipments/add" element={<AddShipments />} />
            <Route
              path="shipments/edit/:trackingNumber"
              element={<EditShipments />}
            />
            <Route path="drivers" element={<Drivers />} />
            <Route path="drivers/driver/:id" element={<Driver />} />
            <Route path="drivers/add" element={<AddDrivers />} />
            <Route path="drivers/edit/:id" element={<EditDriver />} />
          </Route>
        ) : (
          navigate("/login")
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
