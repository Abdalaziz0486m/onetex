"use client";
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Driver() {
  const [driver, setDriver] = useState({
    name: "عبدالله",
    phone: "0551112233",
    licenseNumber: "LIC-1234",
    region: "الرياض",
    area: "شرق الرياض",
  });

  const [shipments, setShipments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const sampleShipments = [
      {
        id: 1,
        recipient: { name: "سعيد علي", city: "جدة" },
        status: "في الطريق",
      },
      {
        id: 2,
        recipient: { name: "ناصر عبد الله", city: "الدمام" },
        status: "تم التسليم",
      },
      {
        id: 3,
        recipient: { name: "أحمد منصور", city: "الرياض" },
        status: "تم الإلغاء",
      },
    ];
    setShipments(sampleShipments);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "في الطريق":
        return <span className="badge bg-warning">في الطريق</span>;
      case "تم التسليم":
        return <span className="badge bg-success">تم التسليم</span>;
      case "تم الإلغاء":
        return <span className="badge bg-danger">تم الإلغاء</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const columns = [
    {
      name: "الوجهة",
      selector: (row) => row.recipient.city,
    },
    {
      name: "اسم المستلم",
      selector: (row) => row.recipient.name,
    },
    {
      name: "حالة الشحنة",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      name: "التحكم",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`/shipments/shipment/${row.id}`)}
          >
            <FaEye />
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/shipments/edit/${row.id}`)}
          >
            <FaEdit />
          </button>
          <button className="btn btn-outline-danger btn-sm">
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <div className="container mt-4">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card p-3 shadow">
            <strong>اسم السائق:</strong> {driver.name}
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow">
            <strong>رقم الجوال:</strong> {driver.phone}
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow">
            <strong>رقم الرخصة:</strong> {driver.licenseNumber}
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow">
            <strong>المنطقة:</strong> {driver.region}
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow">
            <strong>الحي:</strong> {driver.area}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h5 className="mb-3 text-end">الشحنات الخاصة بالسائق</h5>
        <DataTable
          columns={columns}
          data={shipments}
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent="لا توجد شحنات مرتبطة بهذا السائق حالياً"
        />
      </div>
    </div>
  );
}
