// src/services/userService.js
import axios from "axios";

// ========== Configuration ==========
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// ========== Authentication Management ==========
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
  delete axios.defaults.headers.common["Authorization"];
}

/**
 * Update authentication token dynamically
 * @param {String} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }
};

// ========== Data Transformation Layer ==========

/**
 * Transform user data from API format to app format
 * @param {Object} user - User object from API
 * @returns {Object|null} Transformed user object
 */
const transformUserData = (user) => {
  if (!user) return null;

  return {
    id: user._id || user.id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user",
    userType: user.userType || "individual",
    isVerified: user.isVerified ?? false,

    // Company fields
    companyName: user.companyName || null,
    commercialRegister: user.commercialRegister || null,

    // Shipments
    shipments: user.shipments || [],
    shipmentsCount: user._count?.shipments || user.shipments?.length || 0,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Transform array of users from API format to app format
 * @param {Array} users - Array of user objects
 * @returns {Array} Transformed users array
 */
const transformUsersData = (users) => {
  if (!Array.isArray(users)) return [];
  return users.map(transformUserData);
};

// ========== CRUD Operations ==========

/**
 * Get all users with optional filters
 * @param {Object} params - Query parameters (filters, pagination, etc.)
 * @returns {Promise<Object>} Response with users list
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axios.get("/api/users", { params });

    // Transform response data if exists
    if (response.data?.success && response.data?.data) {
      if (Array.isArray(response.data.data)) {
        response.data.data = transformUsersData(response.data.data);
      } else if (response.data.data.users) {
        response.data.data.users = transformUsersData(response.data.data.users);
      }
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get current user data
 * @returns {Promise<Object>} Response with current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await axios.get("/api/users/me");

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformUserData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get user by ID with shipments
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Response with user data and shipments
 */
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);

    // Transform response data
    if (response.data?.success && response.data?.data) {
      const data = response.data.data;

      // Handle different response structures
      if (data.user && data.shipments) {
        response.data.data = {
          ...transformUserData(data.user),
          shipments: data.shipments,
          shipmentsCount: data.shipments.length,
        };
      } else {
        response.data.data = transformUserData(data);
      }
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get user data only (without shipments)
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Response with user data only
 */
export const getUserDataOnly = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);

    if (response.data?.success && response.data?.data) {
      const data = response.data.data;
      return {
        ...response,
        data: {
          ...response.data,
          data: transformUserData(data.user || data),
        },
      };
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get user shipments only
 * @param {String} userId - User ID
 * @returns {Promise<Array>} User's shipments
 */
export const getUserShipments = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data?.data?.shipments || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get full user details with statistics
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Response with user data and statistics
 */
export const getUserFullDetails = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    const data = response.data?.data;

    // Handle different response structures
    if (data?.user && data?.shipments) {
      return {
        ...response,
        data: {
          ...response.data,
          data: {
            ...transformUserData(data.user),
            shipmentsCount: data.shipments.length,
            shipments: data.shipments,
          },
        },
      };
    } else {
      return {
        ...response,
        data: {
          ...response.data,
          data: {
            ...transformUserData(data),
            shipmentsCount: 0,
            shipments: [],
          },
        },
      };
    }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update user data
 * @param {String} userId - User ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Response with updated user
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
 * Delete user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Role Management Operations ==========

/**
 * Update user role
 * @param {String} userId - User ID
 * @param {String} role - New role (user, admin, driver)
 * @returns {Promise<Object>} Response with updated user
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(`/api/users/${userId}`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Batch Operations ==========

/**
 * Update multiple users at once
 * @param {Array} updates - Array of update objects with id and data
 * @returns {Promise<Object>} Response with updated users
 */
export const batchUpdateUsers = async (updates) => {
  try {
    const response = await axios.patch("/api/users/batch", { updates });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete multiple users at once
 * @param {Array} userIds - Array of user IDs
 * @returns {Promise<Object>} Response confirming deletion
 */
export const batchDeleteUsers = async (userIds) => {
  try {
    const response = await axios.post("/api/users/batch-delete", {
      userIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Search & Filter Operations ==========

/**
 * Search users by criteria
 * @param {Object} filters - Search criteria (role, userType, isVerified, etc.)
 * @returns {Promise<Object>} Response with filtered users
 */
export const searchUsers = async (filters = {}) => {
  try {
    const response = await getAllUsers(filters);
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get users by type (individual / company)
 * @param {String} userType - User type
 * @returns {Promise<Object>} Response with filtered users
 */
export const getUsersByType = async (userType) => {
  try {
    const response = await getAllUsers({ userType });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get users by role (user / admin / driver)
 * @param {String} role - User role
 * @returns {Promise<Object>} Response with filtered users
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await getAllUsers({ role });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get verified users only
 * @returns {Promise<Object>} Response with verified users
 */
export const getVerifiedUsers = async () => {
  try {
    const response = await getAllUsers({ isVerified: true });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get unverified users
 * @returns {Promise<Object>} Response with unverified users
 */
export const getUnverifiedUsers = async () => {
  try {
    const response = await getAllUsers({ isVerified: false });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Utilities ==========

/**
 * Prepare user data for API submission
 * @param {Object} formData - Form data from UI
 * @returns {Object} Prepared payload for API
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
 * Map user data for display in UI
 * @param {Object} apiUser - User data from API
 * @returns {Object} Mapped user for UI display
 */
export const mapUserForDisplay = (apiUser) => {
  return {
    id: apiUser._id || apiUser.id,
    name: apiUser.name || "",
    email: apiUser.email || "",
    phone: apiUser.phone || "",
    role: apiUser.role || "user",
    roleLabel: getRoleLabel(apiUser.role),
    roleColor: getRoleColor(apiUser.role),
    roleIcon: getRoleIcon(apiUser.role),
    userType: apiUser.userType || "individual",
    userTypeLabel: getUserTypeLabel(apiUser.userType),
    userTypeIcon: getUserTypeIcon(apiUser.userType),
    isVerified: apiUser.isVerified ?? false,
    companyName: apiUser.companyName || null,
    commercialRegister: apiUser.commercialRegister || null,
    shipmentsCount: apiUser.shipmentsCount || 0,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
};

/**
 * Validate user data before submission
 * @param {Object} userData - User data to validate
 * @param {Boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result {isValid: boolean, errors: Object}
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

/**
 * Get role color for UI
 * @param {String} role - User role
 * @returns {String} Bootstrap color class
 */
export const getRoleColor = (role) => {
  const roleData = roles.find((r) => r.value === role);
  return roleData?.color || "secondary";
};

/**
 * Get role label in Arabic
 * @param {String} role - User role
 * @returns {String} Arabic label
 */
export const getRoleLabel = (role) => {
  const roleData = roles.find((r) => r.value === role);
  return roleData?.label || role;
};

/**
 * Get role icon
 * @param {String} role - User role
 * @returns {String} Icon emoji
 */
export const getRoleIcon = (role) => {
  const roleData = roles.find((r) => r.value === role);
  return roleData?.icon || "👤";
};

/**
 * Get user type label in Arabic
 * @param {String} userType - User type
 * @returns {String} Arabic label
 */
export const getUserTypeLabel = (userType) => {
  const typeData = userTypes.find((t) => t.value === userType);
  return typeData?.label || userType;
};

/**
 * Get user type icon
 * @param {String} userType - User type
 * @returns {String} Icon emoji
 */
export const getUserTypeIcon = (userType) => {
  const typeData = userTypes.find((t) => t.value === userType);
  return typeData?.icon || "👤";
};

// ========== Constants ==========

/**
 * User types
 */
export const USER_TYPES = {
  INDIVIDUAL: "individual",
  COMPANY: "company",
};

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  DRIVER: "driver",
};

/**
 * User types list for display
 */
export const userTypes = [
  { value: "individual", label: "فرد", icon: "👤" },
  { value: "company", label: "شركة", icon: "🏢" },
];

/**
 * User roles list for display
 */
export const roles = [
  { value: "admin", label: "مدير النظام", color: "danger", icon: "👑" },
  { value: "user", label: "مستخدم", color: "info", icon: "👤" },
  { value: "driver", label: "سائق", color: "success", icon: "🚗" },
];

// ========== Default Export (organized by feature) ==========
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

  // Role Management
  updateUserRole,
  getUsersByRole,
  getUsersByType,

  // Batch Operations
  batchUpdateUsers,
  batchDeleteUsers,

  // Verification
  getVerifiedUsers,
  getUnverifiedUsers,

  // Search
  searchUsers,

  // Utilities
  prepareUserPayload,
  mapUserForDisplay,
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

  // Data Transformation (for advanced usage)
  transformUserData,
  transformUsersData,
};
