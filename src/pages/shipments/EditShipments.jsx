// // src/pages/dashboard/shipments/edit/[id].jsx

// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom"; // أو useSearchParams حسب راوتر المشروع
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function EditShipment() {
//   const { id } = useParams(); // رقم الشحنة
//   const navigate = useNavigate();

//   const [form, setForm] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [senderAddressType, setSenderAddressType] = useState("detailed");
//   const [recipientAddressType, setRecipientAddressType] = useState("detailed");

//   useEffect(() => {
//     // جلب بيانات الشحنة
//     axios
//       .get(`https://your-api.com/shipments/${id}`)
//       .then((res) => {
//         const data = res.data;
//         setForm(data);
//         setSenderAddressType(
//           data.sender.address.shortCode ? "short" : "detailed"
//         );
//         setRecipientAddressType(
//           data.recipient.address.shortCode ? "short" : "detailed"
//         );
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, [id]);

//   const handleChange = (e, fieldPath) => {
//     const updatedForm = { ...form };
//     const keys = fieldPath.split(".");
//     let current = updatedForm;
//     for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
//     current[keys[keys.length - 1]] = e.target.value;
//     setForm(updatedForm);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // إرسال البيانات
//     axios
//       .put(`https://your-api.com/shipments/${id}`, form)
//       .then(() => {
//         alert("تم التعديل بنجاح");
//         navigate("/dashboard/shipments");
//       })
//       .catch((err) => {
//         console.error(err);
//         alert("فشل التعديل");
//       });
//   };

//   if (loading || !form)
//     return <div className="text-center mt-5">جاري التحميل...</div>;

//   return (
//     <div className="container mt-4" dir="rtl">
//       <h4 className="mb-4">تعديل الشحنة</h4>
//       <form onSubmit={handleSubmit}>
//         {/* بيانات المرسل */}
//         <h5>بيانات المرسل</h5>
//         <div className="mb-3">
//           <label className="form-label">اسم المرسل</label>
//           <input
//             type="text"
//             className="form-control"
//             value={form.sender.name}
//             onChange={(e) => handleChange(e, "sender.name")}
//           />
//         </div>

//         <div className="mb-3">
//           <label className="form-label">رقم جوال المرسل</label>
//           <input
//             type="text"
//             className="form-control"
//             value={form.sender.phone}
//             onChange={(e) => handleChange(e, "sender.phone")}
//           />
//         </div>

//         {/* اختيار نوع العنوان */}
//         <div className="mb-3">
//           <label className="form-label">نوع عنوان المرسل</label>
//           <div>
//             <input
//               type="radio"
//               id="sender-detailed"
//               name="senderAddressType"
//               value="detailed"
//               checked={senderAddressType === "detailed"}
//               onChange={(e) => setSenderAddressType(e.target.value)}
//             />
//             <label htmlFor="sender-detailed" className="me-3 ms-1">
//               تفصيلي
//             </label>

//             <input
//               type="radio"
//               id="sender-short"
//               name="senderAddressType"
//               value="short"
//               checked={senderAddressType === "short"}
//               onChange={(e) => setSenderAddressType(e.target.value)}
//             />
//             <label htmlFor="sender-short" className="ms-1">
//               رمز مختصر
//             </label>
//           </div>
//         </div>

//         {/* عنوان المرسل حسب النوع */}
//         {senderAddressType === "detailed" ? (
//           <>
//             <div className="mb-3">
//               <label className="form-label">المدينة</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={form.sender.address.national.city}
//                 onChange={(e) =>
//                   handleChange(e, "sender.address.national.city")
//                 }
//               />
//             </div>
//             {/* باقي الحقول التفصيلية بنفس الشكل */}
//           </>
//         ) : (
//           <div className="mb-3">
//             <label className="form-label">الرمز المختصر</label>
//             <input
//               type="text"
//               className="form-control"
//               value={form.sender.address.shortCode}
//               onChange={(e) => handleChange(e, "sender.address.shortCode")}
//             />
//           </div>
//         )}

