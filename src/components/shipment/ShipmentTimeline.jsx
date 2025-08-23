import * as React from "react";

// Create timeline based on status
const createTimeline = (currentStatus) => {
  const allSteps = [
    { key: "Pending", name: "تم إنشاء الشحنة" },
    { key: "Processing", name: "قيد المعالجة" },
    { key: "In Transit", name: "في الطريق" },
    { key: "Out for Delivery", name: "قيد التوصيل" },
    { key: "Delivered", name: "تم التسليم" },
  ];

  const currentIndex = allSteps.findIndex((step) => step.key === currentStatus);

  return allSteps.map((step, index) => ({
    ...step,
    status:
      index < currentIndex
        ? "done"
        : index === currentIndex
        ? "current"
        : "upcoming",
  }));
};

export default function ShipmentTimeline({ status }) {
  const timeline = createTimeline(status);

  return (
    <div className="timeline-container my-4 p-4 bg-light rounded">
      <h6 className="mb-4 text-center">مسار الشحنة</h6>
      <div className="timeline-wrapper position-relative">
        <div className="d-flex justify-content-between align-items-center position-relative">
          {timeline.map((step, index) => (
            <div
              key={index}
              className="timeline-step text-center flex-fill position-relative"
              style={{ zIndex: 2 }}
            >
              <div
                className={`timeline-dot mx-auto mb-2 d-flex align-items-center justify-content-center ${
                  step.status === "done"
                    ? "bg-success text-white"
                    : step.status === "current"
                    ? "bg-primary text-white"
                    : "bg-white border border-2 border-secondary text-muted"
                }`}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {step.status === "done"
                  ? "✓"
                  : step.status === "current"
                  ? "●"
                  : "○"}
              </div>
              <small
                className={`timeline-label ${
                  step.status === "current" ? "fw-bold text-primary" : ""
                }`}
              >
                {step.name}
              </small>
            </div>
          ))}

          {/* Progress line */}
          <div
            className="timeline-line position-absolute"
            style={{
              top: "20px",
              left: "5%",
              right: "5%",
              height: "2px",
              background: "linear-gradient(to right, #28a745 60%, #dee2e6 60%)",
              zIndex: 1,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
