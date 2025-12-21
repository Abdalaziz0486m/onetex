// src/services/cityService.js
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
 * Transform city data from API format to app format
 * @param {Object} city - City object from API
 * @returns {Object|null} Transformed city object
 */
const transformCityData = (city) => {
  if (!city) return null;

  return {
    id: city._id || city.id,
    name: city.name || "",
    nameEn: city.nameEn || "",
    region: city.region || "",
    type: city.type || "city",
    coordinates: {
      latitude: city.coordinates?.latitude || 0,
      longitude: city.coordinates?.longitude || 0,
    },
    localDelivery: {
      small: city.localDelivery?.small || 0,
      medium: city.localDelivery?.medium || 0,
      large: city.localDelivery?.large || 0,
    },
    shippingTo: city.shippingTo || {},
    isActive: city.isActive ?? true,
    createdAt: city.createdAt,
    updatedAt: city.updatedAt,
  };
};

/**
 * Transform array of cities from API format to app format
 * @param {Array} cities - Array of city objects
 * @returns {Array} Transformed cities array
 */
const transformCitiesData = (cities) => {
  if (!Array.isArray(cities)) return [];
  return cities.map(transformCityData);
};

// ========== CRUD Operations ==========

/**
 * Get all cities with optional filters
 * @param {Object} params - Query parameters (filters, pagination, etc.)
 * @returns {Promise<Object>} Response with cities list
 */
