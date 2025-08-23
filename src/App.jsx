// src/App.jsx
import { Routes, Route } from "react-router-dom";
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
import "./App.css";

function App() {
  return (
    <>
      <Routes>
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
