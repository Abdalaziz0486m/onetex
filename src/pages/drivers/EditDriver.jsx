import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft } from "react-icons/fa";

// Import driver service
import {
  getDriverById,
  updateDriver,
  prepareDriverPayload,
  validateDriverData,
  cities,
  areas,
  getCityOptionFromApiValue,
  getAreaOptionFromApiValue,
} from "../../services/driverService";

// Import components
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

const EditDriver = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    city: null,
    area: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  // جلب بيانات السائق
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

      if (driverData && driverData._id) {
        // استخدام helper functions من الـ service
        const cityOption = getCityOptionFromApiValue(driverData.region);
        const areaOption = cityOption
          ? getAreaOptionFromApiValue(cityOption.value, driverData.Area)
          : null;

        setForm({
          name: driverData.name,
          phone: driverData.phone,
          licenseNumber: driverData.licenseNumber,
          city: cityOption,
          area: areaOption,
        });
      } else {
        setError("لم يتم العثور على السائق");
      }
    } catch (error) {
      console.error("Error fetching driver:", error);
      const errorMessage =
        error?.message || error?.error || "فشل في تحميل بيانات السائق";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCityChange = (selected) => {
    setForm({ ...form, city: selected, area: null });
  };

  const handleAreaChange = (selected) => {
    setForm({ ...form, area: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.city || !form.area) {
      toast.error("يجب اختيار المدينة والحي");
      return;
    }

    // تجهيز البيانات باستخدام الـ service
    const payload = prepareDriverPayload(form);

    // التحقق من صحة البيانات
    const validation = validateDriverData(payload);
    if (!validation.isValid) {
      // عرض أول خطأ
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await updateDriver(id, payload);

      if (response.success || response._id) {
        toast.success("تم تحديث بيانات السائق بنجاح");
        setTimeout(() => {
          navigate("/drivers");
        }, 1500);
      } else {
        toast.error(response.message || "فشل في تعديل بيانات السائق");
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      const errorMessage =
        error?.message || error?.error || "فشل في تعديل بيانات السائق";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="container mt-4">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        rtl
        theme="light"
        transition={Bounce}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/drivers")}
          disabled={submitting}
        >
          <FaArrowLeft className="me-2" />
          العودة للقائمة
        </button>
        <h3 className="mb-0">تعديل بيانات السائق</h3>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">الاسم *</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">رقم الجوال *</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
              required
              disabled={submitting}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">رقم الرخصة *</label>
            <input
              type="text"
              className="form-control"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">المدينة *</label>
            <Select
              options={cities}
              value={form.city}
              onChange={handleCityChange}
              placeholder="اختر المدينة"
              isSearchable
              isDisabled={submitting}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                }),
              }}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">الحي *</label>
            <Select
              options={form.city ? areas[form.city.value] : []}
              value={form.area}
              onChange={handleAreaChange}
              placeholder="اختر الحي"
              isSearchable
              isDisabled={!form.city || submitting}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                }),
              }}
            />
          </div>

          <div className="col-12">
            <hr className="my-3" />
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <span className="me-2">✓</span>
                    حفظ التعديلات
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/drivers")}
                disabled={submitting}
              >
                إلغاء
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDriver;
