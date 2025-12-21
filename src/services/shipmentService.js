// src/services/shipmentService.js
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
 * Transform shipment data from API format to app format
 * @param {Object} shipment - Shipment object from API
 * @returns {Object|null} Transformed shipment object
 */
const transformShipmentData = (shipment) => {
  if (!shipment) return null;

  return {
    id: shipment._id || shipment.id,
    trackingNumber: shipment.trackingNumber,

    // Sender information
    sender: {
      name: shipment.sender?.name || "",
      phone: shipment.sender?.phone || "",
      address: shipment.sender?.address || {},
    },

    // Recipient information
    recipient: {
      name: shipment.recipient?.name || "",
      phone: shipment.recipient?.phone || "",
      address: shipment.recipient?.address || {},
    },

    // Shipment details
    status: shipment.status || "Pending",
    shipmentType: shipment.shipmentType || "Normal",
    weight: shipment.weight || 0,
    cost: shipment.cost || 0,

    // Additional information
    assignedDriver: shipment.assignedDriver || null,
    notes: shipment.notes || "",
    paymentMethod: shipment.paymentMethod || "",
    paymentStatus: shipment.paymentStatus || "Pending",
    packageSize: shipment.packageSize || "",
    nature: shipment.nature || "",

    // Timestamps
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
    deliveredAt: shipment.deliveredAt || null,

    // History
    history: shipment.history || [],
  };
};

/**
 * Transform array of shipments from API format to app format
 * @param {Array} shipments - Array of shipment objects
 * @returns {Array} Transformed shipments array
 */
const transformShipmentsData = (shipments) => {
  if (!Array.isArray(shipments)) return [];
  return shipments.map(transformShipmentData);
};

// ========== CRUD Operations ==========

/**
 * Get all shipments with optional filters
 * @param {Object} params - Query parameters (filters, pagination, etc.)
 * @returns {Promise<Object>} Response with shipments list
 */