//         {/* بيانات المستقبل و address بنفس فكرة المرسل */}
//         <h5 className="mt-4">بيانات المستقبل</h5>
//         <div className="mb-3">
//           <label className="form-label">اسم المستقبل</label>
//           <input
//             type="text"
//             className="form-control"
//             value={form.recipient.name}
//             onChange={(e) => handleChange(e, "recipient.name")}
//           />
//         </div>

//         {/* باقي البيانات بنفس التنسيق */}

//         {/* نوع الشحنة */}
//         <div className="mb-3">
//           <label className="form-label">نوع الشحنة</label>
//           <select
//             className="form-select"
//             value={form.shipmentType}
//             onChange={(e) => handleChange(e, "shipmentType")}
//           >
//             <option value="عادي">عادي</option>
//             <option value="وثائق">وثائق</option>
//             <option value="مستعجل">مستعجل</option>
//           </select>
//         </div>

//         {/* الوزن */}
//         <div className="mb-3">
//           <label className="form-label">الوزن (كجم)</label>
//           <input
//             type="number"
//             className="form-control"
//             value={form.weight}
//             onChange={(e) => handleChange(e, "weight")}
//           />
//         </div>

//         <button className="btn btn-primary">تحديث الشحنة</button>
//       </form>
//     </div>
//   );
// }

// src/pages/dashboard/shipments/edit.jsx

