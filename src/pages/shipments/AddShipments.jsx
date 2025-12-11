"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";

// Import shipment service
import {
  createShipment,
  prepareShipmentPayload,
} from "../../services/shipmentService";

export default function AddShipments() {
  const [senderAddressType, setSenderAddressType] = useState("detailed");
  const [recipientAddressType, setRecipientAddressType] = useState("detailed");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const nationalFields = [
    { label: "رقم البناية", name: "buildingNumber" },
    { label: "الشارع", name: "street" },
    { label: "الحي", name: "district" },
    { label: "المدينة", name: "city" },
    { label: "المنطقة", name: "region" },
    { label: "الرمز البريدي", name: "postalCode" },
  ];

  const [form, setForm] = useState({
    sender: {
      name: "",
      phone: "",
      address: {
        national: {
          buildingNumber: "",
          street: "",
          district: "",
          city: "",
          region: "",
          postalCode: "",
        },
        shortCode: "",
      },
    },
    recipient: {
      name: "",
      phone: "",
      address: {
        national: {
          buildingNumber: "",
          street: "",
          district: "",
          city: "",
          region: "",
          postalCode: "",
        },
        shortCode: "",
      },
    },
    shipmentType: "Normal",
    weight: "",
    notes: "", // إضافة حقل الملاحظات
  });

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (section, type, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        address: {
          ...prev[section].address,
          [type]:
            type === "shortCode"
              ? value
              : {
                  ...prev[section].address[type],
                  [field]: value,
                },
        },
      },
    }));
  };

  const validateForm = () => {
    // التحقق من بيانات المرسل
    if (!form.sender.name.trim()) {
      toast.error("يجب إدخال اسم المرسل");
      return false;
    }
    if (!form.sender.phone.trim()) {
      toast.error("يجب إدخال رقم جوال المرسل");
      return false;
    }

    // التحقق من عنوان المرسل
    if (senderAddressType === "detailed") {
      const requiredFields = ["city", "region"];
      for (const field of requiredFields) {
        if (!form.sender.address.national[field]?.trim()) {
          toast.error(
            `يجب إدخال ${
              nationalFields.find((f) => f.name === field)?.label || field
            } للمرسل`
          );
          return false;
        }
      }
    } else {
      if (!form.sender.address.shortCode.trim()) {
        toast.error("يجب إدخال الكود المختصر للمرسل");
        return false;
      }
    }

    // التحقق من بيانات المستلم
    if (!form.recipient.name.trim()) {
      toast.error("يجب إدخال اسم المستلم");
      return false;
    }
    if (!form.recipient.phone.trim()) {
      toast.error("يجب إدخال رقم جوال المستلم");
      return false;
    }

    // التحقق من عنوان المستلم
    if (recipientAddressType === "detailed") {
      const requiredFields = ["city", "region"];
      for (const field of requiredFields) {
        if (!form.recipient.address.national[field]?.trim()) {
          toast.error(
            `يجب إدخال ${
              nationalFields.find((f) => f.name === field)?.label || field
            } للمستلم`
          );
          return false;
        }
      }
    } else {
      if (!form.recipient.address.shortCode.trim()) {
        toast.error("يجب إدخال الكود المختصر للمستلم");
        return false;
      }
    }

    // التحقق من الوزن للشحنات العادية
    if (
      form.shipmentType === "Normal" &&
      (!form.weight || Number(form.weight) <= 0)
    ) {
      toast.error("يجب إدخال وزن صحيح للشحنة العادية");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // تجهيز البيانات باستخدام الـ service
      const payload = prepareShipmentPayload(
        form,
        senderAddressType,
        recipientAddressType
      );

      const response = await createShipment(payload);

      if (response.success) {
        toast.success("تم إنشاء الشحنة بنجاح ✅");
        setTimeout(() => navigate("/shipments"), 1500);
      } else {
        toast.error(response.message || "حدث خطأ أثناء إنشاء الشحنة");
      }
    } catch (error) {
      console.error("Error creating shipment:", error);
      const errorMessage =
        error?.message || error?.error || "فشل في الاتصال بالخادم 🚨";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/shipments")}
          disabled={loading}
        >
          ← العودة للقائمة
        </button>
        <h3 className="mb-0">إضافة شحنة جديدة</h3>
      </div>

      <form onSubmit={handleSubmit} className="card p-4">
        {/* بيانات المرسل */}
        <h5 className="mb-3 text-primary">📦 بيانات المرسل</h5>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">اسم المرسل *</label>
            <input
              type="text"
              className="form-control"
              value={form.sender.name}
              onChange={(e) => handleChange("sender", "name", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">جوال المرسل *</label>
            <input
              type="tel"
              className="form-control"
              value={form.sender.phone}
              onChange={(e) => handleChange("sender", "phone", e.target.value)}
              placeholder="05xxxxxxxx"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">طريقة كتابة العنوان:</label>
          <div className="d-flex gap-3">
            <label className="form-check-label">
              <input
                type="radio"
                className="form-check-input me-2"
                name="senderAddressType"
                value="detailed"
                checked={senderAddressType === "detailed"}
                onChange={() => setSenderAddressType("detailed")}
                disabled={loading}
              />
              تفصيلي
            </label>
            <label className="form-check-label">
              <input
                type="radio"
                className="form-check-input me-2"
                name="senderAddressType"
                value="short"
                checked={senderAddressType === "short"}
                onChange={() => setSenderAddressType("short")}
                disabled={loading}
              />
              كود مختصر
            </label>
          </div>
        </div>

        {/* عنوان المرسل */}
        {senderAddressType === "detailed" ? (
          <div className="row">
            {nationalFields.map(({ label, name }) => (
              <div className="col-md-4 mb-3" key={name}>
                <label className="form-label">
                  {label}
                  {(name === "city" || name === "region") && " *"}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={form.sender.address.national[name]}
                  onChange={(e) =>
                    handleAddressChange(
                      "sender",
                      "national",
                      name,
                      e.target.value
                    )
                  }
                  required={name === "city" || name === "region"}
                  disabled={loading}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">الكود المختصر *</label>
            <input
              type="text"
              className="form-control"
              value={form.sender.address.shortCode}
              onChange={(e) =>
                handleAddressChange("sender", "shortCode", "", e.target.value)
              }
              placeholder="أدخل الكود المختصر"
              required
              disabled={loading}
            />
          </div>
        )}

        <hr className="my-4" />

        {/* بيانات المستلم */}
        <h5 className="mb-3 text-success">📍 بيانات المستلم</h5>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">اسم المستلم *</label>
            <input
              type="text"
              className="form-control"
              value={form.recipient.name}
              onChange={(e) =>
                handleChange("recipient", "name", e.target.value)
              }
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">جوال المستلم *</label>
            <input
              type="tel"
              className="form-control"
              value={form.recipient.phone}
              onChange={(e) =>
                handleChange("recipient", "phone", e.target.value)
              }
              placeholder="05xxxxxxxx"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">طريقة كتابة العنوان:</label>
          <div className="d-flex gap-3">
            <label className="form-check-label">
              <input
                type="radio"
                className="form-check-input me-2"
                name="recipientAddressType"
                value="detailed"
                checked={recipientAddressType === "detailed"}
                onChange={() => setRecipientAddressType("detailed")}
                disabled={loading}
              />
              تفصيلي
            </label>
            <label className="form-check-label">
              <input
                type="radio"
                className="form-check-input me-2"
                name="recipientAddressType"
                value="short"
                checked={recipientAddressType === "short"}
                onChange={() => setRecipientAddressType("short")}
                disabled={loading}
              />
              كود مختصر
            </label>
          </div>
        </div>

        {/* عنوان المستلم */}
        {recipientAddressType === "detailed" ? (
          <div className="row">
            {nationalFields.map(({ label, name }) => (
              <div className="col-md-4 mb-3" key={name}>
                <label className="form-label">
                  {label}
                  {(name === "city" || name === "region") && " *"}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={form.recipient.address.national[name]}
                  onChange={(e) =>
                    handleAddressChange(
                      "recipient",
                      "national",
                      name,
                      e.target.value
                    )
                  }
                  required={name === "city" || name === "region"}
                  disabled={loading}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">الكود المختصر *</label>
            <input
              type="text"
              className="form-control"
              value={form.recipient.address.shortCode}
              onChange={(e) =>
                handleAddressChange(
                  "recipient",
                  "shortCode",
                  "",
                  e.target.value
                )
              }
              placeholder="أدخل الكود المختصر"
              required
              disabled={loading}
            />
          </div>
        )}

        <hr className="my-4" />

        {/* نوع الشحنة والوزن */}
        <h5 className="mb-3">📋 تفاصيل الشحنة</h5>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">نوع الشحنة *</label>
            <select
              className="form-select"
              value={form.shipmentType}
              onChange={(e) =>
                setForm({ ...form, shipmentType: e.target.value })
              }
              disabled={loading}
            >
              <option value="Normal">عادي</option>
              <option value="Document">وثائق</option>
              <option value="Express">مستعجل</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">
              الوزن (كجم) {form.shipmentType === "Normal" && "*"}
            </label>
            <input
              type="number"
              className="form-control"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              min="0"
              step="0.01"
              disabled={loading || form.shipmentType !== "Normal"}
              required={form.shipmentType === "Normal"}
            />
          </div>
        </div>

        {/* ملاحظات إضافية */}
        <div className="mb-3">
          <label className="form-label">ملاحظات إضافية (اختياري)</label>
          <textarea
            className="form-control"
            rows="3"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="أي ملاحظات خاصة بالشحنة..."
            disabled={loading}
          />
        </div>

        <div className="d-flex gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <span className="me-2">✓</span>
                حفظ الشحنة
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate("/shipments")}
            disabled={loading}
          >
            إلغاء
          </button>
        </div>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
}
