import * as React from "react";

export default function ErrorMessage({ error, onRetry, onBack }) {
  return (
    <div className="container mt-4">
      <div className="card p-4">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>خطأ</h4>
            <p>{error}</p>
            <div className="d-flex justify-content-center gap-2">
              {onRetry && (
                <button className="btn btn-primary" onClick={onRetry}>
                  إعادة المحاولة
                </button>
              )}
              {onBack && (
                <button className="btn btn-secondary" onClick={onBack}>
                  العودة للقائمة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