"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function EditShipment() {
  const [form, setForm] = useState({
    sender: {
      name: "أحمد المرسل",
      phone: "0551234567",
      addressType: "detailed", // or "short"
      address: {
        national: {
          buildingNumber: "123",
          street: "King Road",
          district: "Olaya",
          city: "Riyadh",
          region: "Riyadh",
          postalCode: "12345",
        },
        shortCode: "",
      },
    },
    recipient: {
      name: "محمد المستلم",
      phone: "0569876543",
      addressType: "short", // or "detailed"
      address: {
        national: {
          buildingNumber: "",
          street: "",
          district: "",
          city: "",
          region: "",
          postalCode: "",
        },
        shortCode: "KSA-ABC987",
      },
    },
    shipmentType: "عادي",
    weight: 5,
  });

  const handleChange = (e, section, field) => {
    setForm({
      ...form,
      [section]: {
        ...form[section],
        [field]: e.target.value,
      },
    });
  };

  const handleAddressChange = (e, section, field) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        address: {
          ...prev[section].address,
          national: {
            ...prev[section].address.national,
            [field]: value,
          },
        },
      },
    }));
  };

  const handleShortCodeChange = (e, section) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        address: {
          ...prev[section].address,
          shortCode: value,
        },
      },
    }));
  };

  const handleAddressTypeChange = (e, section) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        addressType: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("تم حفظ التعديلات بنجاح");
  };

  return (
    <div className="container">
      <h2 className="mb-4 text-end">تعديل الشحنة</h2>
      <div className="card p-4 mt-4">
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Sender */}
            <div className="col-md-6">
              <h5 className="text-end">بيانات المرسل</h5>
              <div className="mb-3 text-end">
                <label className="form-label">اسم المرسل</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.sender.name}
                  onChange={(e) => handleChange(e, "sender", "name")}
                />
              </div>
              <div className="mb-3 text-end">
                <label className="form-label">جوال المرسل</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.sender.phone}
                  onChange={(e) => handleChange(e, "sender", "phone")}
                />
              </div>

              <div className="mb-3 text-end">
                <label className="form-label">نوع العنوان</label>
                <div className="form-check form-check-inline ms-2">
                  <input
                    type="radio"
                    name="senderAddressType"
                    value="detailed"
                    checked={form.sender.addressType === "detailed"}
                    onChange={(e) => handleAddressTypeChange(e, "sender")}
                    className="form-check-input"
                  />
                  <label className="form-check-label">تفصيلي</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    name="senderAddressType"
                    value="short"
                    checked={form.sender.addressType === "short"}
                    onChange={(e) => handleAddressTypeChange(e, "sender")}
                    className="form-check-input"
                  />
                  <label className="form-check-label">كود مختصر</label>
                </div>
              </div>

              {form.sender.addressType === "detailed" ? (
                <>
                  {[
                    "buildingNumber",
                    "street",
                    "district",
                    "city",
                    "region",
                    "postalCode",
                  ].map((field) => (
                    <div className="mb-3 text-end" key={field}>
                      <label className="form-label">
                        {field === "buildingNumber"
                          ? "رقم المبنى"
                          : field === "street"
                          ? "الشارع"
                          : field === "district"
                          ? "الحي"
                          : field === "city"
                          ? "المدينة"
                          : field === "region"
                          ? "المنطقة"
                          : "الرمز البريدي"}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.sender.address.national[field]}
                        onChange={(e) =>
                          handleAddressChange(e, "sender", field)
                        }
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div className="mb-3 text-end">
                  <label className="form-label">الكود المختصر</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.sender.address.shortCode}
                    onChange={(e) => handleShortCodeChange(e, "sender")}
                  />
                </div>
              )}
            </div>

            {/* Recipient */}
            <div className="col-md-6">
              <h5 className="text-end">بيانات المستلم</h5>
              <div className="mb-3 text-end">
                <label className="form-label">اسم المستلم</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.recipient.name}
                  onChange={(e) => handleChange(e, "recipient", "name")}
                />
              </div>
              <div className="mb-3 text-end">
                <label className="form-label">جوال المستلم</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.recipient.phone}
                  onChange={(e) => handleChange(e, "recipient", "phone")}
                />
              </div>

              <div className="mb-3 text-end">
                <label className="form-label">نوع العنوان</label>
                <div className="form-check form-check-inline ms-2">
                  <input
                    type="radio"
                    name="recipientAddressType"
                    value="detailed"
                    checked={form.recipient.addressType === "detailed"}
                    onChange={(e) => handleAddressTypeChange(e, "recipient")}
                    className="form-check-input"
                  />
                  <label className="form-check-label">تفصيلي</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    name="recipientAddressType"
                    value="short"
                    checked={form.recipient.addressType === "short"}
                    onChange={(e) => handleAddressTypeChange(e, "recipient")}
                    className="form-check-input"
                  />
                  <label className="form-check-label">كود مختصر</label>
                </div>
              </div>

              {form.recipient.addressType === "detailed" ? (
                <>
                  {[
                    "buildingNumber",
                    "street",
                    "district",
                    "city",
                    "region",
                    "postalCode",
                  ].map((field) => (
                    <div className="mb-3 text-end" key={field}>
                      <label className="form-label">
                        {field === "buildingNumber"
                          ? "رقم المبنى"
                          : field === "street"
                          ? "الشارع"
                          : field === "district"
                          ? "الحي"
                          : field === "city"
                          ? "المدينة"
                          : field === "region"
                          ? "المنطقة"
                          : "الرمز البريدي"}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.recipient.address.national[field]}
                        onChange={(e) =>
                          handleAddressChange(e, "recipient", field)
                        }
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div className="mb-3 text-end">
                  <label className="form-label">الكود المختصر</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.recipient.address.shortCode}
                    onChange={(e) => handleShortCodeChange(e, "recipient")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Shipment info */}
          <div className="row mt-4">
            <div className="col-md-6 mb-3 text-end">
              <label className="form-label">نوع الشحنة</label>
              <select
                className="form-select"
                value={form.shipmentType}
                onChange={(e) =>
                  setForm({ ...form, shipmentType: e.target.value })
                }
              >
                <option value="عادي">عادي</option>
                <option value="مستندات">مستندات</option>
              </select>
            </div>
            <div className="col-md-6 mb-3 text-end">
              <label className="form-label">الوزن (كجم)</label>
              <input
                type="number"
                className="form-control"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="text-end">
            <button type="submit" className="btn btn-success">
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
