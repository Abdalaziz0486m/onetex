// src/services/userService.js
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
 * جلب جميع المستخدمين
 * @param {Object} params - معاملات الاستعلام (filters, pagination, etc.)
 * @returns {Promise} - قائمة المستخدمين
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axios.get("/api/users", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب بيانات المستخدم الحالي
 * @returns {Promise} - بيانات المستخدم
 */
export const getCurrentUser = async () => {
  try {
    const response = await axios.get("/api/users/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب مستخدم معين بواسطة ID مع الشحنات الخاصة به
 * @param {String} userId - معرف المستخدم
 * @returns {Promise<{user: Object, shipments: Array}>} - بيانات المستخدم والشحنات
 */
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data; // { user: {...}, shipments: [...] }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب بيانات المستخدم فقط (بدون الشحنات)
 * @param {String} userId - معرف المستخدم
 * @returns {Promise<Object>} - بيانات المستخدم فقط
 */
export const getUserDataOnly = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data.user || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب شحنات المستخدم فقط
 * @param {String} userId - معرف المستخدم
 * @returns {Promise<Array>} - قائمة الشحنات
 */
export const getUserShipments = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data.shipments || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب تفاصيل كاملة عن المستخدم (مع معلومات إضافية)
 * @param {String} userId - معرف المستخدم
 * @returns {Promise<Object>} - بيانات المستخدم مع إحصائيات
 */
export const getUserFullDetails = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    const data = response.data;

    // Handle different response structures
    if (data.user && data.shipments) {
      return {
        ...data.user,
        shipmentsCount: data.shipments.length,
        shipments: data.shipments,
      };
    } else {
      return {
        ...data,
        shipmentsCount: 0,
        shipments: [],
      };
    }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تحديث بيانات مستخدم معين
 * @param {String} userId - معرف المستخدم
 * @param {Object} data - البيانات المراد تحديثها
 * @returns {Promise} - بيانات المستخدم المحدثة
 */
export const updateUser = async (userId, data) => {
  try {
    const response = await axios.put(`/api/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * حذف مستخدم معين
 * @param {String} userId - معرف المستخدم
 * @returns {Promise} - رسالة التأكيد
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * تحديث صلاحيات المستخدم (Role)
 * @param {String} userId - معرف المستخدم
 * @param {String} role - الصلاحية الجديدة (user, admin, driver)
 * @returns {Promise} - بيانات المستخدم المحدثة
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(`/api/users/${userId}`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * البحث عن المستخدمين بناءً على معايير معينة
 * @param {Object} filters - معايير البحث (role, userType, isVerified, etc.)
 * @returns {Promise} - قائمة المستخدمين المفلترة
 */
export const searchUsers = async (filters = {}) => {
  try {
    const response = await axios.get("/api/users", { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب المستخدمين حسب النوع (individual / company)
 * @param {String} userType - نوع المستخدم
 * @returns {Promise} - قائمة المستخدمين
 */
export const getUsersByType = async (userType) => {
  try {
    const response = await axios.get("/api/users", {
      params: { userType },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب المستخدمين حسب الدور (user / admin / driver)
 * @param {String} role - دور المستخدم
 * @returns {Promise} - قائمة المستخدمين
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await axios.get("/api/users", {
      params: { role },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب المستخدمين المفعلين فقط
 * @returns {Promise} - قائمة المستخدمين المفعلين
 */
export const getVerifiedUsers = async () => {
  try {
    const response = await axios.get("/api/users", {
      params: { isVerified: true },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب المستخدمين الغير مفعلين
 * @returns {Promise} - قائمة المستخدمين الغير مفعلين
 */
export const getUnverifiedUsers = async () => {
  try {
    const response = await axios.get("/api/users", {
      params: { isVerified: false },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== Helper Functions ====================

/**
 * معالجة بيانات المستخدم من API إلى format مناسب للعرض
 * @param {Object} apiUser - بيانات المستخدم من API
 * @returns {Object} - بيانات المستخدم المعالجة
 */
export const mapUserData = (apiUser) => {
  return {
    id: apiUser._id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: apiUser.role,
    userType: apiUser.userType,
    isVerified: apiUser.isVerified,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    // Company fields if exists
    ...(apiUser.companyName && { companyName: apiUser.companyName }),
    ...(apiUser.commercialRegister && {
      commercialRegister: apiUser.commercialRegister,
    }),
  };
};

/**
 * تجهيز بيانات المستخدم للإرسال إلى API
 * @param {Object} formData - بيانات النموذج
 * @returns {Object} - البيانات المجهزة للإرسال
 */
export const prepareUserPayload = (formData) => {
  const payload = {};

  // Basic fields
  if (formData.name) payload.name = formData.name.trim();
  if (formData.email) payload.email = formData.email.trim();
  if (formData.phone) payload.phone = formData.phone.trim();
  if (formData.role) payload.role = formData.role;
  if (formData.userType) payload.userType = formData.userType;

  // Company fields
  if (formData.companyName) payload.companyName = formData.companyName.trim();
  if (formData.commercialRegister)
    payload.commercialRegister = formData.commercialRegister.trim();

  // Password if provided
  if (formData.password) payload.password = formData.password;

  // Verification status
  if (formData.hasOwnProperty("isVerified")) {
    payload.isVerified = formData.isVerified;
  }

  return payload;
};

/**
 * التحقق من صحة بيانات المستخدم
 * @param {Object} userData - بيانات المستخدم
 * @param {Boolean} isUpdate - هل هو تحديث (لا يتطلب كل الحقول)
 * @returns {Object} - {isValid: boolean, errors: Object}
 */
export const validateUserData = (userData, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || userData.name !== undefined) {
    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = "يجب إدخال اسم صحيح (حرفين على الأقل)";
    }
  }

  if (!isUpdate || userData.email !== undefined) {
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = "يجب إدخال بريد إلكتروني صحيح";
    }
  }

  if (!isUpdate || userData.phone !== undefined) {
    if (userData.phone && !/^05\d{8}$/.test(userData.phone)) {
      errors.phone = "يجب إدخال رقم جوال سعودي صحيح (05xxxxxxxx)";
    }
  }

  if (!isUpdate || userData.role !== undefined) {
    if (!userData.role) {
      errors.role = "يجب اختيار الدور";
    }
  }

  if (!isUpdate || userData.userType !== undefined) {
    if (!userData.userType) {
      errors.userType = "يجب اختيار نوع المستخدم";
    }
  }

  // Company validation for company userType
  if (userData.userType === "company") {
    if (!userData.companyName || userData.companyName.trim().length < 2) {
      errors.companyName = "يجب إدخال اسم الشركة";
    }
    if (
      !userData.commercialRegister ||
      userData.commercialRegister.trim().length < 5
    ) {
      errors.commercialRegister = "يجب إدخال رقم السجل التجاري";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== Constants ====================

/**
 * أنواع المستخدمين
 */
export const USER_TYPES = {
  INDIVIDUAL: "individual",
  COMPANY: "company",
};

/**
 * أدوار المستخدمين
 */
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  DRIVER: "driver",
};

/**
 * قائمة الأنواع للعرض
 */
export const userTypes = [
  { value: "individual", label: "فرد", icon: "👤" },
  { value: "company", label: "شركة", icon: "🏢" },
];

/**
 * قائمة الأدوار للعرض
 */
export const roles = [
  { value: "admin", label: "مدير النظام", color: "danger", icon: "👑" },
  { value: "user", label: "مستخدم", color: "info", icon: "👤" },
  { value: "driver", label: "سائق", color: "success", icon: "🚗" },
];

/**
 * الحصول على لون الدور
 * @param {String} role - الدور
 * @returns {String} - اسم اللون (Bootstrap class)
 */
export const getRoleColor = (role) => {
  const roleData = roles.find((r) => r.value === role);
  return roleData?.color || "secondary";
};

/**
 * الحصول على تسمية الدور بالعربي
 * @param {String} role - الدور
 * @returns {String} - التسمية بالعربي
 */
export const getRoleLabel = (role) => {
  const roleData = roles.find((r) => r.value === role);
  return roleData?.label || role;
};

/**
 * الحصول على أيقونة الدور
 * @param {String} role - الدور
 * @returns {String} - الأيقونة
 */
export const getRoleIcon = (role) => {
  const roleData = roles.find((r) => r.value === role);
  return roleData?.icon || "👤";
};

/**
 * الحصول على تسمية النوع بالعربي
 * @param {String} userType - النوع
 * @returns {String} - التسمية بالعربي
 */
export const getUserTypeLabel = (userType) => {
  const typeData = userTypes.find((t) => t.value === userType);
  return typeData?.label || userType;
};

/**
 * الحصول على أيقونة النوع
 * @param {String} userType - النوع
 * @returns {String} - الأيقونة
 */
export const getUserTypeIcon = (userType) => {
  const typeData = userTypes.find((t) => t.value === userType);
  return typeData?.icon || "👤";
};

export default {
  // CRUD Operations
  getAllUsers,
  getCurrentUser,
  getUserById,
  getUserDataOnly,
  getUserShipments,
  getUserFullDetails,
  updateUser,
  deleteUser,

  // Role & Type Management
  updateUserRole,
  getUsersByRole,
  getUsersByType,

  // Verification
  getVerifiedUsers,
  getUnverifiedUsers,

  // Search
  searchUsers,

  // Utilities
  mapUserData,
  prepareUserPayload,
  validateUserData,
  getRoleColor,
  getRoleLabel,
  getRoleIcon,
  getUserTypeLabel,
  getUserTypeIcon,

  // Constants
  USER_TYPES,
  USER_ROLES,
  userTypes,
  roles,

  // Auth
  setAuthToken,
};
