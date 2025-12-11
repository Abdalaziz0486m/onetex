import * as React from "react";
import { FaUserCheck, FaSpinner } from "react-icons/fa";

// Import driver service
import { getAllDrivers } from "../../services/driverService";

const { useState, useEffect } = React;

export default function DriverAssignmentModal({
  show,
  onClose,
  onAssign,
  drivers: externalDrivers = null, // يمكن تمرير السائقين من الخارج
  loading: assignLoading = false,
}) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // إذا تم تمرير السائقين من الخارج، استخدمهم بدلاً من جلبهم
  useEffect(() => {
    if (externalDrivers && Array.isArray(externalDrivers)) {
      setDrivers(externalDrivers);
    } else if (show && !externalDrivers) {
      fetchDrivers();
    }
  }, [show, externalDrivers]);

  // Fetch drivers using service
  const fetchDrivers = async () => {
    setFetchingDrivers(true);
    setFetchError(null);

    try {
      console.log("Fetching drivers from API...");
      const response = await getAllDrivers();

      if (response.success && response.data) {
        setDrivers(response.data);
        console.log("Drivers loaded from data:", response.data.length);
      } else if (Array.isArray(response)) {
        setDrivers(response);
        console.log("Drivers loaded directly:", response.length);
      } else {
        console.log("Unexpected response structure:", response);
        setFetchError("تنسيق غير متوقع لبيانات السائقين");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في تحميل قائمة السائقين";
      setFetchError(errorMessage);
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

  const selectedDriverData = drivers.find(
    (d) => d._id === selectedDriver || d.id === selectedDriver
  );
  const isLoading = fetchingDrivers || assignLoading;

  // إحصائيات السائقين
  const availableDrivers = drivers.filter(
    (driver) => driver.isAvailable !== false
  );
  const unavailableDrivers = drivers.filter(
    (driver) => driver.isAvailable === false
  );

  return (
    <div
      className="modal-backdrop show d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <FaUserCheck className="me-2 text-primary" />
              تعيين سائق للشحنة
            </h5>
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
                <FaSpinner className="fa-spin me-2" size={24} />
                <div className="mt-2">جاري تحميل قائمة السائقين...</div>
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
              <>
                <div className="mb-3">
                  <label className="form-label fw-bold">اختر السائق: *</label>
                  <select
                    className="form-select"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    disabled={assignLoading}
                  >
                    <option value="">-- اختر سائق --</option>

                    {/* السائقين المتاحين */}
                    {availableDrivers.length > 0 && (
                      <optgroup label="✅ السائقين المتاحين">
                        {availableDrivers.map((driver) => (
                          <option
                            key={driver._id || driver.id}
                            value={driver._id || driver.id}
                          >
                            {driver.name} - {driver.phone}
                            {driver.Area && ` (${driver.Area})`}
                            {driver.region &&
                              !driver.Area &&
                              ` (${driver.region})`}
                            {driver.assignedShipments?.length > 0 &&
                              ` - ${driver.assignedShipments.length} شحنات`}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* السائقين غير المتاحين */}
                    {unavailableDrivers.length > 0 && (
                      <optgroup label="⛔ السائقين غير المتاحين">
                        {unavailableDrivers.map((driver) => (
                          <option
                            key={driver._id || driver.id}
                            value={driver._id || driver.id}
                            disabled
                          >
                            {driver.name} - {driver.phone}
                            {driver.Area && ` (${driver.Area})`}
                            {driver.region &&
                              !driver.Area &&
                              ` (${driver.region})`}
                            {driver.assignedShipments?.length > 0 &&
                              ` - ${driver.assignedShipments.length} شحنات`}
                            {" (غير متاح)"}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {drivers.length === 0 && (
                    <div className="alert alert-warning mt-2 mb-0">
                      <small>لا يوجد سائقين حالياً</small>
                    </div>
                  )}

                  {drivers.length > 0 && (
                    <small className="text-muted d-block mt-1">
                      إجمالي السائقين: {drivers.length}
                      {availableDrivers.length > 0 && (
                        <span className="text-success mx-1">
                          • متاح: {availableDrivers.length}
                        </span>
                      )}
                      {unavailableDrivers.length > 0 && (
                        <span className="text-danger">
                          • غير متاح: {unavailableDrivers.length}
                        </span>
                      )}
                    </small>
                  )}
                </div>

                {/* Selected driver preview */}
                {selectedDriverData && (
                  <div
                    className={`alert ${
                      selectedDriverData.isAvailable !== false
                        ? "alert-info"
                        : "alert-warning"
                    } mb-0`}
                  >
                    <strong className="d-block mb-2">
                      📋 معلومات السائق المختار:
                    </strong>
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted">الاسم:</small>
                        <div className="fw-bold">{selectedDriverData.name}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">الهاتف:</small>
                        <div className="fw-bold">
                          {selectedDriverData.phone}
                        </div>
                      </div>
                      {selectedDriverData.licenseNumber && (
                        <div className="col-6">
                          <small className="text-muted">رقم الرخصة:</small>
                          <div className="fw-bold">
                            {selectedDriverData.licenseNumber}
                          </div>
                        </div>
                      )}
                      {selectedDriverData.region && (
                        <div className="col-6">
                          <small className="text-muted">المنطقة:</small>
                          <div className="fw-bold">
                            {selectedDriverData.region}
                          </div>
                        </div>
                      )}
                      {selectedDriverData.Area && (
                        <div className="col-12">
                          <small className="text-muted">الحي:</small>
                          <div className="fw-bold">
                            {selectedDriverData.Area}
                          </div>
                        </div>
                      )}
                      <div className="col-12">
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-muted">الحالة:</small>
                            <span
                              className={`badge ms-2 ${
                                selectedDriverData.isAvailable !== false
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {selectedDriverData.isAvailable !== false
                                ? "متاح"
                                : "غير متاح"}
                            </span>
                          </div>
                          {selectedDriverData.assignedShipments && (
                            <div>
                              <small className="text-muted">
                                الشحنات الحالية:
                              </small>
                              <span className="badge bg-info ms-2">
                                {selectedDriverData.assignedShipments.length}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedDriverData.isAvailable === false && (
                      <div className="mt-2 pt-2 border-top">
                        <small className="text-warning">
                          ⚠️ هذا السائق غير متاح حالياً ولا يمكن تعيينه
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </>
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
                (selectedDriverData && selectedDriverData.isAvailable === false)
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
