import * as React from "react";

// Status translations and colors
const STATUS_CONFIG = {
  Pending: { label: "قيد الإنشاء", color: "secondary", icon: "⏳" },
  Processing: { label: "قيد المعالجة", color: "info", icon: "🔄" },
  InTransit: { label: "في الطريق", color: "warning", icon: "🚚" },
  OutForDelivery: { label: "قيد التوصيل", color: "primary", icon: "📦" },
  Delivered: { label: "تم التسليم", color: "success", icon: "✅" },
  Cancelled: { label: "ملغاة", color: "danger", icon: "❌" },
  Returned: { label: "مُرتجعة", color: "dark", icon: "↩️" },
};

export default function ShipmentStatusBadge({ status }) {
  const statusConfig = STATUS_CONFIG[status] || {
    label: status,
    color: "secondary",
    icon: "❓",
  };

  return (
    <div className="text-center mb-4">
      <span className={`badge bg-${statusConfig.color} fs-6 px-4 py-2`}>
        {statusConfig.icon} {statusConfig.label}
      </span>
    </div>
  );
}
