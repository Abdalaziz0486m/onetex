import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaEye, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useNavigate } from "react-router-dom";

// Import driver service
import {
  getAllDrivers,
  deleteDriver,
  mapDriverData,
} from "../../services/driverService";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const navigate = useNavigate();

  // جلب البيانات من API باستخدام الـ service
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllDrivers();

      if (response.success || Array.isArray(response)) {
        const driversData = response.data || response;
        const mappedDrivers = driversData.map(mapDriverData);
        setDrivers(mappedDrivers);
        setFilteredDrivers(mappedDrivers);
      } else {
        toast.error("فشل في جلب بيانات السائقين");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في الاتصال بالخادم";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Filter drivers based on search term and region
  useEffect(() => {
    let filtered = drivers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (driver) =>
          driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.phone?.includes(searchTerm) ||
          driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by region
    if (regionFilter) {
      filtered = filtered.filter((driver) => driver.region === regionFilter);
    }

    setFilteredDrivers(filtered);
  }, [drivers, searchTerm, regionFilter]);

  // حذف سائق باستخدام الـ service
  const handleDelete = async () => {
    if (!selectedDriver) return;

    setDeleting(true);
    try {
      const response = await deleteDriver(selectedDriver.id);

      if (response.success || response.message) {
        setDrivers((prev) => prev.filter((d) => d.id !== selectedDriver.id));
        setShowModal(false);
        toast.success("تم حذف السائق بنجاح");
      } else {
        toast.error(response.message || "فشل في حذف السائق");
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
      const errorMessage =
        error?.message || error?.error || "فشل في حذف السائق";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Get unique regions for filter
  const uniqueRegions = [...new Set(drivers.map((d) => d.region))].filter(
    Boolean
  );

  const columns = [
    {
      name: "الاسم",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "رقم الجوال",
      selector: (row) => row.phone,
      sortable: true,
      width: "130px",
    },
    {
      name: "رقم الرخصة",
      selector: (row) => row.licenseNumber,
      sortable: true,
      width: "140px",
    },
    {
      name: "المنطقة",
      selector: (row) => row.region,
      sortable: true,
      wrap: true,
    },
    {
      name: "الحي",
      selector: (row) => row.area,
      sortable: true,
      wrap: true,
    },
    {
      name: "التحكم",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => navigate(`driver/${row.id}`)}
            title="عرض التفاصيل"
          >
            <FaEye />
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`edit/${row.id}`)}
            title="تعديل"
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setSelectedDriver(row);
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
      right: true,
    },
  ];

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
      <h5 className="text-muted">لا توجد بيانات</h5>
      <p className="text-muted">
        {searchTerm || regionFilter
          ? "لا توجد نتائج تطابق البحث"
          : "لم يتم إضافة أي سائقين بعد"}
      </p>
      {!searchTerm && !regionFilter && (
        <button
          className="btn btn-primary mt-2"
          onClick={() => navigate("add")}
        >
          <FaPlus className="me-2" />
          إضافة سائق جديد
        </button>
      )}
    </div>
  );

  return (
    <div className="container-fluid p-4">
      <ToastContainer position="top-left" rtl theme="light" />

      <div className="card p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => navigate("add")}>
              <FaPlus className="me-2" />
              إضافة سائق
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={fetchDrivers}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                "تحديث"
              )}
            </button>
          </div>
          <h2 className="mb-0">السائقين ({filteredDrivers.length})</h2>
        </div>

        {/* Filters */}
        <div className="row mb-4 g-3">
          <div className="col-lg-6 col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="البحث بالاسم، رقم الجوال، أو رقم الرخصة..."
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
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="">جميع المناطق</option>
              {uniqueRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-3 col-md-2 text-end">
            {(searchTerm || regionFilter) && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setRegionFilter("");
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
          data={filteredDrivers}
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

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedDriver(null);
          }}
          onConfirm={handleDelete}
          message={`هل تريد حذف السائق: ${selectedDriver?.name}؟`}
          confirmText="حذف"
          cancelText="إلغاء"
          loading={deleting}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default Drivers;
