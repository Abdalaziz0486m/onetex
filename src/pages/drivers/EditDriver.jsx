import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const EditDriver = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    city: null,
    area: null,
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const { data } = await axios.get(
          `https://shipping.onetex.com.sa/api/drivers/${id}`
        );

        const driver = data; // الـ API بيرجع السائق مباشرة

        // نحاول نطابق region مع cityOptions
        const cityOption = cities.find((c) => c.apiValue === driver.region);
        // ثم نطابق Area مع خيارات المدينة
        const areaOption = cityOption
          ? areas[cityOption.value]?.find((a) => a.apiValue === driver.Area)
          : null;

        setForm({
          name: driver.name,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          city: cityOption || null,
          area: areaOption || null,
        });
      } catch (err) {
        toast.error("فشل في تحميل بيانات السائق");
        console.error(err);
      }
    };

    fetchDriver();
  }, [id]);

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
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        licenseNumber: form.licenseNumber,
        region: form.city?.apiValue,
        Area: form.area?.apiValue,
      };

      await axios.put(
        `https://shipping.onetex.com.sa/api/drivers/${id}`,
        payload
      );

      toast.success("تم تحديث بيانات السائق بنجاح");
      setTimeout(() => {
        navigate("/drivers");
      }, 1500);
    } catch (err) {
      toast.error("فشل في تعديل بيانات السائق");
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">تعديل بيانات السائق</h3>
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
            حفظ التعديلات
          </button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={1500} rtl />
    </div>
  );
};

export default EditDriver;
