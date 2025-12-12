// src/components/Cities/CityModal.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import {
  createCity,
  updateCity,
  validateCityData,
  validateShippingRouteData,
  prepareCityPayload,
  CITY_TYPES,
  getAllCities,
} from "../../services/cityService";
import ReactDOM from "react-dom";

export default function CityModal({
  show,
  handleClose,
  city = null,
  onSuccess,
}) {
  const isEditMode = !!city;

  // الحالة الأساسية للمدينة
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    region: "",
    type: "city",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    localDelivery: {
      small: "",
      medium: "",
      large: "",
    },
    shippingTo: {},
    isActive: true,
  });

  // حالة مسار الشحن الجديد
  const [newRoute, setNewRoute] = useState({
    destinationCity: "",
    distanceKm: "",
    small: "",
    medium: "",
    large: "",
  });

  // حالات أخرى
  const [availableCities, setAvailableCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // تحميل البيانات عند فتح المودال
  useEffect(() => {
    if (show) {
      loadAvailableCities();
      if (isEditMode) {
        setFormData({
          name: city.name || "",
          nameEn: city.nameEn || "",
          region: city.region || "",
          type: city.type || "city",
          coordinates: {
            latitude: city.coordinates?.latitude || "",
            longitude: city.coordinates?.longitude || "",
          },
          localDelivery: {
            small: city.localDelivery?.small || "",
            medium: city.localDelivery?.medium || "",
            large: city.localDelivery?.large || "",
          },
          shippingTo: city.shippingTo || {},
          isActive: city.isActive !== undefined ? city.isActive : true,
        });
      }
    } else {
      resetForm();
    }
  }, [show, city]);

  // منع scroll للـ body عند فتح المودال
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // تحميل قائمة المدن المتاحة
  const loadAvailableCities = async () => {
    try {
      const response = await getAllCities();
      setAvailableCities(response.data || []);
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      name: "",
      nameEn: "",
      region: "",
      type: "city",
      coordinates: { latitude: "", longitude: "" },
      localDelivery: { small: "", medium: "", large: "" },
      shippingTo: {},
      isActive: true,
    });
    setNewRoute({
      destinationCity: "",
      distanceKm: "",
      small: "",
      medium: "",
      large: "",
    });
    setErrors({});
    setSubmitError("");
    setActiveTab("basic");
  };

  // معالجة التغييرات في الحقول
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // معالجة التغييرات في الإحداثيات
  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: value,
      },
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // معالجة التغييرات في التوصيل المحلي
  const handleLocalDeliveryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      localDelivery: {
        ...prev.localDelivery,
        [name]: value,
      },
    }));
    if (
      errors[`localDelivery${name.charAt(0).toUpperCase() + name.slice(1)}`]
    ) {
      setErrors((prev) => ({
        ...prev,
        [`localDelivery${name.charAt(0).toUpperCase() + name.slice(1)}`]: "",
      }));
    }
  };

  // معالجة التغييرات في مسار الشحن الجديد
  const handleNewRouteChange = (e) => {
    const { name, value } = e.target;
    setNewRoute((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // إضافة مسار شحن جديد
  const handleAddRoute = () => {
    const validation = validateShippingRouteData(newRoute);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      shippingTo: {
        ...prev.shippingTo,
        [newRoute.destinationCity]: {
          distanceKm: Number(newRoute.distanceKm),
          small: Number(newRoute.small),
          medium: Number(newRoute.medium),
          large: Number(newRoute.large),
        },
      },
    }));

    setNewRoute({
      destinationCity: "",
      distanceKm: "",
      small: "",
      medium: "",
      large: "",
    });
    setErrors({});
  };

  // حذف مسار شحن
  const handleDeleteRoute = (cityName) => {
    setFormData((prev) => {
      const newShippingTo = { ...prev.shippingTo };
      delete newShippingTo[cityName];
      return {
        ...prev,
        shippingTo: newShippingTo,
      };
    });
  };

  // حفظ المدينة
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validation = validateCityData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setActiveTab("basic");
      return;
    }

    setLoading(true);
    try {
      const payload = prepareCityPayload(formData);

      if (isEditMode) {
        await updateCity(city.id || city._id, payload);
      } else {
        await createCity(payload);
      }

      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error saving city:", error);
      setSubmitError(
        error.message ||
          `حدث خطأ أثناء ${isEditMode ? "تحديث" : "إضافة"} المدينة`
      );
    } finally {
      setLoading(false);
    }
  };

  // فلترة المدن المتاحة
  const getAvailableDestinations = () => {
    return availableCities.filter(
      (c) =>
        c.name !== formData.name &&
        !Object.keys(formData.shippingTo).includes(c.name)
    );
  };

  if (!show) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={handleClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10000,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      ></div>

      {/* Modal */}
      <div
        className="modal d-block"
        tabIndex="-1"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-100%, -50%)",
          zIndex: 10001,
          width: "100%",
          height: "100%",
          overflow: "auto",
          paddingRight: "0 !important",
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" style={{ maxHeight: "90vh" }}>
            {/* Header */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                {isEditMode ? "تعديل المدينة" : "إضافة مدينة جديدة"}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
              ></button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div
                className="modal-body"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                {submitError && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    {submitError}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSubmitError("")}
                    ></button>
                  </div>
                )}

                {/* Tabs */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "basic" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("basic")}
                    >
                      البيانات الأساسية
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "local" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("local")}
                    >
                      التوصيل المحلي
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "routes" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("routes")}
                    >
                      مسارات الشحن
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* البيانات الأساسية */}
                  {activeTab === "basic" && (
                    <div className="tab-pane fade show active">
                      <div className="row g-3">
                        {/* الاسم بالعربي */}
                        <div className="col-md-6">
                          <label className="form-label">
                            الاسم بالعربي <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${
                              errors.name ? "is-invalid" : ""
                            }`}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="مثال: الرياض"
                            required
                          />
                          {errors.name && (
                            <div className="invalid-feedback">
                              {errors.name}
                            </div>
                          )}
                        </div>

                        {/* الاسم بالإنجليزي */}
                        <div className="col-md-6">
                          <label className="form-label">
                            الاسم بالإنجليزي{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${
                              errors.nameEn ? "is-invalid" : ""
                            }`}
                            name="nameEn"
                            value={formData.nameEn}
                            onChange={handleInputChange}
                            placeholder="Example: Riyadh"
                            required
                          />
                          {errors.nameEn && (
                            <div className="invalid-feedback">
                              {errors.nameEn}
                            </div>
                          )}
                        </div>

                        {/* المنطقة */}
                        <div className="col-md-6">
                          <label className="form-label">
                            المنطقة <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${
                              errors.region ? "is-invalid" : ""
                            }`}
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            placeholder="مثال: الرياض"
                            required
                          />
                          {errors.region && (
                            <div className="invalid-feedback">
                              {errors.region}
                            </div>
                          )}
                        </div>

                        {/* نوع المدينة */}
                        <div className="col-md-6">
                          <label className="form-label">
                            نوع المدينة <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${
                              errors.type ? "is-invalid" : ""
                            }`}
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                          >
                            {CITY_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {errors.type && (
                            <div className="invalid-feedback">
                              {errors.type}
                            </div>
                          )}
                        </div>

                        {/* خط العرض */}
                        <div className="col-md-6">
                          <label className="form-label">
                            خط العرض (Latitude){" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            className={`form-control ${
                              errors.latitude ? "is-invalid" : ""
                            }`}
                            name="latitude"
                            value={formData.coordinates.latitude}
                            onChange={handleCoordinateChange}
                            placeholder="مثال: 24.7136"
                            required
                          />
                          {errors.latitude && (
                            <div className="invalid-feedback">
                              {errors.latitude}
                            </div>
                          )}
                        </div>

                        {/* خط الطول */}
                        <div className="col-md-6">
                          <label className="form-label">
                            خط الطول (Longitude){" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            className={`form-control ${
                              errors.longitude ? "is-invalid" : ""
                            }`}
                            name="longitude"
                            value={formData.coordinates.longitude}
                            onChange={handleCoordinateChange}
                            placeholder="مثال: 46.6753"
                            required
                          />
                          {errors.longitude && (
                            <div className="invalid-feedback">
                              {errors.longitude}
                            </div>
                          )}
                        </div>

                        {/* حالة التفعيل */}
                        <div className="col-md-12">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isActive"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="isActive"
                            >
                              مدينة نشطة
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* التوصيل المحلي */}
                  {activeTab === "local" && (
                    <div className="tab-pane fade show active">
                      <div className="row g-3">
                        <div className="col-md-12">
                          <div className="alert alert-info">
                            <strong>أسعار التوصيل داخل المدينة نفسها</strong>
                          </div>
                        </div>

                        {/* طرد صغير */}
                        <div className="col-md-4">
                          <label className="form-label">
                            طرد صغير (ريال){" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className={`form-control ${
                              errors.localDeliverySmall ? "is-invalid" : ""
                            }`}
                            name="small"
                            value={formData.localDelivery.small}
                            onChange={handleLocalDeliveryChange}
                            placeholder="15"
                            required
                          />
                          {errors.localDeliverySmall && (
                            <div className="invalid-feedback">
                              {errors.localDeliverySmall}
                            </div>
                          )}
                        </div>

                        {/* طرد متوسط */}
                        <div className="col-md-4">
                          <label className="form-label">
                            طرد متوسط (ريال){" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className={`form-control ${
                              errors.localDeliveryMedium ? "is-invalid" : ""
                            }`}
                            name="medium"
                            value={formData.localDelivery.medium}
                            onChange={handleLocalDeliveryChange}
                            placeholder="22"
                            required
                          />
                          {errors.localDeliveryMedium && (
                            <div className="invalid-feedback">
                              {errors.localDeliveryMedium}
                            </div>
                          )}
                        </div>

                        {/* طرد كبير */}
                        <div className="col-md-4">
                          <label className="form-label">
                            طرد كبير (ريال){" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className={`form-control ${
                              errors.localDeliveryLarge ? "is-invalid" : ""
                            }`}
                            name="large"
                            value={formData.localDelivery.large}
                            onChange={handleLocalDeliveryChange}
                            placeholder="35"
                            required
                          />
                          {errors.localDeliveryLarge && (
                            <div className="invalid-feedback">
                              {errors.localDeliveryLarge}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* مسارات الشحن */}
                  {activeTab === "routes" && (
                    <div className="tab-pane fade show active">
                      {/* إضافة مسار جديد */}
                      <div className="border rounded p-3 mb-3 bg-light">
                        <h6 className="mb-3">إضافة مسار شحن جديد</h6>
                        <div className="row g-2">
                          <div className="col-md-12">
                            <label className="form-label">
                              المدينة المستهدفة
                            </label>
                            <select
                              className={`form-select ${
                                errors.destinationCity ? "is-invalid" : ""
                              }`}
                              name="destinationCity"
                              value={newRoute.destinationCity}
                              onChange={handleNewRouteChange}
                            >
                              <option value="">اختر المدينة...</option>
                              {getAvailableDestinations().map((city) => (
                                <option key={city._id} value={city.name}>
                                  {city.name} ({city.nameEn})
                                </option>
                              ))}
                            </select>
                            {errors.destinationCity && (
                              <div className="invalid-feedback">
                                {errors.destinationCity}
                              </div>
                            )}
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">المسافة (كم)</label>
                            <input
                              type="number"
                              className={`form-control ${
                                errors.distanceKm ? "is-invalid" : ""
                              }`}
                              name="distanceKm"
                              value={newRoute.distanceKm}
                              onChange={handleNewRouteChange}
                              placeholder="950"
                            />
                            {errors.distanceKm && (
                              <div className="invalid-feedback">
                                {errors.distanceKm}
                              </div>
                            )}
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">صغير (ريال)</label>
                            <input
                              type="number"
                              step="0.01"
                              className={`form-control ${
                                errors.small ? "is-invalid" : ""
                              }`}
                              name="small"
                              value={newRoute.small}
                              onChange={handleNewRouteChange}
                              placeholder="45"
                            />
                            {errors.small && (
                              <div className="invalid-feedback">
                                {errors.small}
                              </div>
                            )}
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">متوسط (ریال)</label>
                            <input
                              type="number"
                              step="0.01"
                              className={`form-control ${
                                errors.medium ? "is-invalid" : ""
                              }`}
                              name="medium"
                              value={newRoute.medium}
                              onChange={handleNewRouteChange}
                              placeholder="65"
                            />
                            {errors.medium && (
                              <div className="invalid-feedback">
                                {errors.medium}
                              </div>
                            )}
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">كبير (ریال)</label>
                            <input
                              type="number"
                              step="0.01"
                              className={`form-control ${
                                errors.large ? "is-invalid" : ""
                              }`}
                              name="large"
                              value={newRoute.large}
                              onChange={handleNewRouteChange}
                              placeholder="95"
                            />
                            {errors.large && (
                              <div className="invalid-feedback">
                                {errors.large}
                              </div>
                            )}
                          </div>

                          <div className="col-md-12">
                            <button
                              type="button"
                              className="btn btn-success btn-sm w-100"
                              onClick={handleAddRoute}
                            >
                              <FaPlus className="me-2" />
                              إضافة المسار
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* عرض المسارات المضافة */}
                      <div>
                        <h6 className="mb-3">
                          المسارات المضافة (
                          {Object.keys(formData.shippingTo).length})
                        </h6>
                        {Object.keys(formData.shippingTo).length === 0 ? (
                          <div className="alert alert-warning">
                            لا توجد مسارات شحن مضافة بعد
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-sm table-bordered">
                              <thead className="table-light">
                                <tr>
                                  <th>المدينة</th>
                                  <th>المسافة</th>
                                  <th>صغير</th>
                                  <th>متوسط</th>
                                  <th>كبير</th>
                                  <th>إجراءات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(formData.shippingTo).map(
                                  ([cityName, route]) => (
                                    <tr key={cityName}>
                                      <td>{cityName}</td>
                                      <td>{route.distanceKm} كم</td>
                                      <td>{route.small} ريال</td>
                                      <td>{route.medium} ريال</td>
                                      <td>{route.large} ريال</td>
                                      <td>
                                        <button
                                          type="button"
                                          className="btn btn-danger btn-sm"
                                          onClick={() =>
                                            handleDeleteRoute(cityName)
                                          }
                                        >
                                          <FaTrash />
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  <FaTimes className="me-2" />
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      {isEditMode ? "تحديث" : "إضافة"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );

  // استخدام ReactDOM.createPortal لعرض المودال خارج شجرة DOM الأساسية
  return ReactDOM.createPortal(modalContent, document.body);
}
