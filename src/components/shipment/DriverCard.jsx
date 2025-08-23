import * as React from "react";
import { FaTruck } from "react-icons/fa";

export default function DriverCard({ assignedDriver }) {
  if (!assignedDriver) return null;

  return (
    <div className="col-12 mb-4">
      <div className="card border-success">
        <div className="card-header bg-success text-white">
          <h6 className="mb-0">
            <FaTruck className="me-2" />
            السائق المُعيَّن
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <strong>الاسم:</strong>
              <div className="fs-5">{assignedDriver.name}</div>
            </div>
            <div className="col-md-6">
              <strong>رقم الهاتف:</strong>
              <div>
                <a
                  href={`tel:${assignedDriver.phone}`}
                  className="text-decoration-none"
                >
                  {assignedDriver.phone}
                </a>
              </div>
            </div>
            {assignedDriver.vehicleNumber && (
              <div className="col-md-6 mt-2">
                <strong>رقم المركبة:</strong>
                <div>{assignedDriver.vehicleNumber}</div>
              </div>
            )}
            {assignedDriver.licenseNumber && (
              <div className="col-md-6 mt-2">
                <strong>رقم الرخصة:</strong>
                <div>{assignedDriver.licenseNumber}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
