// utils/axiosInstance.js
import axios from "axios";
import Cookies from "js-cookie";

// Use env variable for base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies for refresh token
});

// Helper to get access token from cookies
const getAccessToken = () => Cookies.get("accessToken");

// ================= REQUEST INTERCEPTOR =================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.noAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= REFRESH TOKEN =================
const refreshAccessToken = async () => {
  try {
    const res = await axios.post(
      `${BASE_URL}/admins/refresh`,
      {},
      { withCredentials: true }
    );
    const newToken = res.data?.accessToken;
    if (newToken) {
      Cookies.set("accessToken", newToken); // store new token
    }
    return newToken;
  } catch (err) {
    console.error("Refresh token failed:", err.response?.data || err.message);
    throw err;
  }
};

// ================= RESPONSE INTERCEPTOR =================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry once on 401/403
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.noAuth
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest); // retry original request
        }
      } catch (refreshError) {
        console.error("Auto-refresh failed, logging out:", refreshError);
        // Force logout if refresh fails
        Cookies.remove("accessToken");
        localStorage.removeItem("admin");
        localStorage.removeItem("role");
        window.location.href = "/"; // redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
