import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaUserShield,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { Bounce, toast, ToastContainer } from "react-toastify";

// Import user service
import {
  getAllUsers,
  deleteUser,
  getRoleBadge as getRoleInfo,
  getUserTypeLabel,
  getUserTypeIcon,
  roles,
  userTypes,
} from "../../services/userService";

// Role translations
const ROLE_TRANSLATIONS = {
  user: "مستخدم",
  admin: "مدير",
  driver: "سائق",
};

// UserType translations
const USER_TYPE_TRANSLATIONS = {
  individual: "فردي",
  company: "شركة",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();

      // Handle different response structures
      let usersData = [];

      if (Array.isArray(response)) {
        // Response is array of {user, shipments}
        usersData = response.map((item) => ({
          id: item.user._id,
          phone: item.user.phone,
          role: item.user.role,
          userType: item.user.userType,
          isVerified: item.user.isVerified,
          storeName: item.user.storeName,
          officialName: item.user.officialName,
          commercialRegistrationNumber: item.user.commercialRegistrationNumber,
          createdAt: item.user.createdAt,
          updatedAt: item.user.updatedAt,
          shipmentsCount: item.shipments?.length || 0,
          shipments: item.shipments || [],
        }));
      } else if (response.success && response.data) {
        // Response has success flag
        usersData = response.data.map((item) => ({
          id: item.user._id,
          phone: item.user.phone,
          role: item.user.role,
          userType: item.user.userType,
          isVerified: item.user.isVerified,
          storeName: item.user.storeName,
          officialName: item.user.officialName,
          commercialRegistrationNumber: item.user.commercialRegistrationNumber,
          createdAt: item.user.createdAt,
          updatedAt: item.user.updatedAt,
          shipmentsCount: item.shipments?.length || 0,
          shipments: item.shipments || [],
        }));
      }

      setUsers(usersData);
      setFilteredUsers(usersData);

      if (usersData.length > 0) {
        toast.success(`تم تحميل ${usersData.length} مستخدم بنجاح ✅`);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في الاتصال بالخادم";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term, role, userType, and verification status
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.officialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.commercialRegistrationNumber?.includes(searchTerm)
      );
    }

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by user type
    if (userTypeFilter) {
      filtered = filtered.filter((user) => user.userType === userTypeFilter);
    }

    // Filter by verification status
    if (verificationFilter === "verified") {
      filtered = filtered.filter((user) => user.isVerified === true);
    } else if (verificationFilter === "unverified") {
      filtered = filtered.filter((user) => user.isVerified === false);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, userTypeFilter, verificationFilter]);

  // Get role badge with proper styling
  const getRoleBadge = (role) => {
    const translatedRole = ROLE_TRANSLATIONS[role] || role;

    switch (role) {
      case "admin":
        return (
          <span className="badge bg-danger">
            <FaUserShield className="me-1" />
            {translatedRole}
          </span>
        );
      case "driver":
        return (
          <span className="badge bg-warning text-dark">
            <FaTruck className="me-1" />
            {translatedRole}
          </span>
        );
      case "user":
        return (
          <span className="badge bg-primary">
            <FaUser className="me-1" />
            {translatedRole}
          </span>
        );
      default:
        return <span className="badge bg-secondary">{translatedRole}</span>;
    }
  };

  // Get verification badge
  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <span className="badge bg-success">مفعّل ✓</span>
    ) : (
      <span className="badge bg-secondary">غير مفعّل</span>
    );
  };

  // Get user type badge
  const getUserTypeBadge = (userType) => {
    const translatedType = USER_TYPE_TRANSLATIONS[userType] || userType;

    return userType === "company" ? (
      <span className="badge bg-info text-dark">🏢 {translatedType}</span>
    ) : (
      <span className="badge bg-light text-dark">👤 {translatedType}</span>
    );
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
          <h6 className="text-primary mb-2 fw-bold">👤 معلومات المستخدم</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>رقم الهاتف:</strong> {data.phone}
            </p>
            <p className="mb-1">
              <strong>الصلاحية:</strong> {getRoleBadge(data.role)}
            </p>
            <p className="mb-1">
              <strong>النوع:</strong> {getUserTypeBadge(data.userType)}
            </p>
            <p className="mb-0">
              <strong>الحالة:</strong> {getVerificationBadge(data.isVerified)}
            </p>
          </div>
        </div>

        {data.userType === "company" && (
          <div className="col-md-6">
            <h6 className="text-success mb-2 fw-bold">🏢 معلومات الشركة</h6>
            <div className="ps-2">
              <p className="mb-1">
                <strong>اسم المتجر:</strong> {data.storeName || "غير محدد"}
              </p>
              <p className="mb-1">
                <strong>الاسم الرسمي:</strong> {data.officialName || "غير محدد"}
              </p>
              <p className="mb-0">
                <strong>رقم السجل التجاري:</strong>{" "}
                {data.commercialRegistrationNumber || "غير محدد"}
              </p>
            </div>
          </div>
        )}

        <div className="col-md-6">
          <h6 className="text-info mb-2 fw-bold">📦 إحصائيات الشحنات</h6>
          <div className="ps-2">
            <p className="mb-1">
              <strong>عدد الشحنات:</strong>{" "}
              <span className="badge bg-primary">{data.shipmentsCount}</span>
            </p>
            {data.shipmentsCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => navigate(`/users/${data.id}`)}
              >
                <FaEye className="me-1" />
                عرض الشحنات
              </button>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="d-flex flex-wrap gap-3 pt-2 border-top">
            <span>
              <strong>تاريخ التسجيل:</strong> {formatDate(data.createdAt)}
            </span>
            <span>
              <strong>آخر تحديث:</strong> {formatDate(data.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Table columns configuration - with conditional rendering based on windowWidth
  const getColumns = () => {
    const allColumns = [
      {
        name: "رقم الهاتف",
        selector: (row) => row.phone,
        sortable: true,
        width: "140px",
        cell: (row) => (
          <div className="d-flex align-items-center gap-2">
            <span
              className="text-primary fw-bold"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/users/${row.id}`)}
            >
              {row.phone}
            </span>
          </div>
        ),
      },
      {
        name: "الاسم / المتجر",
        cell: (row) => (
          <div style={{ fontSize: "0.875rem", lineHeight: "1.4" }}>
            {row.userType === "company" ? (
              <>
                <div className="fw-bold text-dark">
                  {row.storeName || "غير محدد"}
                </div>
                <div className="text-muted small">
                  {row.officialName || "غير محدد"}
                </div>
              </>
            ) : (
              <div className="text-muted">مستخدم فردي</div>
            )}
          </div>
        ),
        sortable: true,
        grow: 2,
        wrap: true,
      },
      {
        name: "الصلاحية",
        cell: (row) => getRoleBadge(row.role),
        sortable: true,
        width: "130px",
      },
      {
        name: "النوع",
        cell: (row) => getUserTypeBadge(row.userType),
        sortable: true,
        width: "110px",
        hide: windowWidth < 992,
      },
      {
        name: "الحالة",
        cell: (row) => getVerificationBadge(row.isVerified),
        sortable: true,
        width: "110px",
        hide: windowWidth < 1200,
      },
      {
        name: "الشحنات",
        selector: (row) => row.shipmentsCount,
        sortable: true,
        width: "90px",
        cell: (row) => (
          <span className="badge bg-info text-dark">{row.shipmentsCount}</span>
        ),
        hide: windowWidth < 1400,
      },
      {
        name: "التاريخ",
        selector: (row) => formatDate(row.createdAt),
        sortable: true,
        width: "150px",
        wrap: true,
        hide: windowWidth < 1600,
      },
      {
        name: "التحكم",
        cell: (row) => (
          <div className="d-flex gap-1">
            <button
              className="btn btn-outline-info btn-sm"
              onClick={() => navigate(`/users/${row.id}`)}
              title="عرض التفاصيل"
            >
              <FaEye />
            </button>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate(`/users/edit/${row.id}`)}
              title="تعديل"
            >
              <FaEdit />
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                setSelectedUser(row);
                setShowModal(true);
              }}
              title="حذف"
              disabled={row.role === "admin"}
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

    return allColumns;
  };

  // Handle delete user
  const handleDelete = async () => {
    if (!selectedUser) return;

    // Prevent deleting admin users
    if (selectedUser.role === "admin") {
      toast.error("لا يمكن حذف مستخدم بصلاحية مدير");
      return;
    }

    setDeleting(true);
    try {
      const response = await deleteUser(selectedUser.id);

      if (response.success || response.message) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setShowModal(false);
        toast.success("تم حذف المستخدم بنجاح ✅");
      } else {
        toast.error(response.message || "فشل في حذف المستخدم");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error?.message || error?.error || "خطأ في حذف المستخدم";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
      setSelectedUser(null);
    }
  };

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(users.map((u) => u.role))].filter(Boolean);

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
      <h5 className="text-muted">لا توجد مستخدمين</h5>
      <p className="text-muted">
        {searchTerm || roleFilter || userTypeFilter || verificationFilter
          ? "لا توجد نتائج تطابق البحث"
          : "لم يتم تسجيل أي مستخدمين بعد"}
      </p>
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
              onClick={fetchUsers}
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
            قائمة المستخدمين ({filteredUsers.length})
          </h2>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4 g-3">
          <div className="col-lg-3 col-md-6">
            <div className="card bg-primary bg-opacity-10 border-primary">
              <div className="card-body text-center">
                <div className="fs-2 text-primary">👥</div>
                <h6 className="card-title text-muted mb-1">
                  إجمالي المستخدمين
                </h6>
                <h3 className="mb-0 text-primary">{users.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card bg-success bg-opacity-10 border-success">
              <div className="card-body text-center">
                <div className="fs-2 text-success">✓</div>
                <h6 className="card-title text-muted mb-1">مفعّلين</h6>
                <h3 className="mb-0 text-success">
                  {users.filter((u) => u.isVerified).length}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card bg-warning bg-opacity-10 border-warning">
              <div className="card-body text-center">
                <div className="fs-2">🚗</div>
                <h6 className="card-title text-muted mb-1">سائقين</h6>
                <h3 className="mb-0 text-dark">
                  {users.filter((u) => u.role === "driver").length}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card bg-info bg-opacity-10 border-info">
              <div className="card-body text-center">
                <div className="fs-2">🏢</div>
                <h6 className="card-title text-muted mb-1">شركات</h6>
                <h3 className="mb-0 text-dark">
                  {users.filter((u) => u.userType === "company").length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4 g-3">
          <div className="col-lg-4 col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="البحث برقم الهاتف، اسم المتجر، أو رقم السجل التجاري..."
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

          <div className="col-lg-2 col-md-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">جميع الصلاحيات</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_TRANSLATIONS[role] || role}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-3">
            <select
              className="form-select"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
            >
              <option value="">جميع الأنواع</option>
              <option value="individual">فردي</option>
              <option value="company">شركة</option>
            </select>
          </div>

          <div className="col-lg-2 col-md-3">
            <select
              className="form-select"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="verified">مفعّل</option>
              <option value="unverified">غير مفعّل</option>
            </select>
          </div>

          <div className="col-lg-2 col-md-3">
            {(searchTerm ||
              roleFilter ||
              userTypeFilter ||
              verificationFilter) && (
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                  setUserTypeFilter("");
                  setVerificationFilter("");
                }}
              >
                مسح الفلاتر
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
              اضغط على أي صف لعرض التفاصيل الكاملة (معلومات المستخدم والشحنات)
            </span>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={getColumns()}
          data={filteredUsers}
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
            setSelectedUser(null);
          }}
          onConfirm={handleDelete}
          message={
            selectedUser?.role === "admin"
              ? "لا يمكن حذف مستخدم بصلاحية مدير"
              : `هل تريد حذف المستخدم: ${selectedUser?.phone}؟`
          }
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
