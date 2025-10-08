import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { FaEye, FaUserPlus, FaSearch, FaTruck } from "react-icons/fa";
import { Bounce, toast, ToastContainer } from "react-toastify";
import axios from "axios";
import DriverAssignmentModal from "../../components/shipment/DriverAssignmentModal";

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

export default function UnassignedShipments() {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch unassigned shipments
  const fetchUnassignedShipments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shipments/unassigned`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const mappedShipments = response.data.data.map((shipment) => ({
          id: shipment._id,
          trackingNumber: shipment.trackingNumber,
          sender: shipment.sender,
          recipient: shipment.recipient,
          status: shipment.status,
          shipmentType: shipment.shipmentType,
          weight: shipment.weight,
          createdAt: shipment.createdAt,
        }));

        setShipments(mappedShipments);
        setFilteredShipments(mappedShipments);
      } else {
        toast.error("فشل في جلب الشحنات غير المعينة");
      }
    } catch (error) {
      console.error("Error fetching unassigned shipments:", error);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Fetch available drivers
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}api/drivers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const driversData = response.data.success
        ? response.data.data
        : response.data;
      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("خطأ في جلب السائقين");
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchUnassignedShipments();
    fetchDrivers();
  }, [fetchUnassignedShipments, fetchDrivers]);

  // Filter shipments based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = shipments.filter(
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
      setFilteredShipments(filtered);
    } else {
      setFilteredShipments(shipments);
    }
  }, [shipments, searchTerm]);

  // Get status badge
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

  // Format date
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

  // Handle assign driver
  const handleAssignDriver = async (driverId) => {
    if (!selectedShipment || !driverId) {
      toast.error("الرجاء اختيار سائق");
      return;
    }

    setAssigning(true);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}api/shipments/${selectedShipment.trackingNumber}/assign-driver`,
        { driverId: driverId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setShipments((prev) =>
          prev.filter((s) => s.id !== selectedShipment.id)
        );
        setShowAssignModal(false);
        setSelectedShipment(null);
        toast.success("تم تعيين السائق بنجاح ✅");
      } else {
        toast.error(response.data.message || "فشل في تعيين السائق");
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      const errorMessage =
        error.response?.data?.message || "خطأ في تعيين السائق";
      toast.error(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  // Expandable Component for row details
  const ExpandedComponent = ({ data }) => (
    <div className="p-3 card border-top">
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

  // Table columns - simplified for responsive
  const columns = [
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
          <div className="fw-bold ">
            {row.sender?.name || "غير محدد"}
          </div>
          <div className="text-muted small">
            <span>↓ </span>
            {row.recipient?.name || "غير محدد"}
          </div>
        </div>
      ),
      sortable: true,
      grow: 2,
      wrap: true,
    },
    {
      name: "الحالة",
      cell: (row) => getStatusBadge(row.status),
      sortable: true,
      width: "120px",
      hide: windowWidth < 768,
    },
    {
      name: "التاريخ",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
      width: "140px",
      hide: windowWidth < 992,
      wrap: true,
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
            className="btn btn-outline-success btn-sm"
            onClick={() => {
              setSelectedShipment(row);
              setShowAssignModal(true);
            }}
            title="تعيين سائق"
          >
            <FaUserPlus />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      width: "100px",
      right: true,
    },
  ];

  // Loading component
  const LoadingComponent = () => (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">جاري التحميل...</span>
      </div>
    </div>
  );

  // No data component
  const NoDataComponent = () => (
    <div className="text-center p-5">
      <div className="mb-3">
        <FaTruck size={48} className="text-muted" />
      </div>
      <h5 className="text-muted">لا توجد شحنات غير معينة</h5>
      <p className="text-muted">
        {searchTerm
          ? "لا توجد نتائج تطابق البحث"
          : "جميع الشحنات تم تعيينها لسائقين"}
      </p>
    </div>
  );

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={fetchUnassignedShipments}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : (
            "تحديث"
          )}
        </button>
        <h2 className="mb-0 text-end">
          الشحنات غير المعينة ({filteredShipments.length})
        </h2>
      </div>

      {/* Search */}
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-md-8 col-lg-6">
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
        </div>
      </div>

      {/* Data Table */}
      <div className="card shadow-sm">
        {windowWidth > 768 && (
          <div
            className="alert alert-info m-3 mb-0 d-flex align-items-center gap-2"
            style={{ fontSize: "0.9rem" }}
          >
            <span style={{ fontSize: "1.2rem" }}>💡</span>
            <span>
              اضغط على أي صف لعرض التفاصيل الكاملة (معلومات المرسل والمستلم
              والمدن)
            </span>
          </div>
        )}
        <DataTable
          columns={columns}
          data={filteredShipments}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          responsive
          striped
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
      </div>

      {/* Assign Driver Modal */}
      <DriverAssignmentModal
        show={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedShipment(null);
        }}
        onAssign={handleAssignDriver}
        loading={assigning}
      />

      {/* Toast Container */}
      <ToastContainer
        position="top-left"
        transition={Bounce}
        rtl
        theme="light"
      />
    </div>
  );
}
