"use client";
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom"; // أو next/navigation لو Next.js
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { Bounce, toast, ToastContainer } from "react-toastify";

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // لو بتستخدم Next.js: const router = useRouter();

  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        sender: {
          name: "أحمد محمد",
          phone: "0501234567",
          address: { national: { city: "الرياض" } },
        },
        recipient: {
          name: "سعيد علي",
          phone: "0559876543",
          address: { national: { city: "جدة" } },
        },
        status: "تم الإنشاء", // ✅
      },
      {
        id: 2,
        sender: {
          name: "سلمان إبراهيم",
          phone: "0512345678",
          address: { national: { city: "مكة" } },
        },
        recipient: {
          name: "ناصر عبد الله",
          phone: "0567654321",
          address: { national: { city: "الدمام" } },
        },
        status: "قيد التوصيل", // ✅
      },
      // باقي الشحنات...
    ];
    setShipments(sampleData);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "تم الإنشاء":
        return <span className="badge bg-secondary">{status}</span>;
      case "قيد التوصيل":
        return <span className="badge bg-warning text-dark">{status}</span>;
      case "تم التسليم":
        return <span className="badge bg-success">{status}</span>;
      case "ملغاة":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const columns = [
    { name: "اسم المرسل", selector: (row) => row.sender.name, sortable: true },
    { name: "جوال المرسل", selector: (row) => row.sender.phone },
    {
      name: "مدينة المرسل",
      selector: (row) => row.sender.address.national.city,
    },
    { name: "اسم المستلم", selector: (row) => row.recipient.name },
    { name: "جوال المستلم", selector: (row) => row.recipient.phone },
    {
      name: "مدينة المستلم",
      selector: (row) => row.recipient.address.national.city,
    },
    {
      name: "حالة الشحنة",
      selector: (row) => row.status,
      cell: (row) => getStatusBadge(row.status),
      sortable: true,
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
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setSelectedId(row.id);
              setShowModal(true);
            }}
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const handleDelete = () => {
    setShipments(shipments.filter((s) => s.id !== selectedId));
    setShowModal(false);
    toast.success("تم حذف الشحنة بنجاح");
  };

  return (
    <div className="card p-4 mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-4 text-end">قائمة الشحنات</h2>
        <button className="btn btn-primary" onClick={() => navigate("add")}>
          {" "}
          اضافة شحنة +{" "}
        </button>
      </div>
      <DataTable
        columns={columns}
        data={shipments}
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="لا توجد شحنات حالياً"
      />

      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        message="هل تريد حذف هذه الشحنة؟"
      />
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
