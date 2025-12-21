// src/services/driverService.js
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
 * Transform driver data from API format to app format
 * @param {Object} driver - Driver object from API
 * @returns {Object|null} Transformed driver object
 */
const transformDriverData = (driver) => {
  if (!driver) return null;

  return {
    id: driver._id || driver.id,
    name: driver.name || "",
    phone: driver.phone || "",
    licenseNumber: driver.licenseNumber || "",
    region: driver.region || "",
    area: driver.Area || driver.area || "", // Handle both cases

    // Shipments
    shipments: driver.shipments || [],
    shipmentsCount: driver._count?.shipments || driver.shipments?.length || 0,

    // Statistics
    completedShipments: driver.completedShipments || 0,
    pendingShipments: driver.pendingShipments || 0,

    // Status
    isActive: driver.isActive ?? true,
    isApproved: driver.isApproved ?? false,

    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  };
};

/**
 * Transform array of drivers from API format to app format
 * @param {Array} drivers - Array of driver objects
 * @returns {Array} Transformed drivers array
 */
const transformDriversData = (drivers) => {
  if (!Array.isArray(drivers)) return [];
  return drivers.map(transformDriverData);
};

// ========== CRUD Operations ==========

/**
 * Get all drivers with optional filters
 * @param {Object} params - Query parameters (filters, pagination, etc.)
 * @returns {Promise<Object>} Response with drivers list
 */
