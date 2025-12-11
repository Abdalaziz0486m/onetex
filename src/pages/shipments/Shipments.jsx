import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from "react-icons/fa";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { Bounce, toast, ToastContainer } from "react-toastify";
import {
  getAllShipments,
  deleteShipment,
  mapShipmentData,
} from "../../services/shipmentService";

// Status mappings
const STATUS_TRANSLATIONS = {
  Pending: "قيد الإنشاء",
  "In Transit": "قيد التوصيل",
  Delivered: "تم التسليم",
  Cancelled: "ملغاة",
  "تم الإنشاء": "قيد الإنشاء",
  "في الطريق": "قيد التوصيل",
  "قيد التوصيل": "قيد التوصيل",
  "تم التسليم": "تم التسليم",
  ملغاة: "ملغاة",
  "تم الإلغاء": "ملغاة",
};

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch shipments from API using service
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllShipments();

      if (response.success) {
        const mappedShipments = response.data.map(mapShipmentData);
        setShipments(mappedShipments);
        setFilteredShipments(mappedShipments);
      } else {
        toast.error("فشل في جلب الشحنات");
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في الاتصال بالخادم";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Filter shipments based on search term and status
  useEffect(() => {
    let filtered = shipments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (shipment) =>
          shipment.trackingNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          shipment.sender?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          shipment.recipient?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          shipment.sender?.phone?.includes(searchTerm) ||
          shipment.recipient?.phone?.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(
        (shipment) => shipment.status === statusFilter
      );
    }

    setFilteredShipments(filtered);
  }, [shipments, searchTerm, statusFilter]);

  // Get status badge with proper styling
  const getStatusBadge = (status) => {
    const translatedStatus = STATUS_TRANSLATIONS[status] || status;

    switch (status) {
      case "Pending":
      case "تم الإنشاء":
        return <span className="badge bg-secondary">{translatedStatus}</span>;
      case "In Transit":
      case "في الطريق":
      case "قيد التوصيل":
        return (
          <span className="badge bg-warning text-dark">{translatedStatus}</span>
        );
      case "Delivered":
      case "تم التسليم":
        return <span className="badge bg-success">{translatedStatus}</span>;
      case "Cancelled":
      case "ملغاة":
      case "تم الإلغاء":
        return <span className="badge bg-danger">{translatedStatus}</span>;
      default:
        return (
          <span className="badge bg-light text-dark">{translatedStatus}</span>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Expandable Component for row details
  const ExpandedComponent = ({ data }) => (
    <div className="p-3 bg-light border-top">
      <div className="row g-3">
        <div className="col-md-6">
          <h6 className="text-primary mb-2 fw-bold">📦 معلومات المرسل</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>الاسم:</strong> {data.sender?.name || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>الجوال:</strong> {data.sender?.phone || "غير محدد"}
            </p>
            <p className="mb-0">
              <strong>المدينة:</strong>{" "}
              {data.sender?.address?.national?.city ||
                data.sender?.address?.shortCode ||
                "غير محدد"}
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <h6 className="text-success mb-2 fw-bold">📍 معلومات المستلم</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>الاسم:</strong> {data.recipient?.name || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>الجوال:</strong> {data.recipient?.phone || "غير محدد"}
            </p>
            <p className="mb-0">
              <strong>المدينة:</strong>{" "}
              {data.recipient?.address?.national?.city ||
                data.recipient?.address?.shortCode ||
                "غير محدد"}
            </p>
          </div>
        </div>
        <div className="col-12">
          <div className="d-flex flex-wrap gap-3 pt-2 border-top">
            <span>
              <strong>الحالة:</strong> {getStatusBadge(data.status)}
            </span>
            <span>
              <strong>تاريخ الإنشاء:</strong> {formatDate(data.createdAt)}
            </span>
            <span>
              <strong>تاريخ التحديث:</strong> {formatDate(data.updatedAt)}
            </span>
            {data.weight && (
              <span>
                <strong>الوزن:</strong> {data.weight} كجم
              </span>
            )}
            {data.shipmentType && (
              <span>
                <strong>نوع الشحنة:</strong> {data.shipmentType}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Table columns configuration - simplified for responsive
  const getColumns = () => {
    const allColumns = [
      {
        name: "رقم التتبع",
        selector: (row) => row.trackingNumber,
        sortable: true,
        width: "140px",
        cell: (row) => (
          <div className="d-flex align-items-center gap-2">
            {windowWidth > 768 && (
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                ⓘ
              </span>
            )}
            <span
              className="text-primary fw-bold"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/shipments/shipment/${row.trackingNumber}`)
              }
            >
              {row.trackingNumber}
            </span>
          </div>
        ),
      },
      {
        name: "المرسل → المستلم",
        cell: (row) => (
          <div style={{ fontSize: "0.875rem", lineHeight: "1.4" }}>
            <div className="fw-bold text-dark">
              {row.sender?.name || "غير محدد"}
            </div>
            <div className="text-muted small">
              <span>↓ </span>
              {row.recipient?.name || "غير محدد"}
            </div>
          </div>
        ),
        sortable: true,
        width: "250px", // ✅ استخدم width بدلاً من grow
        wrap: true,
      },
      // ✅ إضافة الأعمدة بشكل شرطي بدلاً من hide
      ...(windowWidth >= 768
        ? [
            {
              name: "الحالة",
              cell: (row) => getStatusBadge(row.status),
              sortable: true,
              width: "120px",
            },
          ]
        : []),
      ...(windowWidth >= 992
        ? [
            {
              name: "التاريخ",
              selector: (row) => formatDate(row.createdAt),
              sortable: true,
              width: "140px",
              wrap: true,
            },
          ]
        : []),
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
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                setSelectedShipment(row);
                setShowModal(true);
              }}
              title="حذف"
            >
              <FaTrash />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        width: "130px",
        // ✅ حذف right prop - سيتم محاذاته تلقائياً
      },
    ];

    return allColumns;
  };
  // Handle delete shipment using service
  const handleDelete = async () => {
    if (!selectedShipment) return;

    setDeleting(true);
    try {
      const response = await deleteShipment(selectedShipment.trackingNumber);

      if (response.success) {
        setShipments((prev) =>
          prev.filter((s) => s.id !== selectedShipment.id)
        );
        setShowModal(false);
        toast.success("تم حذف الشحنة بنجاح ✅");
      } else {
        toast.error(response.message || "فشل في حذف الشحنة");
      }
    } catch (error) {
      console.error("Error deleting shipment:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في حذف الشحنة";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(shipments.map((s) => s.status))];

  // Custom loading component
  const LoadingComponent = () => (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">جاري التحميل...</span>
      </div>
    </div>
  );

  // Custom no data component
  const NoDataComponent = () => (
    <div className="text-center p-5">
      <div className="mb-3">
        <FaSearch size={48} className="text-muted" />
      </div>
      <h5 className="text-muted">لا توجد شحنات</h5>
      <p className="text-muted">
        {searchTerm || statusFilter
          ? "لا توجد نتائج تطابق البحث"
          : "لم يتم إنشاء أي شحنات بعد"}
      </p>
      {!searchTerm && !statusFilter && (
        <button
          className="btn btn-primary mt-2"
          onClick={() => navigate("add")}
        >
          <FaPlus className="me-2" />
          إنشاء شحنة جديدة
        </button>
      )}
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="card p-4 mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => navigate("add")}>
              <FaPlus className="me-2" />
              إضافة شحنة
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={fetchShipments}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                "تحديث"
              )}
            </button>
          </div>
          <h2 className="mb-0 text-end">
            قائمة الشحنات ({filteredShipments.length})
          </h2>
        </div>

        {/* Filters */}
        <div className="row mb-4 g-3">
          <div className="col-lg-5 col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="البحث برقم التتبع، اسم المرسل، اسم المستلم، أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="col-lg-3 col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_TRANSLATIONS[status] || status}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-4 col-md-2 text-end">
            {statusFilter && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setStatusFilter("")}
              >
                مسح الفلتر
              </button>
            )}
          </div>
        </div>

        {/* Info Alert */}
        {windowWidth > 768 && (
          <div
            className="alert alert-info d-flex align-items-center gap-2 mb-3"
            style={{ fontSize: "0.9rem" }}
          >
            <span style={{ fontSize: "1.2rem" }}>💡</span>
            <span>
              اضغط على أي صف لعرض التفاصيل الكاملة (معلومات المرسل والمستلم
              والمدن)
            </span>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={getColumns()} // ✅ استخدم الدالة
          data={filteredShipments}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          responsive
          progressPending={loading}
          progressComponent={<LoadingComponent />}
          noDataComponent={<NoDataComponent />}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          expandOnRowClicked
          expandableRowsHideExpander={windowWidth > 768}
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
                cursor: windowWidth > 768 ? "pointer" : "default",
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

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedShipment(null);
          }}
          onConfirm={handleDelete}
          message={`هل تريد حذف الشحنة رقم: ${selectedShipment?.trackingNumber}؟`}
          confirmText="حذف"
          cancelText="إلغاء"
          loading={deleting}
          variant="danger"
        />

        {/* Toast Container */}
        <ToastContainer
          position="top-left"
          transition={Bounce}
          rtl
          theme="light"
        />
      </div>
    </div>
  );
}
