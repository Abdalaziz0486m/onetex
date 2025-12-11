"use client";
import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

// Import services
import { getDriverById } from "../../services/driverService";

// Import components
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

// Status mappings
const STATUS_TRANSLATIONS = {
  Pending: "قيد الإنشاء",
  "In Transit": "قيد التوصيل",
  Delivered: "تم التسليم",
  Cancelled: "ملغاة",
};

export default function Driver() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // جلب بيانات السائق وشحناته
  const fetchDriver = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("معرف السائق غير موجود");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const driverData = await getDriverById(id);

      // التعامل مع الـ response المباشر
      if (driverData && driverData._id) {
        setDriver({
          id: driverData._id,
          name: driverData.name,
          phone: driverData.phone,
          licenseNumber: driverData.licenseNumber,
          region: driverData.region,
          area: driverData.Area,
          isApproved: driverData.isApproved,
          isAvailable: driverData.isAvailable,
          createdAt: driverData.createdAt,
        });

        // استخراج الشحنات من assignedShipments
        if (
          driverData.assignedShipments &&
          Array.isArray(driverData.assignedShipments)
        ) {
          setShipments(driverData.assignedShipments);
        } else {
          setShipments([]);
        }
      } else {
        setError("لم يتم العثور على السائق");
      }
    } catch (error) {
      console.error("Error fetching driver:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في تحميل بيانات السائق";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  const getStatusBadge = (status) => {
    const translatedStatus = STATUS_TRANSLATIONS[status] || status;

    switch (status) {
      case "Pending":
        return <span className="badge bg-secondary">{translatedStatus}</span>;
      case "In Transit":
        return (
          <span className="badge bg-warning text-dark">{translatedStatus}</span>
        );
      case "Delivered":
        return <span className="badge bg-success">{translatedStatus}</span>;
      case "Cancelled":
        return <span className="badge bg-danger">{translatedStatus}</span>;
      default:
        return (
          <span className="badge bg-light text-dark">{translatedStatus}</span>
        );
    }
  };

  const columns = [
    {
      name: "رقم التتبع",
      selector: (row) => row.trackingNumber,
      sortable: true,
      wrap: true,
      width: "150px",
    },
    {
      name: "المرسل",
      selector: (row) => row.sender?.name || "غير محدد",
      sortable: true,
      wrap: true,
    },
    {
      name: "المستلم",
      selector: (row) => row.recipient?.name || "غير محدد",
      sortable: true,
      wrap: true,
    },
    {
      name: "الوجهة",
      selector: (row) => row.recipient?.address?.national?.city || "غير محدد",
      sortable: true,
      wrap: true,
    },
    {
      name: "حالة الشحنة",
      cell: (row) => getStatusBadge(row.status),
      sortable: true,
      width: "130px",
    },
    {
      name: "التحكم",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() =>
              navigate(`/shipments/shipment/${row.trackingNumber}`)
            }
            title="عرض التفاصيل"
          >
            <FaEye />
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/shipments/edit/${row.trackingNumber}`)}
            title="تعديل"
          >
            <FaEdit />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      width: "110px",
      right: true,
    },
  ];

  // Loading state
  if (loading) {
    return <LoadingSpinner message="جاري تحميل بيانات السائق..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={fetchDriver}
        onBack={() => navigate("/drivers")}
      />
    );
  }

  // No driver data
  if (!driver) {
    return (
      <ErrorMessage
        error="لم يتم العثور على السائق"
        onBack={() => navigate("/drivers")}
      />
    );
  }

  return (
    <div className="container mt-4">
      <ToastContainer position="top-left" rtl theme="light" />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/drivers")}
          >
            <FaArrowLeft className="me-2" />
            العودة للقائمة
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate(`/drivers/edit/${driver.id}`)}
          >
            <FaEdit className="me-2" />
            تعديل البيانات
          </button>
        </div>
        <h2 className="mb-0">تفاصيل السائق</h2>
      </div>

      {/* Status Badges */}
      <div className="mb-4">
        <span
          className={`badge ${
            driver.isApproved ? "bg-success" : "bg-warning"
          } me-2`}
        >
          {driver.isApproved ? "✓ معتمد" : "⏳ قيد المراجعة"}
        </span>
        <span
          className={`badge ${driver.isAvailable ? "bg-info" : "bg-secondary"}`}
        >
          {driver.isAvailable ? "🚗 متاح" : "🚫 غير متاح"}
        </span>
      </div>

      {/* Driver Info Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-4 col-md-6">
          <div className="card p-3 shadow-sm h-100">
            <div className="d-flex align-items-center">
              <div
                className="bg-primary bg-opacity-10 rounded p-2 me-3"
                style={{ width: "48px", height: "48px" }}
              >
                <span className="fs-4">👤</span>
              </div>
              <div>
                <small className="text-muted d-block">اسم السائق</small>
                <strong className="fs-5">{driver.name}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card p-3 shadow-sm h-100">
            <div className="d-flex align-items-center">
              <div
                className="bg-success bg-opacity-10 rounded p-2 me-3"
                style={{ width: "48px", height: "48px" }}
              >
                <span className="fs-4">📱</span>
              </div>
              <div>
                <small className="text-muted d-block">رقم الجوال</small>
                <strong className="fs-5">{driver.phone}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card p-3 shadow-sm h-100">
            <div className="d-flex align-items-center">
              <div
                className="bg-info bg-opacity-10 rounded p-2 me-3"
                style={{ width: "48px", height: "48px" }}
              >
                <span className="fs-4">🪪</span>
              </div>
              <div>
                <small className="text-muted d-block">رقم الرخصة</small>
                <strong className="fs-5">{driver.licenseNumber}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-6">
          <div className="card p-3 shadow-sm h-100">
            <div className="d-flex align-items-center">
              <div
                className="bg-warning bg-opacity-10 rounded p-2 me-3"
                style={{ width: "48px", height: "48px" }}
              >
                <span className="fs-4">📍</span>
              </div>
              <div>
                <small className="text-muted d-block">المنطقة</small>
                <strong className="fs-5">{driver.region}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-6">
          <div className="card p-3 shadow-sm h-100">
            <div className="d-flex align-items-center">
              <div
                className="bg-danger bg-opacity-10 rounded p-2 me-3"
                style={{ width: "48px", height: "48px" }}
              >
                <span className="fs-4">🏘️</span>
              </div>
              <div>
                <small className="text-muted d-block">الحي</small>
                <strong className="fs-5">{driver.area}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipments Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-lg-12">
          <div className="card p-3 shadow-sm bg-light">
            <div className="d-flex justify-content-around text-center">
              <div>
                <h3 className="mb-0 text-primary">{shipments.length}</h3>
                <small className="text-muted">إجمالي الشحنات</small>
              </div>
              <div className="vr"></div>
              <div>
                <h3 className="mb-0 text-secondary">
                  {shipments.filter((s) => s.status === "Pending").length}
                </h3>
                <small className="text-muted">قيد الإنشاء</small>
              </div>
              <div className="vr"></div>
              <div>
                <h3 className="mb-0 text-warning">
                  {shipments.filter((s) => s.status === "In Transit").length}
                </h3>
                <small className="text-muted">قيد التوصيل</small>
              </div>
              <div className="vr"></div>
              <div>
                <h3 className="mb-0 text-success">
                  {shipments.filter((s) => s.status === "Delivered").length}
                </h3>
                <small className="text-muted">تم التسليم</small>
              </div>
              <div className="vr"></div>
              <div>
                <h3 className="mb-0 text-danger">
                  {shipments.filter((s) => s.status === "Cancelled").length}
                </h3>
                <small className="text-muted">ملغاة</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="card p-4 shadow-sm">
        <h5 className="mb-3 text-end">
          الشحنات المسندة للسائق ({shipments.length})
        </h5>
        <DataTable
          columns={columns}
          data={shipments}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
          highlightOnHover
          striped
          responsive
          noDataComponent={
            <div className="text-center p-5">
              <div className="mb-3">
                <span style={{ fontSize: "48px" }}>📦</span>
              </div>
              <h5 className="text-muted">لا توجد شحنات</h5>
              <p className="text-muted">
                لا توجد شحنات مسندة لهذا السائق حالياً
              </p>
            </div>
          }
          paginationComponentOptions={{
            rowsPerPageText: "عدد الصفوف:",
            rangeSeparatorText: "من",
            noRowsPerPage: false,
            selectAllRowsItem: false,
          }}
          customStyles={{
            rows: {
              style: {
                minHeight: "60px",
              },
            },
            headCells: {
              style: {
                fontSize: "0.95rem",
                fontWeight: "bold",
                paddingLeft: "8px",
                paddingRight: "8px",
              },
            },
            cells: {
              style: {
                paddingLeft: "8px",
                paddingRight: "8px",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
