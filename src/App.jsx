// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
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
import VerifyOTP from "./pages/regetration/VerifyOTP";
import UnassignedShipments from "./pages/unassignedShipments/UnassignedShipments";
import "./App.css";

// ✅ Component for protected routes
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ✅ Component for guest routes (login/signup)
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      {/* Guest Routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />
      <Route path="/verify/:phone" element={<VerifyOTP />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
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
        <Route path="unassignedshipments" element={<UnassignedShipments />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="drivers/driver/:id" element={<Driver />} />
        <Route path="drivers/add" element={<AddDrivers />} />
        <Route path="drivers/edit/:id" element={<EditDriver />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
