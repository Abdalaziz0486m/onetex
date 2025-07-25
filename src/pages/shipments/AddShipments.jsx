"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";

export default function AddShipments() {
  const [senderAddressType, setSenderAddressType] = useState("detailed");
  const [recipientAddressType, setRecipientAddressType] = useState("detailed");
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
          [type]: {
            ...prev[section].address[type],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    toast.info("تم حفظ الشحنة في الكونسول مؤقتا");
    toast.success("تم انشاء الشحنة بنجاح");
    setTimeout(() => {
      navigate("/drivers");
    }, 1500);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-end">إضافة شحنة جديدة</h3>
      <form onSubmit={handleSubmit} className=" card p-4">
        {/* بيانات المرسل */}
        <h5 className="mb-3">بيانات المرسل</h5>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>اسم المرسل</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => handleChange("sender", "name", e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label>جوال المرسل</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => handleChange("sender", "phone", e.target.value)}
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label me-2">طريقة كتابة العنوان:</label>
          <div>
            <label className="me-3">
              <input
                type="radio"
                name="senderAddressType"
                value="detailed"
                checked={senderAddressType === "detailed"}
                onChange={() => setSenderAddressType("detailed")}
              />{" "}
              تفصيلي
            </label>
            <label>
              <input
                type="radio"
                name="senderAddressType"
                value="short"
                checked={senderAddressType === "short"}
                onChange={() => setSenderAddressType("short")}
              />{" "}
              كود مختصر
            </label>
          </div>
        </div>

        {/* عنوان المرسل */}
        {senderAddressType === "detailed" ? (
          <div className="row">
            {nationalFields.map(({ label, name }) => (
              <div className="col-md-4 mb-3" key={name}>
                <label>{label}</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) =>
                    handleAddressChange(
                      "sender",
                      "national",
                      name,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3">
            <label>الكود المختصر</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) =>
                handleAddressChange(
                  "sender",
                  "shortCode",
                  "shortCode",
                  e.target.value
                )
              }
            />
          </div>
        )}

        <hr />

        {/* بيانات المستلم */}
        <h5 className="mb-3">بيانات المستلم</h5>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>اسم المستلم</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) =>
                handleChange("recipient", "name", e.target.value)
              }
            />
          </div>
          <div className="col-md-6">
            <label>جوال المستلم</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) =>
                handleChange("recipient", "phone", e.target.value)
              }
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label me-2">طريقة كتابة العنوان:</label>
          <div>
            <label className="me-3">
              <input
                type="radio"
                name="recipientAddressType"
                value="detailed"
                checked={recipientAddressType === "detailed"}
                onChange={() => setRecipientAddressType("detailed")}
              />{" "}
              تفصيلي
            </label>
            <label>
              <input
                type="radio"
                name="recipientAddressType"
                value="short"
                checked={recipientAddressType === "short"}
                onChange={() => setRecipientAddressType("short")}
              />{" "}
              كود مختصر
            </label>
          </div>
        </div>

        {/* عنوان المستلم */}
        {recipientAddressType === "detailed" ? (
          <div className="row">
            {nationalFields.map(({ label, name }) => (
              <div className="col-md-4 mb-3" key={name}>
                <label>{label}</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) =>
                    handleAddressChange(
                      "recipient", // ✅ التصحيح هنا
                      "national",
                      name,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3">
            <label>الكود المختصر</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) =>
                handleAddressChange(
                  "recipient",
                  "shortCode",
                  "shortCode",
                  e.target.value
                )
              }
            />
          </div>
        )}
        <hr />

        {/* نوع الشحنة والوزن */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>نوع الشحنة</label>
            <select
              className="form-select"
              onChange={(e) =>
                setForm({ ...form, shipmentType: e.target.value })
              }
            >
              <option value="Normal">عادي</option>
              <option value="Document">وثائق</option>
              <option value="Express">مستعجل</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label>الوزن (كجم)</label>
            <input
              type="number"
              className="form-control"
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          حفظ الشحنة
        </button>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
}
