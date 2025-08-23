import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// Constants for better maintainability
const SHIPMENT_TYPES = [
  { value: "عادي", label: "عادي" },
  { value: "مستندات", label: "مستندات" },
];

const ADDRESS_FIELDS = [
  { key: "buildingNumber", label: "رقم المبنى" },
  { key: "street", label: "الشارع" },
  { key: "district", label: "الحي" },
  { key: "city", label: "المدينة" },
  { key: "region", label: "المنطقة" },
  { key: "postalCode", label: "الرمز البريدي" },
];

const INITIAL_FORM_STATE = {
  sender: {
    name: "",
    phone: "",
    addressType: "detailed",
    address: {
      national: {
        buildingNumber: "",
        street: "",
        district: "",
        city: "",
        region: "",
        postalCode: "",
      },
      shortCode: "",
    },
  },
  recipient: {
    name: "",
    phone: "",
    addressType: "detailed",
    address: {
      national: {
        buildingNumber: "",
        street: "",
        district: "",
        city: "",
        region: "",
        postalCode: "",
      },
      shortCode: "",
    },
  },
  shipmentType: "عادي",
  weight: "",
};

// Custom hook for form validation
const useFormValidation = (form) => {
  return useMemo(() => {
    const errors = {};

    // Validate sender
    if (!form.sender.name.trim()) {
      errors.senderName = "اسم المرسل مطلوب";
    }
    if (!form.sender.phone.trim()) {
      errors.senderPhone = "جوال المرسل مطلوب";
    }

    // Validate recipient
    if (!form.recipient.name.trim()) {
      errors.recipientName = "اسم المستلم مطلوب";
    }
    if (!form.recipient.phone.trim()) {
      errors.recipientPhone = "جوال المستلم مطلوب";
    }

    // Validate addresses
    ["sender", "recipient"].forEach((section) => {
      if (form[section].addressType === "detailed") {
        const national = form[section].address.national;
        if (!national.city.trim()) {
          errors[`${section}City`] = "المدينة مطلوبة";
        }
        if (!national.region.trim()) {
          errors[`${section}Region`] = "المنطقة مطلوبة";
        }
      } else {
        if (!form[section].address.shortCode.trim()) {
          errors[`${section}ShortCode`] = "الكود المختصر مطلوب";
        }
      }
    });

    // Validate weight for normal shipments
    if (
      form.shipmentType === "عادي" &&
      (!form.weight || Number(form.weight) <= 0)
    ) {
      errors.weight = "الوزن مطلوب للشحنات العادية";
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  }, [form]);
};

export default function EditShipment() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { errors, isValid } = useFormValidation(form);

  // Memoized API functions
  const fetchShipment = useCallback(async (trackingId) => {
    if (!trackingId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://shipping.onetex.com.sa/api/shipments/${trackingId}`
      );

      console.log("API Response:", response); // Debug log

      if (response.data && response.data.data) {
        const apiData = response.data.data; // البيانات موجودة في data.data
        console.log("API Data received:", apiData); // Debug log

        // Helper function to determine address type
        const getAddressType = (addressData) => {
          if (
            addressData?.national &&
            Object.values(addressData.national).some((val) => val)
          ) {
            return "detailed";
          } else if (addressData?.shortCode) {
            return "short";
          }
          return "detailed"; // default
        };

        // Convert shipment type from English to Arabic
        const convertShipmentType = (type) => {
          if (type === "Normal") return "عادي";
          if (type === "Documents") return "مستندات";
          return type || "عادي";
        };

        const formData = {
          sender: {
            name: apiData.sender?.name || "",
            phone: apiData.sender?.phone || "",
            addressType: getAddressType(apiData.sender?.address),
            address: {
              national: {
                buildingNumber:
                  apiData.sender?.address?.national?.buildingNumber || "",
                street: apiData.sender?.address?.national?.street || "",
                district: apiData.sender?.address?.national?.district || "",
                city: apiData.sender?.address?.national?.city || "",
                region: apiData.sender?.address?.national?.region || "",
                postalCode: apiData.sender?.address?.national?.postalCode || "",
              },
              shortCode: apiData.sender?.address?.shortCode || "",
            },
          },
          recipient: {
            name: apiData.recipient?.name || "",
            phone: apiData.recipient?.phone || "",
            addressType: getAddressType(apiData.recipient?.address),
            address: {
              national: {
                buildingNumber:
                  apiData.recipient?.address?.national?.buildingNumber || "",
                street: apiData.recipient?.address?.national?.street || "",
                district: apiData.recipient?.address?.national?.district || "",
                city: apiData.recipient?.address?.national?.city || "",
                region: apiData.recipient?.address?.national?.region || "",
                postalCode:
                  apiData.recipient?.address?.national?.postalCode || "",
              },
              shortCode: apiData.recipient?.address?.shortCode || "",
            },
          },
          shipmentType: convertShipmentType(apiData.shipmentType),
          weight: apiData.weight?.toString() || "",
        };

        console.log("Form data to set:", formData); // Debug log
        setForm(formData);
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);
      toast.error("خطأ في تحميل بيانات الشحنة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Tracking number:", trackingNumber); // Debug log
    fetchShipment(trackingNumber);
  }, [trackingNumber, fetchShipment]);

  // Debug log for form state changes
  useEffect(() => {
    console.log("Form state updated:", form);
  }, [form]);

  // Optimized change handlers
  const handleChange = useCallback((e, section, field) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }, []);

  const handleAddressChange = useCallback((e, section, field) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        address: {
          ...prev[section].address,
          national: {
            ...prev[section].address.national,
            [field]: value,
          },
        },
      },
    }));
  }, []);

  const handleShortCodeChange = useCallback((e, section) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        address: {
          ...prev[section].address,
          shortCode: value,
        },
      },
    }));
  }, []);

  const handleAddressTypeChange = useCallback((e, section) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        addressType: value,
      },
    }));
  }, []);

  const handleShipmentTypeChange = useCallback((e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      shipmentType: value,
      // Clear weight if switching to documents
      ...(value === "مستندات" && { weight: "" }),
    }));
  }, []);

  const handleWeightChange = useCallback((e) => {
    const { value } = e.target;
    // Only allow positive numbers
    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
      setForm((prev) => ({ ...prev, weight: value }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setSubmitting(true);
    try {
      // Convert shipment type from Arabic to English for API
      const convertShipmentTypeToEnglish = (type) => {
        if (type === "عادي") return "Normal";
        if (type === "مستندات") return "Documents";
        return type;
      };

      const payload = {
        sender: {
          name: form.sender.name.trim(),
          phone: form.sender.phone.trim(),
          address:
            form.sender.addressType === "detailed"
              ? { national: form.sender.address.national }
              : { shortCode: form.sender.address.shortCode.trim() },
        },
        recipient: {
          name: form.recipient.name.trim(),
          phone: form.recipient.phone.trim(),
          address:
            form.recipient.addressType === "detailed"
              ? { national: form.recipient.address.national }
              : { shortCode: form.recipient.address.shortCode.trim() },
        },
        shipmentType: convertShipmentTypeToEnglish(form.shipmentType),
        ...(form.shipmentType === "عادي" && { weight: Number(form.weight) }),
      };

      console.log("Payload to send:", payload); // Debug log

      const response = await axios.put(
        `https://shipping.onetex.com.sa/api/shipments/${trackingNumber}`,
        payload
      );

      if (response.data.success) {
        toast.success("تم تحديث الشحنة بنجاح ✅");
        setTimeout(() => navigate("/shipments"), 1500);
      } else {
        toast.error(response.data.message || "فشل تحديث الشحنة");
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error.response?.data?.message || "خطأ في الاتصال بالخادم 🚨";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Render address fields component
  const renderAddressFields = useCallback(
    (section, sectionData) => (
      <>
        {ADDRESS_FIELDS.map(({ key, label }) => (
          <div className="mb-3 text-end" key={key}>
            <label className="form-label">
              {label}
              {(key === "city" || key === "region") && (
                <span className="text-danger"> *</span>
              )}
            </label>
            <input
              type="text"
              className={`form-control ${
                errors[
                  `${section}${key.charAt(0).toUpperCase() + key.slice(1)}`
                ]
                  ? "is-invalid"
                  : ""
              }`}
              value={sectionData.address.national[key]}
              onChange={(e) => handleAddressChange(e, section, key)}
              disabled={loading}
            />
            {errors[
              `${section}${key.charAt(0).toUpperCase() + key.slice(1)}`
            ] && (
              <div className="invalid-feedback">
                {
                  errors[
                    `${section}${key.charAt(0).toUpperCase() + key.slice(1)}`
                  ]
                }
              </div>
            )}
          </div>
        ))}
      </>
    ),
    [errors, handleAddressChange, loading]
  );

  // Render person section component
  const renderPersonSection = useCallback(
    (section, title, sectionData) => (
      <div className="col-md-6">
        <h5 className="text-end mb-3">{title}</h5>

        <div className="mb-3 text-end">
          <label className="form-label">
            {section === "sender" ? "اسم المرسل" : "اسم المستلم"}
            <span className="text-danger"> *</span>
          </label>
          <input
            type="text"
            className={`form-control ${
              errors[`${section}Name`] ? "is-invalid" : ""
            }`}
            value={sectionData.name}
            onChange={(e) => handleChange(e, section, "name")}
            disabled={loading}
          />
          {errors[`${section}Name`] && (
            <div className="invalid-feedback">{errors[`${section}Name`]}</div>
          )}
        </div>

        <div className="mb-3 text-end">
          <label className="form-label">
            {section === "sender" ? "جوال المرسل" : "جوال المستلم"}
            <span className="text-danger"> *</span>
          </label>
          <input
            type="tel"
            className={`form-control ${
              errors[`${section}Phone`] ? "is-invalid" : ""
            }`}
            value={sectionData.phone}
            onChange={(e) => handleChange(e, section, "phone")}
            disabled={loading}
          />
          {errors[`${section}Phone`] && (
            <div className="invalid-feedback">{errors[`${section}Phone`]}</div>
          )}
        </div>

        <div className="mb-3 text-end">
          <label className="form-label">نوع العنوان</label>
          <div className="mt-2">
            <div className="form-check form-check-inline ms-3">
              <input
                type="radio"
                name={`${section}AddressType`}
                value="detailed"
                checked={sectionData.addressType === "detailed"}
                onChange={(e) => handleAddressTypeChange(e, section)}
                className="form-check-input"
                disabled={loading}
              />
              <label className="form-check-label">تفصيلي</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                name={`${section}AddressType`}
                value="short"
                checked={sectionData.addressType === "short"}
                onChange={(e) => handleAddressTypeChange(e, section)}
                className="form-check-input"
                disabled={loading}
              />
              <label className="form-check-label">كود مختصر</label>
            </div>
          </div>
        </div>

        {sectionData.addressType === "detailed" ? (
          renderAddressFields(section, sectionData)
        ) : (
          <div className="mb-3 text-end">
            <label className="form-label">
              الكود المختصر
              <span className="text-danger"> *</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors[`${section}ShortCode`] ? "is-invalid" : ""
              }`}
              value={sectionData.address.shortCode}
              onChange={(e) => handleShortCodeChange(e, section)}
              disabled={loading}
            />
            {errors[`${section}ShortCode`] && (
              <div className="invalid-feedback">
                {errors[`${section}ShortCode`]}
              </div>
            )}
          </div>
        )}
      </div>
    ),
    [
      errors,
      handleChange,
      handleAddressTypeChange,
      handleShortCodeChange,
      loading,
      renderAddressFields,
    ]
  );

  if (loading) {
    return (
      <div className="container">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/shipments")}
          disabled={submitting}
        >
          ← العودة
        </button>
        <h2 className="mb-0 text-end">تعديل الشحنة</h2>
      </div>

      <div className="card p-4 mt-4">
        <form onSubmit={handleSubmit}>
          <div className="row">
            {renderPersonSection("sender", "بيانات المرسل", form.sender)}
            {renderPersonSection("recipient", "بيانات المستلم", form.recipient)}
          </div>

          <hr className="my-4" />

          {/* Shipment information */}
          <div className="row">
            <div className="col-md-6 mb-3 text-end">
              <label className="form-label">نوع الشحنة</label>
              <select
                className="form-select"
                value={form.shipmentType}
                onChange={handleShipmentTypeChange}
                disabled={loading}
              >
                {SHIPMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {form.shipmentType === "عادي" && (
              <div className="col-md-6 mb-3 text-end">
                <label className="form-label">
                  الوزن (كجم)
                  <span className="text-danger"> *</span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className={`form-control ${
                    errors.weight ? "is-invalid" : ""
                  }`}
                  value={form.weight}
                  onChange={handleWeightChange}
                  disabled={loading}
                  placeholder="أدخل الوزن"
                />
                {errors.weight && (
                  <div className="invalid-feedback">{errors.weight}</div>
                )}
              </div>
            )}
          </div>

          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate("/shipments")}
              disabled={submitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={!isValid || submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التعديلات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
