"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function ShowShipment() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    const fakeData = {
      id,
      shipmentType: "عادي",
      weight: 5,
      status: "في الطريق",
      path: [
        { name: "تم إنشاء الشحنة", status: "done" },
        { name: "قيد المعالجة", status: "done" },
        { name: "في الطريق", status: "current" },
        { name: "تم التسليم", status: "upcoming" },
      ],
      sender: {
        name: "أحمد محمد",
        phone: "0551234567",
        address: {
          national: {
            buildingNumber: "123",
            street: "شارع الملك",
            district: "العليا",
            city: "الرياض",
            region: "الرياض",
            postalCode: "12345",
          },
        },
      },
      recipient: {
        name: "سعيد علي",
        phone: "0569876543",
        address: {
          shortCode: "KSA-ABC123",
        },
      },
    };

    setShipment(fakeData);
  }, [id]);

  if (!shipment) return <p>جاري تحميل البيانات...</p>;

  const renderAddress = (address) => {
    if (address.shortCode) {
      return <p>كود مختصر: {address.shortCode}</p>;
    } else if (address.national) {
      const a = address.national;
      return (
        <ul className="list-unstyled">
          <li>رقم المبنى: {a.buildingNumber}</li>
          <li>الشارع: {a.street}</li>
          <li>الحي: {a.district}</li>
          <li>المدينة: {a.city}</li>
          <li>المنطقة: {a.region}</li>
          <li>الرمز البريدي: {a.postalCode}</li>
        </ul>
      );
    }
  };

  const renderTimeline = () => (
    <div className="shipment-timeline my-4">
      <div className="d-flex justify-content-between position-relative">
        {shipment.path.map((step, index) => (
          <div
            key={index}
            className="text-center flex-fill position-relative"
            style={{ zIndex: 2 }}
          >
            <div
              className={`rounded-circle mx-auto mb-2 ${
                step.status === "done"
                  ? "bg-success"
                  : step.status === "current"
                  ? "bg-primary"
                  : "bg-light border"
              }`}
              style={{
                width: "24px",
                height: "24px",
                lineHeight: "24px",
                borderWidth: "2px",
              }}
            ></div>
            <small>{step.name}</small>
          </div>
        ))}
        {/* الخط بين النقاط */}
        <div
          className="position-absolute top-50 start-0 w-100"
          style={{
            height: "2px",
            background: "#dee2e6",
            zIndex: 1,
            transform: "translateY(-50%)",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h2 className="text-start mb-4">تفاصيل الشحنة رقم #{shipment.id}</h2>

        <div className="row">
          <div className="col-md-6 text-start">
            <h4>بيانات المرسل</h4>
            <p>الاسم: {shipment.sender.name}</p>
            <p>الجوال: {shipment.sender.phone}</p>
            {renderAddress(shipment.sender.address)}
          </div>

          <div className="col-md-6 text-start">
            <h4>بيانات المستقبل</h4>
            <p>الاسم: {shipment.recipient.name}</p>
            <p>الجوال: {shipment.recipient.phone}</p>
            {renderAddress(shipment.recipient.address)}
          </div>
        </div>

        <hr />

        <div className="text-start">
          <p>نوع الشحنة: {shipment.shipmentType}</p>
          <p>الوزن: {shipment.weight} كجم</p>
          <p>
            حالة الشحنة الحالية: <strong>{shipment.status}</strong>
          </p>
        </div>

        <h5 className="mt-4 mb-2">مسار الشحنة</h5>
        {renderTimeline()}

        <div className="mt-4 text-end">
          <button
            className="btn btn-danger me-2"
            onClick={() => toast.warning("تم حذف الشحنة (مؤقتًا)")}
          >
            حذف الشحنة
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => toast.info("تم تجميد الشحنة (مؤقتًا)")}
          >
            تجميد الشحنة
          </button>
        </div>
      </div>
    </div>
  );
}
