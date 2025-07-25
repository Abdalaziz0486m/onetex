import { useState } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useNavigate } from "react-router-dom";

const Drivers = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "عبدالله",
      phone: "0551112233",
      licenseNumber: "LIC-1234",
      region: "الرياض",
      area: "الرياض الشرقية",
    },
    {
      id: 2,
      name: "خالد",
      phone: "0552223344",
      licenseNumber: "LIC-5678",
      region: "جدة",
      area: "شمال جدة",
    },
    {
      id: 3,
      name: "سلمان",
      phone: "0553334455",
      licenseNumber: "LIC-9101",
      region: "الدمام",
      area: "غرب الدمام",
    },
    {
      id: 4,
      name: "فهد",
      phone: "0554445566",
      licenseNumber: "LIC-1121",
      region: "الرياض",
      area: "الرياض الشمالية",
    },
    {
      id: 5,
      name: "تركي",
      phone: "0555556677",
      licenseNumber: "LIC-3141",
      region: "مكة",
      area: "حي العزيزية",
    },
    {
      id: 6,
      name: "سعد",
      phone: "0556667788",
      licenseNumber: "LIC-5161",
      region: "الدمام",
      area: "حي الفيصلية",
    },
    {
      id: 7,
      name: "راكان",
      phone: "0557778899",
      licenseNumber: "LIC-7181",
      region: "جدة",
      area: "الصفا",
    },
    {
      id: 8,
      name: "ناصر",
      phone: "0558889900",
      licenseNumber: "LIC-9202",
      region: "مكة",
      area: "الشوقية",
    },
    {
      id: 9,
      name: "ماجد",
      phone: "0559990011",
      licenseNumber: "LIC-1222",
      region: "الدمام",
      area: "الدمام الجنوبية",
    },
    {
      id: 10,
      name: "ياسر",
      phone: "0560001122",
      licenseNumber: "LIC-3242",
      region: "الرياض",
      area: "حي اليرموك",
    },
    {
      id: 11,
      name: "علي",
      phone: "0561112233",
      licenseNumber: "LIC-5262",
      region: "القصيم",
      area: "بريدة",
    },
    {
      id: 12,
      name: "سامي",
      phone: "0562223344",
      licenseNumber: "LIC-7282",
      region: "جدة",
      area: "الحمراء",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const handleDelete = () => {
    setDrivers(drivers.filter((d) => d.id !== selectedId));
    toast.success("تم حذف السائق بنجاح");
    setShowModal(false);
  };

  const columns = [
    { name: "الاسم", selector: (row) => row.name },
    { name: "رقم الجوال", selector: (row) => row.phone },
    { name: "رقم الرخصة", selector: (row) => row.licenseNumber },
    { name: "المنطقة", selector: (row) => row.region },
    { name: "الحي", selector: (row) => row.area },
    {
      name: "التحكم",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`driver/${row.id}`)}
          >
            <FaEye />
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`edit/${row.id}`)}
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