export const getAllCities = async (params = {}) => {
  try {
    const response = await axios.get("/api/cities", { params });

    // Transform response data if exists
    if (response.data?.success && response.data?.data) {
      if (Array.isArray(response.data.data)) {
        response.data.data = transformCitiesData(response.data.data);
      } else if (response.data.data.cities) {
        response.data.data.cities = transformCitiesData(
          response.data.data.cities
        );
      }
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get city by ID
 * @param {String} cityId - City ID
 * @returns {Promise<Object>} Response with city data
 */
export const getCityById = async (cityId) => {
  try {
    const response = await axios.get(`/api/cities/${cityId}`);

    // Transform response data
    if (response.data?.success && response.data?.data) {
      response.data.data = transformCityData(response.data.data);
    }

    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new city
 * @param {Object} cityData - City data
 * @returns {Promise<Object>} Response with created city
 */
export const createCity = async (cityData) => {
  try {
    const response = await axios.post("/api/cities", cityData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update existing city
 * @param {String} cityId - City ID
 * @param {Object} cityData - Updated city data
 * @returns {Promise<Object>} Response with updated city
 */
export const updateCity = async (cityId, cityData) => {
  try {
    const response = await axios.put(`/api/cities/${cityId}`, cityData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete city
 * @param {String} cityId - City ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteCity = async (cityId) => {
  try {
    const response = await axios.delete(`/api/cities/${cityId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Shipping Operations ==========

/**
 * Get shipping rate between two cities
 * @param {String} fromCity - Sender city
 * @param {String} toCity - Recipient city
 * @returns {Promise<Object>} Response with shipping rate details
 */
export const getShippingRate = async (fromCity, toCity) => {
  try {
    const response = await axios.get("/api/cities/shipping-rate", {
      params: { fromCity, toCity },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Add or update shipping route for a city
 * @param {String} cityId - City ID
 * @param {Object} routeData - Route data (destinationCity, distanceKm, small, medium, large)
 * @returns {Promise<Object>} Response with updated city
 */
export const addOrUpdateShippingRoute = async (cityId, routeData) => {
  try {
    const response = await axios.post(
      `/api/cities/${cityId}/shipping-routes`,
      routeData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete shipping route from a city
 * @param {String} cityId - City ID
 * @param {String} destinationCity - Destination city name
 * @returns {Promise<Object>} Response with updated city
 */
export const deleteShippingRoute = async (cityId, destinationCity) => {
  try {
    const response = await axios.delete(
      `/api/cities/${cityId}/shipping-routes`,
      {
        data: { destinationCity },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Batch Operations ==========

/**
 * Create multiple cities at once
 * @param {Array} citiesData - Array of city objects
 * @returns {Promise<Object>} Response with created cities
 */
export const batchCreateCities = async (citiesData) => {
  try {
    const response = await axios.post("/api/cities/batch", {
      cities: citiesData,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update multiple cities at once
 * @param {Array} updates - Array of update objects with id and data
 * @returns {Promise<Object>} Response with updated cities
 */
export const batchUpdateCities = async (updates) => {
  try {
    const response = await axios.patch("/api/cities/batch", { updates });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete multiple cities at once
 * @param {Array} cityIds - Array of city IDs
 * @returns {Promise<Object>} Response confirming deletion
 */
export const batchDeleteCities = async (cityIds) => {
  try {
    const response = await axios.post("/api/cities/batch-delete", {
      cityIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== Search & Filter Operations ==========

/**
 * Get active cities only
 * @returns {Promise<Object>} Response with active cities
 */
export const getActiveCities = async () => {
  try {
    const response = await getAllCities({ isActive: true });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get cities by region
 * @param {String} region - Region name
 * @returns {Promise<Object>} Response with filtered cities
 */
export const getCitiesByRegion = async (region) => {
  try {
    const response = await getAllCities({ region });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get cities by type
 * @param {String} type - City type (capital, holy_city, major_city, city)
 * @returns {Promise<Object>} Response with filtered cities
 */
export const getCitiesByType = async (type) => {
  try {
    const response = await getAllCities({ type });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Search cities by keyword
 * @param {String} keyword - Search keyword
 * @returns {Promise<Object>} Response with filtered cities
 */
export const searchCities = async (keyword) => {
  try {
    const response = await getAllCities({ search: keyword });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Filter cities by name (client-side filtering)
 * @param {Array} cities - Cities list
 * @param {String} searchTerm - Search term
 * @returns {Array} Filtered cities
 */
export const filterCitiesByName = (cities, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === "") return cities;
  const term = searchTerm.toLowerCase().trim();
  return cities.filter(
    (city) =>
      city.name.toLowerCase().includes(term) ||
      city.nameEn.toLowerCase().includes(term) ||
      city.region.toLowerCase().includes(term)
  );
};

/**
 * Sort cities by priority (capitals first, then holy cities, etc.)
 * @param {Array} cities - Cities list
 * @returns {Array} Sorted cities
 */
export const sortCitiesByPriority = (cities) => {
  const priorityOrder = {
    capital: 1,
    holy_city: 2,
    major_city: 3,
    city: 4,
  };

  return [...cities].sort((a, b) => {
    const priorityA = priorityOrder[a.type] || 999;
    const priorityB = priorityOrder[b.type] || 999;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return a.name.localeCompare(b.name, "ar");
  });
};

// ========== Utilities ==========

/**
 * Prepare city data for API submission
 * @param {Object} formData - Form data from UI
 * @returns {Object} Prepared payload for API
 */
export const prepareCityPayload = (formData) => {
  const payload = {
    name: formData.name.trim(),
    nameEn: formData.nameEn.trim(),
    region: formData.region.trim(),
    type: formData.type,
    coordinates: {
      latitude: Number(formData.coordinates.latitude),
      longitude: Number(formData.coordinates.longitude),
    },
    localDelivery: {
      small: Number(formData.localDelivery.small),
      medium: Number(formData.localDelivery.medium),
      large: Number(formData.localDelivery.large),
    },
  };

  // Add shippingTo if exists
  if (formData.shippingTo && Object.keys(formData.shippingTo).length > 0) {
    payload.shippingTo = formData.shippingTo;
  }

  // Add isActive if exists
  if (formData.hasOwnProperty("isActive")) {
    payload.isActive = formData.isActive;
  }

  return payload;
};

/**
 * Map city data for display in UI
 * @param {Object} apiCity - City data from API
 * @returns {Object} Mapped city for UI display
 */
export const mapCityForDisplay = (apiCity) => {
  return {
    id: apiCity._id || apiCity.id,
    name: apiCity.name || "",
    nameEn: apiCity.nameEn || "",
    region: apiCity.region || "",
    type: apiCity.type || "city",
    typeLabel: formatCityType(apiCity.type),
    latitude: apiCity.coordinates?.latitude || 0,
    longitude: apiCity.coordinates?.longitude || 0,
    localDeliverySmall: apiCity.localDelivery?.small || 0,
    localDeliveryMedium: apiCity.localDelivery?.medium || 0,
    localDeliveryLarge: apiCity.localDelivery?.large || 0,
    shippingRoutesCount: Object.keys(apiCity.shippingTo || {}).length,
    isActive: apiCity.isActive ?? true,
    createdAt: apiCity.createdAt,
    updatedAt: apiCity.updatedAt,
  };
};

/**
 * Validate city data before submission
 * @param {Object} cityData - City data to validate
 * @returns {Object} Validation result {isValid: boolean, errors: Object}
 */
export const validateCityData = (cityData) => {
  const errors = {};

  if (!cityData.name || cityData.name.trim().length < 2) {
    errors.name = "يجب إدخال اسم المدينة بالعربي (حرفين على الأقل)";
  }

  if (!cityData.nameEn || cityData.nameEn.trim().length < 2) {
    errors.nameEn = "يجب إدخال اسم المدينة بالإنجليزي (حرفين على الأقل)";
  }

  if (!cityData.region || cityData.region.trim().length < 2) {
    errors.region = "يجب إدخال اسم المنطقة";
  }

  if (!cityData.type) {
    errors.type = "يجب اختيار نوع المدينة";
  }

  if (!cityData.coordinates) {
    errors.coordinates = "يجب إدخال الإحداثيات";
  } else {
    if (
      !cityData.coordinates.latitude ||
      isNaN(cityData.coordinates.latitude)
    ) {
      errors.latitude = "يجب إدخال خط العرض صحيح";
    }
    if (
      !cityData.coordinates.longitude ||
      isNaN(cityData.coordinates.longitude)
    ) {
      errors.longitude = "يجب إدخال خط الطول صحيح";
    }
  }

  if (!cityData.localDelivery) {
    errors.localDelivery = "يجب إدخال أسعار التوصيل المحلي";
  } else {
    if (!cityData.localDelivery.small || cityData.localDelivery.small <= 0) {
      errors.localDeliverySmall = "يجب إدخال سعر الطرد الصغير";
    }
    if (!cityData.localDelivery.medium || cityData.localDelivery.medium <= 0) {
      errors.localDeliveryMedium = "يجب إدخال سعر الطرد المتوسط";
    }
    if (!cityData.localDelivery.large || cityData.localDelivery.large <= 0) {
      errors.localDeliveryLarge = "يجب إدخال سعر الطرد الكبير";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate shipping route data before submission
 * @param {Object} routeData - Route data to validate
 * @returns {Object} Validation result {isValid: boolean, errors: Object}
 */
export const validateShippingRouteData = (routeData) => {
  const errors = {};

  if (
    !routeData.destinationCity ||
    routeData.destinationCity.trim().length < 2
  ) {
    errors.destinationCity = "يجب إدخال اسم المدينة المستهدفة";
  }

  if (!routeData.distanceKm || routeData.distanceKm <= 0) {
    errors.distanceKm = "يجب إدخال المسافة بالكيلومتر";
  }

  if (!routeData.small || routeData.small <= 0) {
    errors.small = "يجب إدخال سعر الطرد الصغير";
  }

  if (!routeData.medium || routeData.medium <= 0) {
    errors.medium = "يجب إدخال سعر الطرد المتوسط";
  }

  if (!routeData.large || routeData.large <= 0) {
    errors.large = "يجب إدخال سعر الطرد الكبير";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Calculate cost by package size
 * @param {Object} rates - Shipping rates (small, medium, large)
 * @param {String} packageSize - Package size
 * @returns {Number} Cost
 */
export const calculateCostBySize = (rates, packageSize) => {
  const sizeMap = {
    small: rates.small,
    medium: rates.medium,
    large: rates.large,
  };
  return sizeMap[packageSize] || 0;
};

/**
 * Format city type for display
 * @param {String} type - City type
 * @returns {String} Formatted type in Arabic
 */
export const formatCityType = (type) => {
  const typeMap = {
    capital: "عاصمة",
    holy_city: "مدينة مقدسة",
    major_city: "مدينة رئيسية",
    city: "مدينة",
  };
  return typeMap[type] || type;
};

// ========== Constants ==========

/**
 * City types
 */
export const CITY_TYPES = [
  { value: "capital", label: "عاصمة", labelEn: "Capital" },
  { value: "holy_city", label: "مدينة مقدسة", labelEn: "Holy City" },
  { value: "major_city", label: "مدينة رئيسية", labelEn: "Major City" },
  { value: "city", label: "مدينة", labelEn: "City" },
];

/**
 * Package sizes
 */
export const PACKAGE_SIZES = [
  { value: "small", label: "صغير", labelEn: "Small" },
  { value: "medium", label: "متوسط", labelEn: "Medium" },
  { value: "large", label: "كبير", labelEn: "Large" },
];

// ========== Default Export (organized by feature) ==========
export default {
  // CRUD Operations
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,

  // Shipping Operations
  getShippingRate,
  addOrUpdateShippingRoute,
  deleteShippingRoute,

  // Batch Operations
  batchCreateCities,
  batchUpdateCities,
  batchDeleteCities,

  // Search & Filter
  getActiveCities,
  getCitiesByRegion,
  getCitiesByType,
  searchCities,
  filterCitiesByName,
  sortCitiesByPriority,

  // Utilities
  prepareCityPayload,
  mapCityForDisplay,
  validateCityData,
  validateShippingRouteData,
  calculateCostBySize,
  formatCityType,

  // Constants
  CITY_TYPES,
  PACKAGE_SIZES,

  // Auth
  setAuthToken,

  // Data Transformation (for advanced usage)
  transformCityData,
  transformCitiesData,
};
