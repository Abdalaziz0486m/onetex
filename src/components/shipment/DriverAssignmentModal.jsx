import * as React from "react";
import { FaUserCheck, FaSpinner } from "react-icons/fa";
import axios from "axios";

const { useState, useEffect } = React;


export default function DriverAssignmentModal({
  show,
  onClose,
  onAssign,
  loading: assignLoading = false,
}) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  
  // Fetch drivers from API when modal opens
  useEffect(() => {
    if (show) {
      fetchDrivers();
    }
  }, [show]);

  const fetchDrivers = async () => {
    setFetchingDrivers(true);
    setFetchError(null);

    try {
      console.log("Fetching drivers from API...");
      const response = await axios.get(`${API_BASE_URL}api/drivers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // التحقق من بنية الاستجابة المختلفة
      if (response.data.success && response.data.data) {
        // إذا كان الـ response له success property
        setDrivers(response.data.data);
        console.log(
          "Drivers loaded from data.data:",
          response.data.data.length
        );
      } else if (Array.isArray(response.data)) {
        // إذا كان الـ response مباشرة array
        setDrivers(response.data);
        console.log("Drivers loaded directly:", response.data.length);
      } else {
        console.log("Unexpected response structure:", response.data);
        setFetchError("تنسيق غير متوقع لبيانات السائقين");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setFetchError("خطأ في تحميل قائمة السائقين");
    } finally {
      setFetchingDrivers(false);
    }
  };

  const handleClose = () => {
    setSelectedDriver("");
    setFetchError(null);
    onClose();
  };

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign(selectedDriver);
      setSelectedDriver("");
    }
  };

  // Reset selected driver when modal closes
  useEffect(() => {
    if (!show) {
      setSelectedDriver("");
    }
  }, [show]);

  if (!show) return null;

  const selectedDriverData = drivers.find((d) => d._id === selectedDriver);
  const isLoading = fetchingDrivers || assignLoading;

  return (
    <div
      className="modal show d-flex position-fixed top-0 bottom-0 start-0 end-0 justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">تعيين سائق للشحنة</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={isLoading}
            ></button>
          </div>

          <div className="modal-body">
            {/* Loading state for fetching drivers */}
            {fetchingDrivers && (
              <div className="text-center p-3">
                <FaSpinner className="fa-spin me-2" />
                جاري تحميل قائمة السائقين...
              </div>
            )}

            {/* Error state */}
            {fetchError && (
              <div className="alert alert-danger">
                <strong>خطأ:</strong> {fetchError}
                <br />
                <button
                  className="btn btn-outline-danger btn-sm mt-2"
                  onClick={fetchDrivers}
                  disabled={fetchingDrivers}
                >
                  {fetchingDrivers
                    ? "جاري إعادة المحاولة..."
                    : "إعادة المحاولة"}
                </button>
              </div>
            )}

            {/* Drivers selection */}
            {!fetchingDrivers && !fetchError && (
              <div className="mb-3">
                <label className="form-label">اختر السائق:</label>
                <select
                  className="form-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  disabled={assignLoading}
                >
                  <option value="">-- اختر سائق --</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} - {driver.phone}
                      {driver.Area && ` (${driver.Area})`}
                      {driver.region && !driver.Area && ` (${driver.region})`}
                    </option>
                  ))}
                </select>

                {drivers.length === 0 && (
                  <small className="text-muted">
                    لا يوجد سائقين متاحين حالياً
                  </small>
                )}
              </div>
            )}

            {/* Selected driver preview */}
            {selectedDriverData && (
              <div
                className={`alert ${
                  selectedDriverData.isAvailable
                    ? "alert-info"
                    : "alert-warning"
                }`}
              >
                <strong>السائق المختار:</strong>
                <div className="mt-2">
                  <div>
                    <strong>الاسم:</strong> {selectedDriverData.name}
                  </div>
                  <div>
                    <strong>الهاتف:</strong> {selectedDriverData.phone}
                  </div>
                  {selectedDriverData.licenseNumber && (
                    <div>
                      <strong>رقم الرخصة:</strong>{" "}
                      {selectedDriverData.licenseNumber}
                    </div>
                  )}
                  {selectedDriverData.region && (
                    <div>
                      <strong>المنطقة:</strong> {selectedDriverData.region}
                    </div>
                  )}
                  {selectedDriverData.Area && (
                    <div>
                      <strong>المنطقة المحددة:</strong>{" "}
                      {selectedDriverData.Area}
                    </div>
                  )}
                  {selectedDriverData.hasOwnProperty("isAvailable") && (
                    <div>
                      <strong>الحالة:</strong>
                      <span
                        className={`badge ms-2 ${
                          selectedDriverData.isAvailable
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {selectedDriverData.isAvailable ? "متاح" : "غير متاح"}
                      </span>
                    </div>
                  )}
                  {selectedDriverData.assignedShipments && (
                    <div>
                      <strong>الشحنات المعينة:</strong>
                      <span className="badge bg-info ms-2">
                        {selectedDriverData.assignedShipments.length}
                      </span>
                    </div>
                  )}
                </div>
                {!selectedDriverData.isAvailable && (
                  <div className="mt-2">
                    <small className="text-warning">
                      ⚠️ هذا السائق غير متاح حالياً ولا يمكن تعيينه
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              إلغاء
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={
                !selectedDriver ||
                isLoading ||
                fetchError ||
                (selectedDriverData && !selectedDriverData.isAvailable)
              }
            >
              {assignLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  جاري التعيين...
                </>
              ) : (
                <>
                  <FaUserCheck className="me-2" />
                  تعيين السائق
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
