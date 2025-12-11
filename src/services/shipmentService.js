// src/services/shipmentService.js
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
 * جلب جميع الشحنات
 * @param {Object} params - معاملات الاستعلام (filters, pagination, etc.)
 * @returns {Promise<Object>} - قائمة الشحنات
 */
export const getAllShipments = async (params = {}) => {
  try {
    const response = await axios.get("/api/shipments", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب شحنة معينة بواسطة رقم التتبع
 * @param {String} trackingNumber - رقم التتبع
 * @returns {Promise<Object>} - بيانات الشحنة
 */
export const getShipmentByTrackingNumber = async (trackingNumber) => {
  try {
    const response = await axios.get(`/api/shipments/${trackingNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * إنشاء شحنة جديدة
 * @param {Object} shipmentData - بيانات الشحنة
 * @returns {Promise<Object>} - الشحنة المنشأة
 */
export const createShipment = async (shipmentData) => {
  try {
    const response = await axios.post("/api/shipments", shipmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تحديث شحنة معينة
 * @param {String} trackingNumber - رقم التتبع
 * @param {Object} shipmentData - البيانات المحدثة
 * @returns {Promise<Object>} - الشحنة المحدثة
 */
export const updateShipment = async (trackingNumber, shipmentData) => {
  try {
    const response = await axios.put(
      `/api/shipments/${trackingNumber}`,
      shipmentData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * حذف شحنة معينة
 * @param {String} trackingNumber - رقم التتبع
 * @returns {Promise<Object>} - رسالة التأكيد
 */
export const deleteShipment = async (trackingNumber) => {
  try {
    const response = await axios.delete(`/api/shipments/${trackingNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تعيين سائق لشحنة معينة
 * @param {String} trackingNumber - رقم التتبع
 * @param {String} driverId - معرف السائق
 * @returns {Promise<Object>} - الشحنة المحدثة
 */
export const assignDriverToShipment = async (trackingNumber, driverId) => {
  try {
    const response = await axios.patch(
      `/api/shipments/${trackingNumber}/assign-driver`,
      { driverId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تحديث حالة الشحنة
 * @param {String} trackingNumber - رقم التتبع
 * @param {String} status - الحالة الجديدة (Pending, In Transit, Delivered, Cancelled)
 * @returns {Promise<Object>} - الشحنة المحدثة
 */
export const updateShipmentStatus = async (trackingNumber, status) => {
  try {
    const response = await axios.patch(
      `/api/shipments/${trackingNumber}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * البحث عن الشحنات بناءً على معايير معينة
 * @param {Object} filters - معايير البحث (status, shipmentType, sender, recipient, etc.)
 * @returns {Promise<Object>} - قائمة الشحنات المفلترة
 */
export const searchShipments = async (filters = {}) => {
  try {
    const response = await axios.get("/api/shipments/search", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات حسب الحالة
 * @param {String} status - الحالة (Pending, In Transit, Delivered, Cancelled)
 * @returns {Promise<Object>} - قائمة الشحنات
 */
export const getShipmentsByStatus = async (status) => {
  try {
    const response = await axios.get("/api/shipments", {
      params: { status },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات حسب نوع الشحنة
 * @param {String} shipmentType - نوع الشحنة (Normal, Document, Express)
 * @returns {Promise<Object>} - قائمة الشحنات
 */
export const getShipmentsByType = async (shipmentType) => {
  try {
    const response = await axios.get("/api/shipments", {
      params: { shipmentType },
    });
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
export const getShipmentsByDriver = async (driverId) => {
  try {
    const response = await axios.get(`/api/shipments/driver/${driverId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات الخاصة بمستخدم معين (كمرسل أو مستلم)
 * @param {String} userId - معرف المستخدم
 * @returns {Promise<Object>} - قائمة الشحنات
 */
export const getShipmentsByUser = async (userId) => {
  try {
    const response = await axios.get(`/api/shipments/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب إحصائيات الشحنات
 * @param {Object} filters - فلاتر اختيارية (dateFrom, dateTo, etc.)
 * @returns {Promise<Object>} - إحصائيات الشحنات
 */
export const getShipmentsStatistics = async (filters = {}) => {
  try {
    const response = await axios.get("/api/shipments/statistics", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تتبع الشحنة بواسطة رقم التتبع (للعملاء - بدون authentication)
 * @param {String} trackingNumber - رقم التتبع
 * @returns {Promise<Object>} - بيانات تتبع الشحنة
 */
export const trackShipment = async (trackingNumber) => {
  try {
    const response = await axios.get(`/api/track/${trackingNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * طباعة بوليصة الشحن
 * @param {String} trackingNumber - رقم التتبع
 * @returns {Promise<Blob>} - ملف PDF
 */
export const printShipmentLabel = async (trackingNumber) => {
  try {
    const response = await axios.get(`/api/shipments/${trackingNumber}/label`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تصدير الشحنات إلى Excel
 * @param {Object} filters - فلاتر اختيارية
 * @returns {Promise<Blob>} - ملف Excel
 */
export const exportShipmentsToExcel = async (filters = {}) => {
  try {
    const response = await axios.get("/api/shipments/export/excel", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تصدير الشحنات إلى PDF
 * @param {Object} filters - فلاتر اختيارية
 * @returns {Promise<Blob>} - ملف PDF
 */
export const exportShipmentsToPDF = async (filters = {}) => {
  try {
    const response = await axios.get("/api/shipments/export/pdf", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * إلغاء شحنة
 * @param {String} trackingNumber - رقم التتبع
 * @param {String} reason - سبب الإلغاء
 * @returns {Promise<Object>} - الشحنة المحدثة
 */
export const cancelShipment = async (trackingNumber, reason = "") => {
  try {
    const response = await axios.patch(
      `/api/shipments/${trackingNumber}/cancel`,
      { reason }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * إضافة ملاحظات للشحنة
 * @param {String} trackingNumber - رقم التتبع
 * @param {String} notes - الملاحظات
 * @returns {Promise<Object>} - الشحنة المحدثة
 */
export const addShipmentNotes = async (trackingNumber, notes) => {
  try {
    const response = await axios.patch(
      `/api/shipments/${trackingNumber}/notes`,
      { notes }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب سجل التغييرات للشحنة
 * @param {String} trackingNumber - رقم التتبع
 * @returns {Promise<Array>} - سجل التغييرات
 */
export const getShipmentHistory = async (trackingNumber) => {
  try {
    const response = await axios.get(
      `/api/shipments/${trackingNumber}/history`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * حساب تكلفة الشحن
 * @param {Object} shipmentData - بيانات الشحن (sender, recipient, weight, shipmentType)
 * @returns {Promise<Object>} - التكلفة المحسوبة
 */
export const calculateShippingCost = async (shipmentData) => {
  try {
    const response = await axios.post(
      "/api/shipments/calculate-cost",
      shipmentData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات بناءً على نطاق تاريخي
 * @param {String} startDate - تاريخ البداية (ISO format)
 * @param {String} endDate - تاريخ النهاية (ISO format)
 * @returns {Promise<Object>} - قائمة الشحنات
 */
export const getShipmentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await axios.get("/api/shipments", {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات المعلقة (Pending)
 * @returns {Promise<Object>} - قائمة الشحنات المعلقة
 */
export const getPendingShipments = async () => {
  try {
    const response = await axios.get("/api/shipments", {
      params: { status: "Pending" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات قيد التوصيل (In Transit)
 * @returns {Promise<Object>} - قائمة الشحنات قيد التوصيل
 */
export const getInTransitShipments = async () => {
  try {
    const response = await axios.get("/api/shipments", {
      params: { status: "In Transit" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات المكتملة (Delivered)
 * @returns {Promise<Object>} - قائمة الشحنات المكتملة
 */
export const getDeliveredShipments = async () => {
  try {
    const response = await axios.get("/api/shipments", {
      params: { status: "Delivered" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب الشحنات الملغاة (Cancelled)
 * @returns {Promise<Object>} - قائمة الشحنات الملغاة
 */
export const getCancelledShipments = async () => {
  try {
    const response = await axios.get("/api/shipments", {
      params: { status: "Cancelled" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * معالجة بيانات الشحنة من API إلى format مناسب للعرض
 * @param {Object} apiShipment - بيانات الشحنة من API
 * @returns {Object} - بيانات الشحنة المعالجة
 */
export const mapShipmentData = (apiShipment) => {
  return {
    id: apiShipment._id,
    trackingNumber: apiShipment.trackingNumber,
    sender: apiShipment.sender,
    recipient: apiShipment.recipient,
    status: apiShipment.status,
    shipmentType: apiShipment.shipmentType,
    weight: apiShipment.weight,
    cost: apiShipment.cost,
    assignedDriver: apiShipment.assignedDriver,
    notes: apiShipment.notes,
    paymentMethod: apiShipment.paymentMethod,
    paymentStatus: apiShipment.paymentStatus,
    packageSize: apiShipment.packageSize,
    nature: apiShipment.nature,
    createdAt: apiShipment.createdAt,
    updatedAt: apiShipment.updatedAt,
  };
};

/**
 * تجهيز بيانات الشحنة للإرسال إلى API
 * @param {Object} formData - بيانات النموذج
 * @param {String} senderAddressType - نوع عنوان المرسل (detailed/short)
 * @param {String} recipientAddressType - نوع عنوان المستلم (detailed/short)
 * @returns {Object} - البيانات المجهزة للإرسال
 */
export const prepareShipmentPayload = (
  formData,
  senderAddressType,
  recipientAddressType
) => {
  return {
    sender: {
      name: formData.sender.name.trim(),
      phone: formData.sender.phone.trim(),
      address:
        senderAddressType === "detailed"
          ? { national: formData.sender.address.national }
          : { shortCode: formData.sender.address.shortCode.trim() },
    },
    recipient: {
      name: formData.recipient.name.trim(),
      phone: formData.recipient.phone.trim(),
      address:
        recipientAddressType === "detailed"
          ? { national: formData.recipient.address.national }
          : { shortCode: formData.recipient.address.shortCode.trim() },
    },
    shipmentType: formData.shipmentType,
    ...(formData.shipmentType === "Normal" && {
      weight: Number(formData.weight),
    }),
    ...(formData.notes && { notes: formData.notes.trim() }),
  };
};

export default {
  // CRUD Operations
  getAllShipments,
  getShipmentByTrackingNumber,
  createShipment,
  updateShipment,
  deleteShipment,

  // Assignment & Status
  assignDriverToShipment,
  updateShipmentStatus,
  cancelShipment,
  addShipmentNotes,

  // Search & Filter
  searchShipments,
  getShipmentsByStatus,
  getShipmentsByType,
  getShipmentsByDriver,
  getShipmentsByUser,
  getShipmentsByDateRange,

  // Status-specific
  getPendingShipments,
  getInTransitShipments,
  getDeliveredShipments,
  getCancelledShipments,

  // Statistics & Export
  getShipmentsStatistics,
  exportShipmentsToExcel,
  exportShipmentsToPDF,

  // Tracking & History
  trackShipment,
  getShipmentHistory,

  // Utilities
  printShipmentLabel,
  calculateShippingCost,
  mapShipmentData,
  prepareShipmentPayload,

  // Auth
  setAuthToken,
};
