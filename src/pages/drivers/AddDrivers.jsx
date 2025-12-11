import { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";

// Import driver service
import {
  createDriver,
  prepareDriverPayload,
  validateDriverData,
  cities,
  areas,
} from "../../services/driverService";

const AddDrivers = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    city: null,
    area: null,
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

    setLoading(true);
    try {
      const response = await createDriver(payload);

      if (response.success || response._id) {
        toast.success("تم حفظ السائق بنجاح");
        setTimeout(() => {
          navigate("/drivers");
        }, 1500);
      } else {
        toast.error(response.message || "فشل في حفظ السائق");
      }
    } catch (error) {
      console.error("Error creating driver:", error);
      const errorMessage =
        error?.message || error?.error || "فشل في حفظ السائق";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
        transition={Bounce}
      />
      <div className="card p-4">
        <h3 className="mb-4">إضافة سائق جديد</h3>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">الاسم</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">رقم الجوال</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
              required
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">رقم الرخصة</label>
            <input
              type="text"
              className="form-control"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">المدينة</label>
            <Select
              options={cities}
              value={form.city}
              onChange={handleCityChange}
              placeholder="اختر المدينة"
              isSearchable
              isDisabled={loading}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">الحي</label>
            <Select
              options={form.city ? areas[form.city.value] : []}
              value={form.area}
              onChange={handleAreaChange}
              placeholder="اختر الحي"
              isSearchable
              isDisabled={!form.city || loading}
            />
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ السائق"
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ms-2"
              onClick={() => navigate("/drivers")}
              disabled={loading}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDrivers;
