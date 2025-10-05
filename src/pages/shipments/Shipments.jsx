import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from "react-icons/fa";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { Bounce, toast, ToastContainer } from "react-toastify";
import axios from "axios";

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
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  // Fetch shipments from API
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}api/shipments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

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
          updatedAt: shipment.updatedAt,
        }));

        setShipments(mappedShipments);
        setFilteredShipments(mappedShipments);
      } else {
        toast.error("فشل في جلب الشحنات");
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("خطأ في الاتصال بالخادم");
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

  // Table columns configuration
  const columns = [
    {
      name: "رقم التتبع",
      selector: (row) => row.trackingNumber,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <span
          className="text-primary fw-bold"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/shipments/shipment/${row.trackingNumber}`)}
        >
          {row.trackingNumber}
        </span>
      ),
    },
    {
      name: "اسم المرسل",
      selector: (row) => row.sender?.name,
      sortable: true,
      width: "120px",
    },
    {
      name: "جوال المرسل",
      selector: (row) => row.sender?.phone,
      width: "120px",
    },
    {
      name: "مدينة المرسل",
      selector: (row) =>
        row.sender?.address?.national?.city || row.sender?.address?.shortCode,
      width: "120px",
    },
    {
      name: "اسم المستلم",
      selector: (row) => row.recipient?.name,
      sortable: true,
      width: "120px",
    },
    {
      name: "جوال المستلم",
      selector: (row) => row.recipient?.phone,
      width: "120px",
    },
    {
      name: "مدينة المستلم",
      selector: (row) =>
        row.recipient?.address?.national?.city ||
        row.recipient?.address?.shortCode,
      width: "120px",
    },
    {
      name: "حالة الشحنة",
      cell: (row) => getStatusBadge(row.status),
      sortable: true,
      width: "120px",
    },
    {
      name: "تاريخ الإنشاء",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
      width: "140px",
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
      width: "140px",
    },
  ];

  // Handle delete shipment
  const handleDelete = async () => {
    if (!selectedShipment) return;

    setDeleting(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/shipments/${selectedShipment.trackingNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Remove from local state
        setShipments((prev) =>
          prev.filter((s) => s.id !== selectedShipment.id)
        );
        setShowModal(false);
        toast.success("تم حذف الشحنة بنجاح ✅");
      } else {
        toast.error(response.data.message || "فشل في حذف الشحنة");
      }
    } catch (error) {
      console.error("Error deleting shipment:", error);
      const errorMessage = error.response?.data?.message || "خطأ في حذف الشحنة";
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
        <div className="d-flex justify-content-between align-items-center mb-4">
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
        <div className="row mb-4">
          <div className="col-md-6">
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
            </div>
          </div>
          <div className="col-md-3">
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
          <div className="col-md-3 text-end">
            {(searchTerm || statusFilter) && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                }}
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
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
          paginationComponentOptions={{
            rowsPerPageText: "عدد الصفوف:",
            rangeSeparatorText: "من",
            noRowsPerPage: false,
            selectAllRowsItem: false,
          }}
          // customStyles={{
          //   headRow: {
          //     style: {
          //       backgroundColor: "#f8f9fa",
          //       borderBottom: "2px solid #dee2e6",
          //     },
          //   },
          //   headCells: {
          //     style: {
          //       fontSize: "14px",
          //       fontWeight: "600",
          //       textAlign: "right",
          //       paddingRight: "16px",
          //     },
          //   },
          //   cells: {
          //     style: {
          //       textAlign: "right",
          //       paddingRight: "16px",
          //       fontSize: "13px",
          //     },
          //   },
          // }}
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
