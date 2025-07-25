import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "الشحنات الكلية",
    value: "1,234",
    icon: "🚚",
    color: "var(--primary-100)",
  },
  { title: "قيد التنفيذ", value: "89", icon: "⏳", color: "var(--accent-100)" },
  { title: "تم التوصيل", value: "1,100", icon: "✅", color: "#28a745" },
  { title: "فشل / إلغاء", value: "45", icon: "❌", color: "#dc3545" },
];

const chartData = [
  { name: "سبت", shipments: 50 },
  { name: "أحد", shipments: 75 },
  { name: "إثنين", shipments: 100 },
  { name: "ثلاثاء", shipments: 60 },
  { name: "أربعاء", shipments: 90 },
  { name: "خميس", shipments: 110 },
  { name: "جمعة", shipments: 80 },
];

const DashboardHome = () => {
  const navigate = useNavigate();
  return (
    <div className="container py-4">
      <div className="mb-4 ">
        <h2 className="h4 fw-bold">مرحبًا، مصطفى 👋</h2>
        <p className="text-muted small">
          إليك نظرة سريعة على عمليات الشحن اليوم.
        </p>
      </div>

      <div className="row g-4">
        {stats.map((stat, index) => (
          <div className="col-12 col-sm-6 col-lg-3" key={index}>
            <Card className="text-end h-100">
              <div className="py-3">
                <div className="d-flex justify-content-between align-items-center fs-5 fw-semibold">
                  <span>{stat.value}</span>
                  <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
                </div>
                <p className="small mt-2">{stat.title}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="card mt-5 p-4">
        <h5 className="mb-4 text-end">الشحنات خلال الأسبوع</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="shipments"
              stroke="var(--primary-100)"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="d-flex justify-content-end gap-3 mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/shipments/add")}
        >
          إضافة شحنة جديدة
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/shipments")}
        >
          متابعة الشحنات
        </button>
      </div>
    </div>
  );
};

export default DashboardHome;
