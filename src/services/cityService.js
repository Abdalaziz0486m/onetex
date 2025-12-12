// src/services/cityService.js
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
 * جلب جميع المدن
 * @param {Object} params - معاملات الاستعلام (filters, pagination, etc.)
 * @returns {Promise<Object>} - قائمة المدن
 */
export const getAllCities = async (params = {}) => {
  try {
    const response = await axios.get("/api/cities", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب مدينة معينة بواسطة ID
 * @param {String} cityId - معرف المدينة
 * @returns {Promise<Object>} - بيانات المدينة
 */
export const getCityById = async (cityId) => {
  try {
    const response = await axios.get(`/api/cities/${cityId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * إنشاء مدينة جديدة
 * @param {Object} cityData - بيانات المدينة
 * @returns {Promise<Object>} - المدينة المنشأة
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
 * تحديث مدينة معينة
 * @param {String} cityId - معرف المدينة
 * @param {Object} cityData - البيانات المحدثة
 * @returns {Promise<Object>} - المدينة المحدثة
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
 * حذف مدينة معينة
 * @param {String} cityId - معرف المدينة
 * @returns {Promise<Object>} - رسالة التأكيد
 */
export const deleteCity = async (cityId) => {
  try {
    const response = await axios.delete(`/api/cities/${cityId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * حساب تكلفة الشحن بين مدينتين
 * @param {String} fromCity - المدينة المرسلة
 * @param {String} toCity - المدينة المستلمة
 * @returns {Promise<Object>} - تفاصيل التكلفة
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
 * إضافة أو تحديث مسار شحن لمدينة معينة
 * @param {String} cityId - معرف المدينة
 * @param {Object} routeData - بيانات المسار (destinationCity, distanceKm, small, medium, large)
 * @returns {Promise<Object>} - المدينة المحدثة
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
 * حذف مسار شحن من مدينة معينة
 * @param {String} cityId - معرف المدينة
 * @param {String} destinationCity - اسم المدينة المستهدفة
 * @returns {Promise<Object>} - المدينة المحدثة
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

/**
 * جلب المدن النشطة فقط
 * @returns {Promise<Object>} - قائمة المدن النشطة
 */
export const getActiveCities = async () => {
  try {
    const response = await axios.get("/api/cities", {
      params: { isActive: true },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب المدن حسب المنطقة
 * @param {String} region - اسم المنطقة
 * @returns {Promise<Object>} - قائمة المدن
 */
export const getCitiesByRegion = async (region) => {
  try {
    const response = await axios.get("/api/cities", {
      params: { region },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * جلب المدن حسب النوع
 * @param {String} type - نوع المدينة (capital, holy_city, major_city, city)
 * @returns {Promise<Object>} - قائمة المدن
 */
export const getCitiesByType = async (type) => {
  try {
    const response = await axios.get("/api/cities", {
      params: { type },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * معالجة بيانات المدينة من API إلى format مناسب للعرض
 * @param {Object} apiCity - بيانات المدينة من API
 * @returns {Object} - بيانات المدينة المعالجة
 */
export const mapCityData = (apiCity) => {
  return {
    id: apiCity._id,
    name: apiCity.name,
    nameEn: apiCity.nameEn,
    region: apiCity.region,
    type: apiCity.type,
    coordinates: apiCity.coordinates,
    localDelivery: apiCity.localDelivery,
    shippingTo: apiCity.shippingTo || {},
    isActive: apiCity.isActive,
    createdAt: apiCity.createdAt,
    updatedAt: apiCity.updatedAt,
  };
};

/**
 * تجهيز بيانات المدينة للإرسال إلى API
 * @param {Object} formData - بيانات النموذج
 * @returns {Object} - البيانات المجهزة للإرسال
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

  // إضافة shippingTo إذا كانت موجودة
  if (formData.shippingTo && Object.keys(formData.shippingTo).length > 0) {
    payload.shippingTo = formData.shippingTo;
  }

  // إضافة isActive إذا كانت موجودة
  if (formData.hasOwnProperty("isActive")) {
    payload.isActive = formData.isActive;
  }

  return payload;
};

/**
 * التحقق من صحة بيانات المدينة
 * @param {Object} cityData - بيانات المدينة
 * @returns {Object} - {isValid: boolean, errors: Object}
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
 * التحقق من صحة بيانات مسار الشحن
 * @param {Object} routeData - بيانات المسار
 * @returns {Object} - {isValid: boolean, errors: Object}
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
 * حساب التكلفة بناءً على حجم الطرد
 * @param {Object} rates - أسعار الشحن (small, medium, large)
 * @param {String} packageSize - حجم الطرد
 * @returns {Number} - التكلفة
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
 * تنسيق عرض نوع المدينة
 * @param {String} type - نوع المدينة
 * @returns {String} - النوع بالعربي
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

/**
 * فلترة المدن حسب الاسم (بحث)
 * @param {Array} cities - قائمة المدن
 * @param {String} searchTerm - كلمة البحث
 * @returns {Array} - المدن المفلترة
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
 * ترتيب المدن حسب الأسبقية (العواصم أولاً، ثم المدن المقدسة، إلخ)
 * @param {Array} cities - قائمة المدن
 * @returns {Array} - المدن المرتبة
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

// ثوابت أنواع المدن
export const CITY_TYPES = [
  { value: "capital", label: "عاصمة", labelEn: "Capital" },
  { value: "holy_city", label: "مدينة مقدسة", labelEn: "Holy City" },
  { value: "major_city", label: "مدينة رئيسية", labelEn: "Major City" },
  { value: "city", label: "مدينة", labelEn: "City" },
];

// ثوابت أحجام الطرود
export const PACKAGE_SIZES = [
  { value: "small", label: "صغير", labelEn: "Small" },
  { value: "medium", label: "متوسط", labelEn: "Medium" },
  { value: "large", label: "كبير", labelEn: "Large" },
];

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

  // Filter & Search
  getActiveCities,
  getCitiesByRegion,
  getCitiesByType,
  filterCitiesByName,
  sortCitiesByPriority,

  // Utilities
  mapCityData,
  prepareCityPayload,
  validateCityData,
  validateShippingRouteData,
  calculateCostBySize,
  formatCityType,

  // Constants
  CITY_TYPES,
  PACKAGE_SIZES,

  // Auth
  setAuthToken,
};
