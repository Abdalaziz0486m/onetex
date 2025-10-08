import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

// Import components
import ShipmentStatusBadge from "../../components/shipment/ShipmentStatusBadge";
import ShipmentInfoCard from "../../components/shipment/ShipmentInfoCard";
import ShipmentTimeline from "../../components/shipment/ShipmentTimeline";
import DriverCard from "../../components/shipment/DriverCard";
import PersonCard from "../../components/shipment/PersonCard";
import DriverAssignmentModal from "../../components/shipment/DriverAssignmentModal";
import ShipmentActions from "../../components/shipment/ShipmentActions";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

const { useEffect, useState, useCallback } = React;

export default function ShowShipment() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = React.useState(null);
  const [drivers, setDrivers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [showDriverModal, setShowDriverModal] = React.useState(false);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  // Fetch drivers from API
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}api/drivers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  }, []);

  // Fetch shipment data from API
  const fetchShipment = useCallback(async () => {
    if (!trackingNumber) {
      setLoading(false);
      setError("رقم التتبع غير موجود");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}api/shipments/${trackingNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setShipment(response.data.data);
        setError(null);
      } else {
        setError("لم يتم العثور على الشحنة");
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);

      if (error.response?.status === 404) {
        setError("الشحنة غير موجودة");
      } else {
        setError("خطأ في تحميل بيانات الشحنة");
      }
    } finally {
      setLoading(false);
    }
  }, [trackingNumber]);

  useEffect(() => {
    fetchShipment();
    fetchDrivers();
  }, [fetchShipment, fetchDrivers]);

  // Handle assign driver
  const handleAssignDriver = async (driverId) => {
    setActionLoading(true);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}api/shipments/${trackingNumber}/assign-driver`,
        { driverId }
      );

      if (response.data.success) {
        toast.success("تم تعيين السائق بنجاح");
        setShowDriverModal(false);
        fetchShipment(); // Refresh shipment data
      } else {
        toast.error(response.data.message || "فشل في تعيين السائق");
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      const errorMessage =
        error.response?.data?.message || "خطأ في تعيين السائق";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete shipment
  const handleDelete = async () => {
    if (!window.confirm(`هل تريد حذف الشحنة رقم ${trackingNumber}؟`)) return;

    setActionLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}api/shipments/${trackingNumber}`
      );

      if (response.data.success) {
        toast.success("تم حذف الشحنة بنجاح");
        navigate("/shipments");
      } else {
        toast.error("فشل في حذف الشحنة");
      }
    } catch (error) {
      console.error("Error deleting shipment:", error);
      toast.error("خطأ في حذف الشحنة");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="جاري تحميل بيانات الشحنة..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={fetchShipment}
        onBack={() => navigate("/shipments")}
      />
    );
  }

  // No shipment data
  if (!shipment) {
    return (
      <ErrorMessage
        error="لم يتم العثور على الشحنة"
        onBack={() => navigate("/shipments")}
      />
    );
  }

  return (
    <div className="position-relative">
      <div className="container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/shipments")}
            >
              <FaArrowLeft className="me-2" />
              العودة للقائمة
            </button>
          </div>
          <h2 className="mb-0">تفاصيل الشحنة #{trackingNumber}</h2>
        </div>

        {/* Status Badge */}
        <ShipmentStatusBadge status={shipment.status} />

        {/* Main Content */}
        <div className="card p-4 mb-4">
          {/* Shipment Info Cards */}
          <ShipmentInfoCard shipment={shipment} />

          {/* Timeline */}
          <ShipmentTimeline status={shipment.status} />

          {/* Driver Information */}
          <div className="row mb-4">
            <DriverCard assignedDriver={shipment.assignedDriver} />
          </div>

          {/* Sender and Recipient */}
          <div className="row mb-4">
            <div className="col-md-6 mb-4">
              <PersonCard person={shipment.sender} title="بيانات المرسل" />
            </div>
            <div className="col-md-6 mb-4">
              <PersonCard
                person={shipment.recipient}
                title="بيانات المستلم"
                isRecipient={true}
              />
            </div>
          </div>

          {/* Notes */}
          {shipment.notes && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-info">
                  <strong>ملاحظات إضافية:</strong>
                  <div className="mt-2">{shipment.notes}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <ShipmentActions
            shipment={shipment}
            trackingNumber={trackingNumber}
            onEdit={() => navigate(`/shipments/edit/${trackingNumber}`)}
            onDelete={handleDelete}
            onPrint={handlePrint}
            onAssignDriver={() => setShowDriverModal(true)}
            actionLoading={actionLoading}
          />
        </div>

        {/* Driver Assignment Modal */}
        <DriverAssignmentModal
          show={showDriverModal}
          onClose={() => setShowDriverModal(false)}
          onAssign={handleAssignDriver}
          drivers={drivers}
          loading={actionLoading}
        />
      </div>
    </div>
  );
}
