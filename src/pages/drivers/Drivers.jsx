import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useNavigate } from "react-router-dom";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  // جلب البيانات من API
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}api/drivers`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setDrivers(res.data);
      })
      .catch(() => {
        toast.error("فشل في جلب بيانات السائقين");
      });
  }, []);

  const handleDelete = () => {
    axios
      .delete(`${import.meta.env.VITE_BASE_URL}api/drivers/${selectedId}`)
      .then(() => {
        setDrivers(drivers.filter((d) => d._id !== selectedId));
        toast.success("تم حذف السائق بنجاح");
      })
      .catch(() => toast.error("فشل في حذف السائق"))
      .finally(() => setShowModal(false));
  };

  const columns = [
    { name: "الاسم", selector: (row) => row.name },
    { name: "رقم الجوال", selector: (row) => row.phone },
    { name: "رقم الرخصة", selector: (row) => row.licenseNumber },
    { name: "المنطقة", selector: (row) => row.region },
    { name: "الحي", selector: (row) => row.Area }, // لاحظ إن عندك `Area` في API كـ capital A
    {
      name: "التحكم",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`driver/${row._id}`)}
          >
            <FaEye />
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`edit/${row._id}`)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setSelectedId(row._id);
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

  return (
    <div className="p-4" dir="rtl">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>السائقين ({drivers.length})</h2>
        <button className="btn btn-primary" onClick={() => navigate("add")}>
          + اضافة سائق
        </button>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        pagination
        highlightOnHover
        responsive
        striped
        noDataComponent="لا يوجد بيانات متاحة"
      />

      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        message="هل تريد حذف هذا السائق؟"
      />
    </div>
  );
};

export default Drivers;
