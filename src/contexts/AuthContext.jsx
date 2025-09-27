import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // تحقق من وجود token في localStorage عند تحميل التطبيق
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // إعداد axios interceptor للتعامل مع الـ token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // إذا كان الـ token منتهي الصلاحية، قم بتسجيل الخروج
          signOut();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const checkAuthStatus = async () => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);

        // تحقق من صحة الـ token عبر API call
        const response = await axios.get(`${baseUrl}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (response.data.valid) {
          setToken(savedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // إذا كان الـ token غير صالح، امسح البيانات
          clearAuthData();
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/login`,
        credentials
      );
      const { token: newToken, user: newUser } = response.data;

      // حفظ البيانات في localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      // تحديث الحالة
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "فشل في تسجيل الدخول",
      };
    }
  };

  const signUp = async (userData) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/register`,
        userData
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "فشل في إنشاء الحساب",
      };
    }
  };

  const verifyOTP = async (phone, otp) => {
    try {
      const response = await axios.post(`${baseUrl}/api/auth/verify-otp`, {
        phone,
        otp,
      });

      const { token: newToken, user: newUser } = response.data;

      // حفظ البيانات في localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      // تحديث الحالة
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("OTP verification error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "كود التحقق غير صحيح",
      };
    }
  };

  const signOut = () => {
    clearAuthData();
    navigate("/login");
  };

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    verifyOTP,
    signOut,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
