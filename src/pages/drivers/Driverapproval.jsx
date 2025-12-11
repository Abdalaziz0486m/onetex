import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaUserCheck,
  FaUserClock,
} from "react-icons/fa";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { Bounce, toast, ToastContainer } from "react-toastify";
import {
  getPendingDrivers,
  getApprovedDrivers,
  approveDriver,
  rejectDriver,
  mapDriverData,
} from "../../services/driverService";

export default function DriverApproval() {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [filteredPending, setFilteredPending] = useState([]);
  const [filteredApproved, setFilteredApproved] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(""); // "approve" or "reject"
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTermPending, setSearchTermPending] = useState("");
  const [searchTermApproved, setSearchTermApproved] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "approved"
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch pending drivers
  const fetchPendingDrivers = useCallback(async () => {
    setLoadingPending(true);
    try {
      const response = await getPendingDrivers();

      if (response.success) {
        const mappedDrivers = response.data.map(mapDriverData);
        setPendingDrivers(mappedDrivers);
        setFilteredPending(mappedDrivers);
      } else {
        toast.error("فشل في جلب السائقين المنتظرين");
      }
    } catch (error) {
      console.error("Error fetching pending drivers:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في الاتصال بالخادم";
      toast.error(errorMessage);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  // Fetch approved drivers
  const fetchApprovedDrivers = useCallback(async () => {
    setLoadingApproved(true);
    try {
      const response = await getApprovedDrivers();

      if (response.success) {
        const mappedDrivers = response.data.map(mapDriverData);
        setApprovedDrivers(mappedDrivers);
        setFilteredApproved(mappedDrivers);
      } else {
        toast.error("فشل في جلب السائقين الموافق عليهم");
      }
    } catch (error) {
      console.error("Error fetching approved drivers:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في الاتصال بالخادم";
      toast.error(errorMessage);
    } finally {
      setLoadingApproved(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingDrivers();
    fetchApprovedDrivers();
  }, [fetchPendingDrivers, fetchApprovedDrivers]);

  // Filter pending drivers based on search term
  useEffect(() => {
    let filtered = pendingDrivers;

    if (searchTermPending) {
      filtered = filtered.filter(
        (driver) =>
          driver.name
            ?.toLowerCase()
            .includes(searchTermPending.toLowerCase()) ||
          driver.phone?.includes(searchTermPending) ||
          driver.licenseNumber
            ?.toLowerCase()
            .includes(searchTermPending.toLowerCase()) ||
          driver.region
            ?.toLowerCase()
            .includes(searchTermPending.toLowerCase()) ||
          driver.area?.toLowerCase().includes(searchTermPending.toLowerCase())
      );
    }

    setFilteredPending(filtered);
  }, [pendingDrivers, searchTermPending]);

  // Filter approved drivers based on search term
  useEffect(() => {
    let filtered = approvedDrivers;

    if (searchTermApproved) {
      filtered = filtered.filter(
        (driver) =>
          driver.name
            ?.toLowerCase()
            .includes(searchTermApproved.toLowerCase()) ||
          driver.phone?.includes(searchTermApproved) ||
          driver.licenseNumber
            ?.toLowerCase()
            .includes(searchTermApproved.toLowerCase()) ||
          driver.region
            ?.toLowerCase()
            .includes(searchTermApproved.toLowerCase()) ||
          driver.area?.toLowerCase().includes(searchTermApproved.toLowerCase())
      );
    }

    setFilteredApproved(filtered);
  }, [approvedDrivers, searchTermApproved]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Expandable Component for row details (Pending Drivers)
  const ExpandedComponentPending = ({ data }) => (
    <div className="p-3 bg-light border-top">
      <div className="row g-3">
        <div className="col-md-6">
          <h6 className="text-primary mb-2 fw-bold">👤 معلومات السائق</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>الاسم:</strong> {data.name || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>الجوال:</strong> {data.phone || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>رقم الرخصة:</strong> {data.licenseNumber || "غير محدد"}
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <h6 className="text-success mb-2 fw-bold">📍 معلومات المنطقة</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>المنطقة:</strong> {data.region || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>الحي:</strong> {data.area || "غير محدد"}
            </p>
          </div>
        </div>
        <div className="col-12">
          <div className="d-flex flex-wrap gap-3 pt-2 border-top">
            <span>
              <strong>تاريخ التسجيل:</strong> {formatDate(data.createdAt)}
            </span>
            <span>
              <strong>الحالة:</strong>{" "}
              <span className="badge bg-warning text-dark">قيد الانتظار</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Expandable Component for row details (Approved Drivers)
  const ExpandedComponentApproved = ({ data }) => (
    <div className="p-3 bg-light border-top">
      <div className="row g-3">
        <div className="col-md-4">
          <h6 className="text-primary mb-2 fw-bold">👤 معلومات السائق</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>الاسم:</strong> {data.name || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>الجوال:</strong> {data.phone || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>رقم الرخصة:</strong> {data.licenseNumber || "غير محدد"}
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <h6 className="text-success mb-2 fw-bold">📍 معلومات المنطقة</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>المنطقة:</strong> {data.region || "غير محدد"}
            </p>
            <p className="mb-1">
              <strong>الحي:</strong> {data.area || "غير محدد"}
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <h6 className="text-info mb-2 fw-bold">✅ معلومات الموافقة</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>تمت الموافقة:</strong> {formatDate(data.approvedAt)}
            </p>
            <p className="mb-1">
              <strong>بواسطة:</strong> {data.approvedBy?.phone || "غير محدد"}
            </p>
          </div>
        </div>
        <div className="col-12">
          <div className="d-flex flex-wrap gap-3 pt-2 border-top">
            <span>
              <strong>تاريخ التسجيل:</strong> {formatDate(data.createdAt)}
            </span>
            <span>
              <strong>الحالة:</strong>{" "}
              <span className="badge bg-success">موافق عليه</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Pending Drivers Columns
  const pendingColumns = [
    {
      name: "الاسم",
      selector: (row) => row.name,
      sortable: true,
      width: windowWidth >= 768 ? "200px" : "150px",
      cell: (row) => (
        <div className="fw-bold text-dark">{row.name || "غير محدد"}</div>
      ),
    },
    {
      name: "الجوال",
      selector: (row) => row.phone,
      sortable: true,
      width: "140px",
      omit: windowWidth < 768,
    },
    {
      name: "رقم الرخصة",
      selector: (row) => row.licenseNumber,
      sortable: true,
      width: "140px",
      omit: windowWidth < 992,
    },
    {
      name: "المنطقة",
      selector: (row) => row.region,
      sortable: true,
      width: "120px",
      omit: windowWidth < 768,
    },
    {
      name: "التحكم",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => {
              setSelectedDriver(row);
              setModalAction("approve");
              setShowModal(true);
            }}
            title="الموافقة"
          >
            <FaCheck />
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setSelectedDriver(row);
              setModalAction("reject");
              setShowModal(true);
            }}
            title="الرفض"
          >
            <FaTimes />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      width: "100px",
    },
  ];

  // Approved Drivers Columns
  const approvedColumns = [
    {
      name: "الاسم",
      selector: (row) => row.name,
      sortable: true,
      width: windowWidth >= 768 ? "200px" : "150px",
      cell: (row) => (
        <div className="fw-bold text-dark">{row.name || "غير محدد"}</div>
      ),
    },
    {
      name: "الجوال",
      selector: (row) => row.phone,
      sortable: true,
      width: "140px",
      omit: windowWidth < 768,
    },
    {
      name: "رقم الرخصة",
      selector: (row) => row.licenseNumber,
      sortable: true,
      width: "140px",
      omit: windowWidth < 992,
    },
    {
      name: "المنطقة",
      selector: (row) => row.region,
      sortable: true,
      width: "120px",
      omit: windowWidth < 768,
    },
    {
      name: "تاريخ الموافقة",
      selector: (row) => formatDate(row.approvedAt),
      sortable: true,
      width: "160px",
      omit: windowWidth < 992,
    },
    {
      name: "الحالة",
      cell: () => <span className="badge bg-success">موافق عليه</span>,
      width: "120px",
      omit: windowWidth < 768,
    },
  ];

  // Handle approve/reject driver
  const handleAction = async () => {
    if (!selectedDriver) return;

    setActionLoading(true);
    try {
      let response;
      if (modalAction === "approve") {
        response = await approveDriver(selectedDriver.id);
      } else {
        response = await rejectDriver(selectedDriver.id);
      }

      if (response.success) {
        // Refresh both lists
        await fetchPendingDrivers();
        await fetchApprovedDrivers();

        setShowModal(false);
        const successMessage =
          modalAction === "approve"
            ? "تمت الموافقة على السائق بنجاح ✅"
            : "تم رفض السائق بنجاح ❌";
        toast.success(successMessage);
      } else {
        toast.error(response.message || "فشلت العملية");
      }
    } catch (error) {
      console.error("Error handling driver action:", error);
      const errorMessage = error?.message || error?.error || "خطأ في العملية";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Custom loading component
  const LoadingComponent = () => (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">جاري التحميل...</span>
      </div>
    </div>
  );

  // Custom no data component
  const NoDataComponent = ({ message }) => (
    <div className="text-center p-5">
      <div className="mb-3">
        <FaSearch size={48} className="text-muted" />
      </div>
      <h5 className="text-muted">{message}</h5>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="card p-4 mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                fetchPendingDrivers();
                fetchApprovedDrivers();
              }}
              disabled={loadingPending || loadingApproved}
            >
              {loadingPending || loadingApproved ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                "تحديث"
              )}
            </button>
          </div>
          <h2 className="mb-0 text-end">إدارة موافقات السائقين</h2>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4 g-3">
          <div className="col-md-6">
            <div className="card border-warning">
              <div className="card-body text-center">
                <FaUserClock size={32} className="text-warning mb-2" />
                <h3 className="mb-0">{filteredPending.length}</h3>
                <p className="text-muted mb-0">سائق منتظر الموافقة</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-success">
              <div className="card-body text-center">
                <FaUserCheck size={32} className="text-success mb-2" />
                <h3 className="mb-0">{filteredApproved.length}</h3>
                <p className="text-muted mb-0">سائق موافق عليه</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              <FaUserClock className="me-2" />
              السائقين المنتظرين ({filteredPending.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "approved" ? "active" : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              <FaUserCheck className="me-2" />
              السائقين الموافق عليهم ({filteredApproved.length})
            </button>
          </li>
        </ul>

        {/* Pending Drivers Tab */}
        {activeTab === "pending" && (
          <>
            {/* Search Bar */}
            <div className="row mb-3">
              <div className="col-lg-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="البحث بالاسم، الجوال، رقم الرخصة، المنطقة..."
                    value={searchTermPending}
                    onChange={(e) => setSearchTermPending(e.target.value)}
                  />
                  {searchTermPending && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTermPending("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Alert */}
            {windowWidth > 768 && (
              <div
                className="alert alert-warning d-flex align-items-center gap-2 mb-3"
                style={{ fontSize: "0.9rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                <span>
                  هؤلاء السائقين بانتظار الموافقة. يرجى مراجعة بياناتهم قبل
                  الموافقة أو الرفض.
                </span>
              </div>
            )}

            {/* Data Table */}
            <DataTable
              columns={pendingColumns}
              data={filteredPending}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50]}
              highlightOnHover
              striped
              responsive
              progressPending={loadingPending}
              progressComponent={<LoadingComponent />}
              noDataComponent={
                <NoDataComponent message="لا يوجد سائقين منتظرين" />
              }
              expandableRows
              expandableRowsComponent={ExpandedComponentPending}
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
          </>
        )}

        {/* Approved Drivers Tab */}
        {activeTab === "approved" && (
          <>
            {/* Search Bar */}
            <div className="row mb-3">
              <div className="col-lg-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="البحث بالاسم، الجوال، رقم الرخصة، المنطقة..."
                    value={searchTermApproved}
                    onChange={(e) => setSearchTermApproved(e.target.value)}
                  />
                  {searchTermApproved && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTermApproved("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Alert */}
            {windowWidth > 768 && (
              <div
                className="alert alert-success d-flex align-items-center gap-2 mb-3"
                style={{ fontSize: "0.9rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>✅</span>
                <span>
                  هؤلاء السائقين تمت الموافقة عليهم ويمكنهم استلام الشحنات.
                </span>
              </div>
            )}

            {/* Data Table */}
            <DataTable
              columns={approvedColumns}
              data={filteredApproved}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50]}
              highlightOnHover
              striped
              responsive
              progressPending={loadingApproved}
              progressComponent={<LoadingComponent />}
              noDataComponent={
                <NoDataComponent message="لا يوجد سائقين موافق عليهم" />
              }
              expandableRows
              expandableRowsComponent={ExpandedComponentApproved}
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
          </>
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedDriver(null);
            setModalAction("");
          }}
          onConfirm={handleAction}
          message={
            modalAction === "approve"
              ? `هل تريد الموافقة على السائق: ${selectedDriver?.name}؟`
              : `هل تريد رفض السائق: ${selectedDriver?.name}؟`
          }
          confirmText={modalAction === "approve" ? "موافقة" : "رفض"}
          cancelText="إلغاء"
          loading={actionLoading}
          variant={modalAction === "approve" ? "success" : "danger"}
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
