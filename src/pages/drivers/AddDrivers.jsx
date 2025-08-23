import { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";
import axios from "axios";

const cities = [
  { value: "riyadh", label: "الرياض", apiValue: "Riyadh" },
  { value: "jeddah", label: "جدة", apiValue: "Jeddah" },
  { value: "dammam", label: "الدمام", apiValue: "Dammam" },
];

const areas = {
  riyadh: [
    { value: "east", label: "الرياض الشرقية", apiValue: "East Riyadh" },
    { value: "west", label: "الرياض الغربية", apiValue: "West Riyadh" },
  ],
  jeddah: [
    { value: "north", label: "جدة الشمالية", apiValue: "North Jeddah" },
    { value: "south", label: "جدة الجنوبية", apiValue: "South Jeddah" },
  ],
  dammam: [
    { value: "center", label: "وسط الدمام", apiValue: "Central Dammam" },
    {
      value: "industrial",
      label: "المنطقة الصناعية",
      apiValue: "Industrial Area",
    },
  ],
};

const AddDrivers = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    city: null,
    area: null,
  });

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

    const payload = {
      name: form.name,
      phone: form.phone,
      licenseNumber: form.licenseNumber,
      region: form.city.apiValue, // ربط مع API
      Area: form.area.apiValue, // ربط مع API
    };

    try {
      await axios.post("https://shipping.onetex.com.sa/api/drivers", payload);
      toast.success("تم حفظ السائق بنجاح");
      setTimeout(() => {
        navigate("/drivers");
      }, 1500);
    } catch (err) {
      toast.error("فشل في حفظ السائق");
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
              required
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
              isDisabled={!form.city}
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              حفظ السائق
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDrivers;
