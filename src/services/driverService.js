// src/services/driverService.js
import axios from "axios";

// تعيين الـ baseURL في axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// إعداد الـ token
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
  delete axios.defaults.headers.common["Authorization"];
}

// دالة لتحديث الـ token ديناميكيًا
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }
};

// ==================== الخدمات ====================

/**
 * جلب جميع السائقين
 * @param {Object} params - معاملات الاستعلام (filters, pagination, etc.)
 * @returns {Promise<Object>} - قائمة السائقين
 */
export const getAllDrivers = async (params = {}) => {
  try {
    const response = await axios.get("/api/drivers", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب سائق معين بواسطة ID
 * @param {String} driverId - معرف السائق
 * @returns {Promise<Object>} - بيانات السائق
 */
export const getDriverById = async (driverId) => {
  try {
    const response = await axios.get(`/api/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * إنشاء سائق جديد
 * @param {Object} driverData - بيانات السائق
 * @returns {Promise<Object>} - السائق المنشأ
 */
export const createDriver = async (driverData) => {
  try {
    const response = await axios.post("/api/drivers", driverData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تحديث سائق معين
 * @param {String} driverId - معرف السائق
 * @param {Object} driverData - البيانات المحدثة
 * @returns {Promise<Object>} - السائق المحدث
 */
export const updateDriver = async (driverId, driverData) => {
  try {
    const response = await axios.put(`/api/drivers/${driverId}`, driverData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * حذف سائق معين
 * @param {String} driverId - معرف السائق
 * @returns {Promise<Object>} - رسالة التأكيد
 */
export const deleteDriver = async (driverId) => {
  try {
    const response = await axios.delete(`/api/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات الخاصة بسائق معين
 * @param {String} driverId - معرف السائق
 * @returns {Promise<Object>} - قائمة الشحنات
 */
export const getDriverShipments = async (driverId) => {
  try {
    const response = await axios.get(`/api/drivers/${driverId}/shipments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * البحث عن السائقين بناءً على معايير معينة
 * @param {Object} filters - معايير البحث (name, phone, region, area, etc.)
 * @returns {Promise<Object>} - قائمة السائقين المفلترة
 */
export const searchDrivers = async (filters = {}) => {
  try {
    const response = await axios.get("/api/drivers/search", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب السائقين حسب المنطقة
 * @param {String} region - اسم المنطقة
 * @returns {Promise<Object>} - قائمة السائقين
 */
export const getDriversByRegion = async (region) => {
  try {
    const response = await axios.get("/api/drivers", {
      params: { region },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب السائقين حسب الحي
 * @param {String} area - اسم الحي
 * @returns {Promise<Object>} - قائمة السائقين
 */
export const getDriversByArea = async (area) => {
  try {
    const response = await axios.get("/api/drivers", {
      params: { area },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب إحصائيات السائقين
 * @param {Object} filters - فلاتر اختيارية
 * @returns {Promise<Object>} - إحصائيات السائقين
 */
export const getDriversStatistics = async (filters = {}) => {
  try {
    const response = await axios.get("/api/drivers/statistics", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تصدير السائقين إلى Excel
 * @param {Object} filters - فلاتر اختيارية
 * @returns {Promise<Blob>} - ملف Excel
 */
export const exportDriversToExcel = async (filters = {}) => {
  try {
    const response = await axios.get("/api/drivers/export/excel", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تصدير السائقين إلى PDF
 * @param {Object} filters - فلاتر اختيارية
 * @returns {Promise<Blob>} - ملف PDF
 */
export const exportDriversToPDF = async (filters = {}) => {
  try {
    const response = await axios.get("/api/drivers/export/pdf", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * معالجة بيانات السائق من API إلى format مناسب للعرض
 * @param {Object} apiDriver - بيانات السائق من API
 * @returns {Object} - بيانات السائق المعالجة
 */
export const mapDriverData = (apiDriver) => {
  return {
    id: apiDriver._id,
    name: apiDriver.name,
    phone: apiDriver.phone,
    licenseNumber: apiDriver.licenseNumber,
    region: apiDriver.region,
    area: apiDriver.Area, // لاحظ الـ capital A
    createdAt: apiDriver.createdAt,
    updatedAt: apiDriver.updatedAt,
  };
};

/**
 * تجهيز بيانات السائق للإرسال إلى API
 * @param {Object} formData - بيانات النموذج
 * @returns {Object} - البيانات المجهزة للإرسال
 */
export const prepareDriverPayload = (formData) => {
  return {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    licenseNumber: formData.licenseNumber.trim(),
    region: formData.city?.apiValue || formData.region,
    Area: formData.area?.apiValue || formData.Area, // لاحظ الـ capital A
  };
};

/**
 * التحقق من صحة بيانات السائق
 * @param {Object} driverData - بيانات السائق
 * @returns {Object} - {isValid: boolean, errors: Object}
 */
export const validateDriverData = (driverData) => {
  const errors = {};

  if (!driverData.name || driverData.name.trim().length < 2) {
    errors.name = "يجب إدخال اسم صحيح (حرفين على الأقل)";
  }

  if (!driverData.phone || !/^05\d{8}$/.test(driverData.phone)) {
    errors.phone = "يجب إدخال رقم جوال سعودي صحيح (05xxxxxxxx)";
  }

  if (!driverData.licenseNumber || driverData.licenseNumber.trim().length < 3) {
    errors.licenseNumber = "يجب إدخال رقم رخصة صحيح";
  }

  if (!driverData.region) {
    errors.region = "يجب اختيار المنطقة";
  }

  if (!driverData.Area) {
    errors.Area = "يجب اختيار الحي";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// بيانات المدن والأحياء للاستخدام في النماذج
export const cities = [
  { value: "riyadh", label: "الرياض", apiValue: "Riyadh" },
  { value: "jeddah", label: "جدة", apiValue: "Jeddah" },
  { value: "dammam", label: "الدمام", apiValue: "Dammam" },
];

export const areas = {
  riyadh: [
    { value: "east", label: "الرياض الشرقية", apiValue: "East Riyadh" },
    { value: "west", label: "الرياض الغربية", apiValue: "West Riyadh" },
  ],
  jeddah: [
    { value: "north", label: "جدة الشمالية", apiValue: "North Jeddah" },
    { value: "south", label: "جدة الجنوبية", apiValue: "South Jeddah" },
  ],
  dammam: [
    { value: "center", label: "وسط الدمام", apiValue: "Central Dammam" },
    {
      value: "industrial",
      label: "المنطقة الصناعية",
      apiValue: "Industrial Area",
    },
  ],
};

/**
 * الحصول على خيارات المدينة من apiValue
 * @param {String} apiValue - القيمة من API
 * @returns {Object|null} - خيار المدينة
 */
export const getCityOptionFromApiValue = (apiValue) => {
  return cities.find((city) => city.apiValue === apiValue) || null;
};

/**
 * الحصول على خيارات الحي من apiValue
 * @param {String} cityValue - قيمة المدينة
 * @param {String} apiValue - القيمة من API
 * @returns {Object|null} - خيار الحي
 */
export const getAreaOptionFromApiValue = (cityValue, apiValue) => {
  if (!cityValue || !areas[cityValue]) return null;
  return areas[cityValue].find((area) => area.apiValue === apiValue) || null;
};

/**
 * جلب السائقين المعلقين (غير الموافق عليهم)
 * @param {Object} params - معاملات الاستعلام (filters, pagination, etc.)
 * @returns {Promise<Object>} - قائمة السائقين المعلقين
 */
export const getPendingDrivers = async (params = {}) => {
  try {
    const response = await axios.get("/api/drivers/pending", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب السائقين الموافق عليهم
 * @param {Object} params - معاملات الاستعلام (filters, pagination, etc.)
 * @returns {Promise<Object>} - قائمة السائقين الموافق عليهم
 */
export const getApprovedDrivers = async (params = {}) => {
  try {
    const response = await axios.get("/api/drivers/approved", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * الموافقة على سائق
 * @param {String} driverId - معرف السائق
 * @returns {Promise<Object>} - بيانات السائق بعد الموافقة
 */
export const approveDriver = async (driverId) => {
  try {
    const response = await axios.post(`/api/drivers/${driverId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * رفض سائق
 * @param {String} driverId - معرف السائق
 * @returns {Promise<Object>} - رسالة التأكيد
 */
export const rejectDriver = async (driverId) => {
  try {
    const response = await axios.post(`/api/drivers/${driverId}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // CRUD Operations
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,

  // Driver Shipments
  getDriverShipments,

  // Search & Filter
  searchDrivers,
  getDriversByRegion,
  getDriversByArea,

  // Driver Approval Management
  getPendingDrivers,
  getApprovedDrivers,
  approveDriver,
  rejectDriver,

  // Statistics & Export
  getDriversStatistics,
  exportDriversToExcel,
  exportDriversToPDF,

  // Utilities
  mapDriverData,
  prepareDriverPayload,
  validateDriverData,
  getCityOptionFromApiValue,
  getAreaOptionFromApiValue,

  // Constants
  cities,
  areas,

  // Auth
  setAuthToken,
};