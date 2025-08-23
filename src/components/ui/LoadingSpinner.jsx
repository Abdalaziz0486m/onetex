import * as React from "react";

export default function LoadingSpinner({ message = "جاري التحميل..." }) {
  return (
    <div className="container mt-4">
      <div className="card p-5">
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">{message}</span>
          </div>
          <h5 className="mb-0">{message}</h5>
        </div>
      </div>
    </div>
  );
}