export const getAllShipments = async (params = {}) => {
  try {
    const response = await axios.get("/api/shipments", { params });

    // Transform response data if exists
    if (response.data?.success && response.data?.data) {
      if (Array.isArray(response.data.data)) {
        response.data.data = transformShipmentsData(response.data.data);
      } else if (response.data.data.shipments) {
        response.data.data.shipments = transformShipmentsData(
          response.data.data.shipments
        );
      }
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get shipment by tracking number
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Object>} Response with shipment data
 */
export const getShipmentByTrackingNumber = async (trackingNumber) => {
  try {
    const response = await axios.get(`/api/shipments/${trackingNumber}`);

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformShipmentData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new shipment
 * @param {Object} shipmentData - Shipment data
 * @returns {Promise<Object>} Response with created shipment
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
 * Update existing shipment
 * @param {String} trackingNumber - Tracking number
 * @param {Object} shipmentData - Updated shipment data
 * @returns {Promise<Object>} Response with updated shipment
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
 * Delete shipment
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteShipment = async (trackingNumber) => {
  try {
    const response = await axios.delete(`/api/shipments/${trackingNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Batch Operations ==========

/**
 * Create multiple shipments at once
 * @param {Array} shipmentsData - Array of shipment objects
 * @returns {Promise<Object>} Response with created shipments
 */
export const batchCreateShipments = async (shipmentsData) => {
  try {
    const response = await axios.post("/api/shipments/batch", {
      shipments: shipmentsData,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update multiple shipments at once
 * @param {Array} updates - Array of update objects with trackingNumber and data
 * @returns {Promise<Object>} Response with updated shipments
 */
export const batchUpdateShipments = async (updates) => {
  try {
    const response = await axios.patch("/api/shipments/batch", { updates });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete multiple shipments at once
 * @param {Array} trackingNumbers - Array of tracking numbers
 * @returns {Promise<Object>} Response confirming deletion
 */
export const batchDeleteShipments = async (trackingNumbers) => {
  try {
    const response = await axios.post("/api/shipments/batch-delete", {
      trackingNumbers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Assignment & Status Operations ==========

/**
 * Assign driver to shipment
 * @param {String} trackingNumber - Tracking number
 * @param {String} driverId - Driver ID
 * @returns {Promise<Object>} Response with updated shipment
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
 * Update shipment status
 * @param {String} trackingNumber - Tracking number
 * @param {String} status - New status (Pending, In Transit, Delivered, Cancelled)
 * @returns {Promise<Object>} Response with updated shipment
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
 * Cancel shipment
 * @param {String} trackingNumber - Tracking number
 * @param {String} reason - Cancellation reason
 * @returns {Promise<Object>} Response with updated shipment
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
 * Add notes to shipment
 * @param {String} trackingNumber - Tracking number
 * @param {String} notes - Notes to add
 * @returns {Promise<Object>} Response with updated shipment
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

// ========== Search & Filter Operations ==========

/**
 * Search shipments by criteria
 * @param {Object} filters - Search criteria (status, shipmentType, sender, recipient, etc.)
 * @returns {Promise<Object>} Response with filtered shipments
 */
export const searchShipments = async (filters = {}) => {
  try {
    const response = await axios.get("/api/shipments/search", {
      params: filters,
    });

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformShipmentsData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get shipments by status
 * @param {String} status - Status filter (Pending, In Transit, Delivered, Cancelled)
 * @returns {Promise<Object>} Response with filtered shipments
 */
export const getShipmentsByStatus = async (status) => {
  try {
    const response = await getAllShipments({ status });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get shipments by type
 * @param {String} shipmentType - Shipment type (Normal, Document, Express)
 * @returns {Promise<Object>} Response with filtered shipments
 */
export const getShipmentsByType = async (shipmentType) => {
  try {
    const response = await getAllShipments({ shipmentType });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get shipments by driver
 * @param {String} driverId - Driver ID
 * @returns {Promise<Object>} Response with driver's shipments
 */
export const getShipmentsByDriver = async (driverId) => {
  try {
    const response = await axios.get(`/api/shipments/driver/${driverId}`);

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformShipmentsData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get shipments by user (sender or recipient)
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Response with user's shipments
 */
export const getShipmentsByUser = async (userId) => {
  try {
    const response = await axios.get(`/api/shipments/user/${userId}`);

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformShipmentsData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get shipments by date range
 * @param {String} startDate - Start date (ISO format)
 * @param {String} endDate - End date (ISO format)
 * @returns {Promise<Object>} Response with filtered shipments
 */
export const getShipmentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await getAllShipments({ startDate, endDate });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Status-Specific Getters ==========

/**
 * Get pending shipments
 * @returns {Promise<Object>} Response with pending shipments
 */
export const getPendingShipments = async () => {
  return getShipmentsByStatus("Pending");
};

/**
 * Get in-transit shipments
 * @returns {Promise<Object>} Response with in-transit shipments
 */
export const getInTransitShipments = async () => {
  return getShipmentsByStatus("In Transit");
};

/**
 * Get delivered shipments
 * @returns {Promise<Object>} Response with delivered shipments
 */
export const getDeliveredShipments = async () => {
  return getShipmentsByStatus("Delivered");
};

/**
 * Get cancelled shipments
 * @returns {Promise<Object>} Response with cancelled shipments
 */
export const getCancelledShipments = async () => {
  return getShipmentsByStatus("Cancelled");
};

// ========== Statistics & Export Operations ==========

/**
 * Get shipments statistics
 * @param {Object} filters - Optional filters (dateFrom, dateTo, etc.)
 * @returns {Promise<Object>} Response with shipment statistics
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
 * Export shipments to Excel
 * @param {Object} filters - Optional filters
 * @returns {Promise<Blob>} Excel file blob
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
 * Export shipments to PDF
 * @param {Object} filters - Optional filters
 * @returns {Promise<Blob>} PDF file blob
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

// ========== Tracking & History Operations ==========

/**
 * Track shipment by tracking number (for customers - no authentication)
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Object>} Response with tracking data
 */
export const trackShipment = async (trackingNumber) => {
  try {
    const response = await axios.get(`/api/track/${trackingNumber}`);

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformShipmentData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get shipment history/changelog
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Array>} Response with history records
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

// ========== Document Operations ==========

/**
 * Print shipment label
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Blob>} PDF file blob
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

// ========== Utilities ==========

/**
 * Calculate shipping cost
 * @param {Object} shipmentData - Shipment data (sender, recipient, weight, shipmentType)
 * @returns {Promise<Object>} Response with calculated cost
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
 * Map shipment data from API to display format
 * @param {Object} apiShipment - Shipment data from API
 * @returns {Object} Mapped shipment for display
 */
export const mapShipmentForDisplay = (apiShipment) => {
  return {
    id: apiShipment._id || apiShipment.id,
    trackingNumber: apiShipment.trackingNumber,
    senderName: apiShipment.sender?.name || "",
    senderPhone: apiShipment.sender?.phone || "",
    recipientName: apiShipment.recipient?.name || "",
    recipientPhone: apiShipment.recipient?.phone || "",
    status: apiShipment.status || "Pending",
    shipmentType: apiShipment.shipmentType || "Normal",
    weight: apiShipment.weight || 0,
    cost: apiShipment.cost || 0,
    driverName: apiShipment.assignedDriver?.name || "Not Assigned",
    notes: apiShipment.notes || "",
    createdAt: apiShipment.createdAt,
    updatedAt: apiShipment.updatedAt,
  };
};

/**
 * Prepare shipment data for API submission
 * @param {Object} formData - Form data from UI
 * @param {String} senderAddressType - Sender address type (detailed/short)
 * @param {String} recipientAddressType - Recipient address type (detailed/short)
 * @returns {Object} Prepared payload for API
 */
export const prepareShipmentPayload = (
  formData,
  senderAddressType,
  recipientAddressType
) => {
  const payload = {
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
  };

  // Add weight only for Normal shipments
  if (formData.shipmentType === "Normal" && formData.weight) {
    payload.weight = Number(formData.weight);
  }

  // Add optional notes
  if (formData.notes) {
    payload.notes = formData.notes.trim();
  }

  // Add payment information if exists
  if (formData.paymentMethod) {
    payload.paymentMethod = formData.paymentMethod;
  }

  if (formData.paymentStatus) {
    payload.paymentStatus = formData.paymentStatus;
  }

  return payload;
};

/**
 * Validate shipment data before submission
 * @param {Object} shipmentData - Shipment data to validate
 * @returns {Object} Validation result {isValid: boolean, errors: array}
 */
export const validateShipmentData = (shipmentData) => {
  const errors = [];

  // Validate sender
  if (!shipmentData.sender?.name?.trim()) {
    errors.push("Sender name is required");
  }
  if (!shipmentData.sender?.phone?.trim()) {
    errors.push("Sender phone is required");
  }

  // Validate recipient
  if (!shipmentData.recipient?.name?.trim()) {
    errors.push("Recipient name is required");
  }
  if (!shipmentData.recipient?.phone?.trim()) {
    errors.push("Recipient phone is required");
  }

  // Validate shipment type
  if (!["Normal", "Document", "Express"].includes(shipmentData.shipmentType)) {
    errors.push("Invalid shipment type");
  }

  // Validate weight for Normal shipments
  if (shipmentData.shipmentType === "Normal" && !shipmentData.weight) {
    errors.push("Weight is required for Normal shipments");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== Default Export (organized by feature) ==========
export default {
  // CRUD Operations
  getAllShipments,
  getShipmentByTrackingNumber,
  createShipment,
  updateShipment,
  deleteShipment,

  // Batch Operations
  batchCreateShipments,
  batchUpdateShipments,
  batchDeleteShipments,

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

  // Status-Specific
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

  // Documents
  printShipmentLabel,

  // Utilities
  calculateShippingCost,
  mapShipmentForDisplay,
  prepareShipmentPayload,
  validateShipmentData,

  // Auth
  setAuthToken,

  // Data Transformation (for advanced usage)
  transformShipmentData,
  transformShipmentsData,
};
