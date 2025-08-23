import * as React from "react";
import { FaWeight, FaCalendarAlt, FaClock, FaBox } from "react-icons/fa";

// Shipment type translations
const SHIPMENT_TYPES = {
  Normal: "عادي",
  Documents: "مستندات",
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ShipmentInfoCard({ shipment }) {
  return (
    <div className="row mb-4">
      <div className="col-md-3">
        <div className="info-card text-center p-3 bg-primary bg-opacity-10 rounded">
          <FaBox className="fs-4 text-primary mb-2" />
          <div className="fw-bold">نوع الشحنة</div>
          <div>
            {SHIPMENT_TYPES[shipment.shipmentType] || shipment.shipmentType}
          </div>
        </div>
      </div>
      {shipment.weight && (
        <div className="col-md-3">
          <div className="info-card text-center p-3 bg-info bg-opacity-10 rounded">
            <FaWeight className="fs-4 text-info mb-2" />
            <div className="fw-bold">الوزن</div>
            <div>{shipment.weight} كجم</div>
          </div>
        </div>
      )}
      <div className="col-md-3">
        <div className="info-card text-center p-3 bg-success bg-opacity-10 rounded">
          <FaCalendarAlt className="fs-4 text-success mb-2" />
          <div className="fw-bold">تاريخ الإنشاء</div>
          <div>{formatDate(shipment.createdAt)}</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="info-card text-center p-3 bg-warning bg-opacity-10 rounded">
          <FaClock className="fs-4 text-warning mb-2" />
          <div className="fw-bold">آخر تحديث</div>
          <div>{formatDate(shipment.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}
