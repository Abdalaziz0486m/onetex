import * as React from "react";
import { FaMapMarkerAlt, FaPhone, FaUser } from "react-icons/fa";

// Address component
function AddressCard({ address, title }) {
  if (!address) return null;

  return (
    <div className="address-card p-3 bg-light rounded mb-3">
      <h6 className="mb-2 text-primary">
        <FaMapMarkerAlt className="me-2" />
        {title}
      </h6>

      {address.shortCode ? (
        <div className="alert alert-info py-2 mb-0">
          <strong>كود مختصر:</strong> {address.shortCode}
        </div>
      ) : address.national ? (
        <div className="row g-2">
          {address.national.buildingNumber && (
            <div className="col-6">
              <small className="text-muted">رقم المبنى:</small>
              <div>{address.national.buildingNumber}</div>
            </div>
          )}
          {address.national.street && (
            <div className="col-6">
              <small className="text-muted">الشارع:</small>
              <div>{address.national.street}</div>
            </div>
          )}
          {address.national.district && (
            <div className="col-6">
              <small className="text-muted">الحي:</small>
              <div>{address.national.district}</div>
            </div>
          )}
          {address.national.city && (
            <div className="col-6">
              <small className="text-muted">المدينة:</small>
              <div className="fw-bold">{address.national.city}</div>
            </div>
          )}
          {address.national.region && (
            <div className="col-6">
              <small className="text-muted">المنطقة:</small>
              <div>{address.national.region}</div>
            </div>
          )}
          {address.national.postalCode && (
            <div className="col-6">
              <small className="text-muted">الرمز البريدي:</small>
              <div>{address.national.postalCode}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted">عنوان غير مكتمل</div>
      )}
    </div>
  );
}

export default function PersonCard({ person, title, isRecipient = false }) {
  if (!person) return null;

  return (
    <div className="person-card">
      <div className="card h-100">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <FaUser className="me-2" />
            {title}
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <strong className="text-primary">الاسم:</strong>
            <div className="fs-5">{person.name || "غير محدد"}</div>
          </div>

          <div className="mb-3">
            <strong className="text-primary">
              <FaPhone className="me-1" />
              رقم الهاتف:
            </strong>
            <div className="fs-6">
              <a href={`tel:${person.phone}`} className="text-decoration-none">
                {person.phone || "غير محدد"}
              </a>
            </div>
          </div>

          {person.notes && (
            <div className="mb-3">
              <strong className="text-primary">ملاحظات:</strong>
              <div className="text-muted">{person.notes}</div>
            </div>
          )}

          <AddressCard
            address={person.address}
            title={isRecipient ? "عنوان التسليم" : "عنوان الإرسال"}
          />
        </div>
      </div>
    </div>
  );
}
