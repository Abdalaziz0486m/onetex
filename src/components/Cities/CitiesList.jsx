// src/components/Cities/CitiesList.jsx
import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaMapMarkerAlt,
  FaRoute,
} from "react-icons/fa";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import CityModal from "./CityModal";
import {
  getAllCities,
  deleteCity,
  formatCityType,
  filterCitiesByName,
  sortCitiesByPriority,
} from "../../services/cityService";

export default function CitiesList() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllCities();
      setCities(response.data || []);
    } catch (err) {
      console.error("Error loading cities:", err);
      setError("فشل تحميل المدن. حاول مرة أخرى.");
      toast.error("فشل تحميل المدن");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = () => {
    setSelectedCity(null);
    setShowModal(true);
  };

  const handleEditCity = (city) => {
    setSelectedCity(city);
    setShowModal(true);
  };

  const handleDeleteCity = async (city) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف مدينة "${city.name}"؟\n\nسيتم حذف المدينة نهائياً ولا يمكن التراجع عن هذا الإجراء.`
    );

    if (confirmed) {
      try {
        await deleteCity(city._id);
        toast.success("تم حذف المدينة بنجاح");
        loadCities();
      } catch (error) {
        console.error("Error deleting city:", error);
        toast.error("فشل حذف المدينة");
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCity(null);
  };

  const handleModalSuccess = () => {
    loadCities();
    toast.success(
      selectedCity ? "تم تحديث المدينة بنجاح" : "تم إضافة المدينة بنجاح"
    );
  };

  const getRoutesCount = (city) => {
    return city.shippingTo ? Object.keys(city.shippingTo).length : 0;
  };

  const getBadgeClass = (type) => {
    const variants = {
      capital: "bg-danger",
      holy_city: "bg-success",
      major_city: "bg-primary",
      city: "bg-secondary",
    };
    return variants[type] || "bg-secondary";
  };

  // تصفية وترتيب المدن
  const filteredCities = useMemo(() => {
    const filtered = filterCitiesByName(cities, searchTerm);
    return sortCitiesByPriority(filtered);
  }, [cities, searchTerm]);

  // تعريف الأعمدة
  const columns = useMemo(
    () => [
      {
        name: "الاسم",
        selector: (row) => row.name,
        sortable: true,
        cell: (row) => <strong>{row.name}</strong>,
        width: "150px",
      },
      {
        name: "الاسم الإنجليزي",
        selector: (row) => row.nameEn,
        sortable: true,
        width: "150px",
      },
      {
        name: "المنطقة",
        selector: (row) => row.region,
        sortable: true,
        width: "120px",
      },
      {
        name: "النوع",
        selector: (row) => row.type,
        sortable: true,
        cell: (row) => (
          <span className={`badge ${getBadgeClass(row.type)}`}>
            {formatCityType(row.type)}
          </span>
        ),
        width: "130px",
      },
      {
        name: "التوصيل المحلي",
        cell: (row) => (
          <div style={{ fontSize: "0.85rem" }}>
            <div>صغير: {row.localDelivery?.small} ر.س</div>
            <div>متوسط: {row.localDelivery?.medium} ر.س</div>
            <div>كبير: {row.localDelivery?.large} ر.س</div>
          </div>
        ),
        width: "180px",
      },
      {
        name: "المسارات",
        selector: (row) => getRoutesCount(row),
        sortable: true,
        cell: (row) => (
          <span className="badge bg-info">
            <FaRoute className="me-1" />
            {getRoutesCount(row)} مسار
          </span>
        ),
        center: true,
        width: "120px",
      },
      {
        name: "الحالة",
        selector: (row) => row.isActive,
        sortable: true,
        cell: (row) =>
          row.isActive ? (
            <span className="badge bg-success">نشطة</span>
          ) : (
            <span className="badge bg-secondary">معطلة</span>
          ),
        center: true,
        width: "100px",
      },
      {
        name: "إجراءات",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleEditCity(row)}
              title="تعديل"
            >
              <FaEdit />
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDeleteCity(row)}
              title="حذف"
            >
              <FaTrash />
            </button>
          </div>
        ),
        center: true,
        width: "120px",
      },
    ],
    []
  );

  // التنسيقات المخصصة
  const customStyles = {
    table: {
      style: {
        backgroundColor: "transparent",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f8f9fa",
        borderBottom: "2px solid #dee2e6",
        minHeight: "52px",
      },
    },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#495057",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        minHeight: "72px",
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "#f8f9fa",
          cursor: "pointer",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
  };

  // رسالة عدم وجود بيانات
  const NoDataComponent = () => (
    <div className="text-center py-5 text-muted">
      {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مدن مضافة بعد"}
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-3">
            <FaMapMarkerAlt className="me-2" />
            إدارة المدن
          </h2>
          <p className="text-muted">إدارة المدن ومسارات الشحن بينها</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">إجمالي المدن</h6>
              <h3 className="mb-0">{cities.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">المدن النشطة</h6>
              <h3 className="mb-0 text-success">
                {cities.filter((c) => c.isActive).length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">المدن الرئيسية</h6>
              <h3 className="mb-0 text-primary">
                {cities.filter((c) => c.type === "major_city").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">إجمالي المسارات</h6>
              <h3 className="mb-0 text-info">
                {cities.reduce((sum, city) => sum + getRoutesCount(city), 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="row mb-3 g-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="ابحث عن مدينة (بالعربي أو الإنجليزي)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button className="btn btn-primary" onClick={handleAddCity}>
            <FaPlus className="me-2" />
            إضافة مدينة جديدة
          </button>
        </div>
      </div>

      {/* DataTable */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={filteredCities}
            progressPending={loading}
            progressComponent={
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-3">جاري تحميل المدن...</p>
              </div>
            }
            noDataComponent={<NoDataComponent />}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            paginationComponentOptions={{
              rowsPerPageText: "عدد الصفوف:",
              rangeSeparatorText: "من",
            }}
            highlightOnHover
            striped
            responsive
            direction="rtl"
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CityModal
          show={showModal}
          handleClose={handleModalClose}
          city={selectedCity}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