export const getAllDrivers = async (params = {}) => {
  try {
    const response = await axios.get("/api/drivers", { params });

    // Transform response data if exists
    if (response.data?.success && response.data?.data) {
      if (Array.isArray(response.data.data)) {
        response.data.data = transformDriversData(response.data.data);
      } else if (response.data.data.drivers) {
        response.data.data.drivers = transformDriversData(
          response.data.data.drivers
        );
      }
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get driver by ID
 * @param {String} driverId - Driver ID
 * @returns {Promise<Object>} Response with driver data
 */
export const getDriverById = async (driverId) => {
  try {
    const response = await axios.get(`/api/drivers/${driverId}`);

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformDriverData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new driver
 * @param {Object} driverData - Driver data
 * @returns {Promise<Object>} Response with created driver
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
 * Update existing driver
 * @param {String} driverId - Driver ID
 * @param {Object} driverData - Updated driver data
 * @returns {Promise<Object>} Response with updated driver
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
 * Delete driver
 * @param {String} driverId - Driver ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteDriver = async (driverId) => {
  try {
    const response = await axios.delete(`/api/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Driver Shipments Operations ==========

/**
 * Get driver's shipments
 * @param {String} driverId - Driver ID
 * @returns {Promise<Object>} Response with driver's shipments
 */
export const getDriverShipments = async (driverId) => {
  try {
    const response = await axios.get(`/api/drivers/${driverId}/shipments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Driver Approval Operations ==========

/**
 * Get pending drivers (not approved yet)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with pending drivers
 */
export const getPendingDrivers = async (params = {}) => {
  try {
    const response = await axios.get("/api/drivers/pending", { params });

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformDriversData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get approved drivers
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with approved drivers
 */
export const getApprovedDrivers = async (params = {}) => {
  try {
    const response = await axios.get("/api/drivers/approved", { params });

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformDriversData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Approve driver
 * @param {String} driverId - Driver ID
 * @returns {Promise<Object>} Response with approved driver
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
 * Reject driver
 * @param {String} driverId - Driver ID
 * @returns {Promise<Object>} Response confirming rejection
 */
export const rejectDriver = async (driverId) => {
  try {
    const response = await axios.post(`/api/drivers/${driverId}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Batch Operations ==========

/**
 * Create multiple drivers at once
 * @param {Array} driversData - Array of driver objects
 * @returns {Promise<Object>} Response with created drivers
 */
export const batchCreateDrivers = async (driversData) => {
  try {
    const response = await axios.post("/api/drivers/batch", {
      drivers: driversData,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update multiple drivers at once
 * @param {Array} updates - Array of update objects with id and data
 * @returns {Promise<Object>} Response with updated drivers
 */
export const batchUpdateDrivers = async (updates) => {
  try {
    const response = await axios.patch("/api/drivers/batch", { updates });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete multiple drivers at once
 * @param {Array} driverIds - Array of driver IDs
 * @returns {Promise<Object>} Response confirming deletion
 */
export const batchDeleteDrivers = async (driverIds) => {
  try {
    const response = await axios.post("/api/drivers/batch-delete", {
      driverIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Batch approve drivers
 * @param {Array} driverIds - Array of driver IDs
 * @returns {Promise<Object>} Response with approved drivers
 */
export const batchApproveDrivers = async (driverIds) => {
  try {
    const response = await axios.post("/api/drivers/batch-approve", {
      driverIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Search & Filter Operations ==========

/**
 * Search drivers by criteria
 * @param {Object} filters - Search criteria (name, phone, region, area, etc.)
 * @returns {Promise<Object>} Response with filtered drivers
 */
export const searchDrivers = async (filters = {}) => {
  try {
    const response = await axios.get("/api/drivers/search", {
      params: filters,
    });

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformDriversData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get drivers by region
 * @param {String} region - Region name
 * @returns {Promise<Object>} Response with filtered drivers
 */
export const getDriversByRegion = async (region) => {
  try {
    const response = await getAllDrivers({ region });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get drivers by area
 * @param {String} area - Area name
 * @returns {Promise<Object>} Response with filtered drivers
 */
export const getDriversByArea = async (area) => {
  try {
    const response = await getAllDrivers({ area });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Statistics & Export Operations ==========

/**
 * Get drivers statistics
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Response with driver statistics
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
 * Export drivers to Excel
 * @param {Object} filters - Optional filters
 * @returns {Promise<Blob>} Excel file blob
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
 * Export drivers to PDF
 * @param {Object} filters - Optional filters
 * @returns {Promise<Blob>} PDF file blob
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

// ========== Utilities ==========

/**
 * Prepare driver data for API submission
 * @param {Object} formData - Form data from UI
 * @returns {Object} Prepared payload for API
 */
export const prepareDriverPayload = (formData) => {
  return {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    licenseNumber: formData.licenseNumber.trim(),
    region: formData.city?.apiValue || formData.region,
    Area: formData.area?.apiValue || formData.Area, // Capital A as per API
  };
};

/**
 * Map driver data for display in UI
 * @param {Object} apiDriver - Driver data from API
 * @returns {Object} Mapped driver for UI display
 */
export const mapDriverForDisplay = (apiDriver) => {
  return {
    id: apiDriver._id || apiDriver.id,
    name: apiDriver.name || "",
    phone: apiDriver.phone || "",
    licenseNumber: apiDriver.licenseNumber || "",
    region: apiDriver.region || "",
    area: apiDriver.Area || apiDriver.area || "",
    shipmentsCount: apiDriver.shipmentsCount || 0,
    completedShipments: apiDriver.completedShipments || 0,
    pendingShipments: apiDriver.pendingShipments || 0,
    isActive: apiDriver.isActive ?? true,
    isApproved: apiDriver.isApproved ?? false,
    createdAt: apiDriver.createdAt,
    updatedAt: apiDriver.updatedAt,
  };
};

/**
 * Validate driver data before submission
 * @param {Object} driverData - Driver data to validate
 * @returns {Object} Validation result {isValid: boolean, errors: Object}
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

/**
 * Get city option from API value
 * @param {String} apiValue - API value
 * @returns {Object|null} City option
 */
export const getCityOptionFromApiValue = (apiValue) => {
  return cities.find((city) => city.apiValue === apiValue) || null;
};

/**
 * Get area option from API value
 * @param {String} cityValue - City value
 * @param {String} apiValue - API value
 * @returns {Object|null} Area option
 */
export const getAreaOptionFromApiValue = (cityValue, apiValue) => {
  if (!cityValue || !areas[cityValue]) return null;
  return areas[cityValue].find((area) => area.apiValue === apiValue) || null;
};

// ========== Constants ==========

/**
 * Cities data for forms
 */
export const cities = [
  { value: "riyadh", label: "الرياض", apiValue: "Riyadh" },
  { value: "jeddah", label: "جدة", apiValue: "Jeddah" },
  { value: "dammam", label: "الدمام", apiValue: "Dammam" },
];

/**
 * Areas data by city for forms
 */
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

// ========== Default Export (organized by feature) ==========
export default {
  // CRUD Operations
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,

  // Driver Shipments
  getDriverShipments,

  // Driver Approval
  getPendingDrivers,
  getApprovedDrivers,
  approveDriver,
  rejectDriver,

  // Batch Operations
  batchCreateDrivers,
  batchUpdateDrivers,
  batchDeleteDrivers,
  batchApproveDrivers,

  // Search & Filter
  searchDrivers,
  getDriversByRegion,
  getDriversByArea,

  // Statistics & Export
  getDriversStatistics,
  exportDriversToExcel,
  exportDriversToPDF,

  // Utilities
  prepareDriverPayload,
  mapDriverForDisplay,
  validateDriverData,
  getCityOptionFromApiValue,
  getAreaOptionFromApiValue,

  // Constants
  cities,
  areas,

  // Auth
  setAuthToken,

  // Data Transformation (for advanced usage)
  transformDriverData,
  transformDriversData,
};
