import * as React from "react";
import { FaEdit, FaTrash, FaPrint, FaTruck } from "react-icons/fa";

export default function ShipmentActions({
  shipment,
  trackingNumber,
  onEdit,
  onDelete,
  onPrint,
  onAssignDriver,
  actionLoading,
}) {
  const canAssignDriver =
    !shipment.assignedDriver &&
    shipment.status !== "Delivered" &&
    shipment.status !== "Cancelled";

  const canDelete = shipment.status !== "Delivered";

  return (
    <div className="d-flex justify-content-center gap-2 flex-wrap">
      <button
        className="btn btn-primary"
        onClick={onEdit}
        disabled={actionLoading}
      >
        <FaEdit className="me-2" />
        تعديل الشحنة
      </button>

      {canAssignDriver && (
        <button
          className="btn btn-success"
          onClick={onAssignDriver}
          disabled={actionLoading}
        >
          <FaTruck className="me-2" />
          تعيين سائق
        </button>
      )}

      <button
        className="btn btn-info"
        onClick={onPrint}
        disabled={actionLoading}
      >
        <FaPrint className="me-2" />
        طباعة
      </button>

      <button
        className="btn btn-danger"
        onClick={onDelete}
        disabled={actionLoading || !canDelete}
      >
        <FaTrash className="me-2" />
        {actionLoading ? "جاري الحذف..." : "حذف الشحنة"}
      </button>
    </div>
  );
}
