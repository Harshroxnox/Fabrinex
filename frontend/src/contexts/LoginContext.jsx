import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../utils/axiosInstance";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // ✅ ensures we know when auth check is complete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= HELPER: Check Auth on Load =================
  const checkAuth = () => {
    const token = Cookies.get("accessToken");
    const admin = localStorage.getItem("admin");
    if (token && admin) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setAuthChecked(true);
  };

  // ================= LOGIN =================
  const login = async (formData) => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/admins/login", formData, {
        noAuth: true,
      });

      // store email (or userId) to persist session
      localStorage.setItem("admin", formData.email);

      // fetch roles for RBAC
      await GetRole();

      checkAuth();
      return { message: "success" };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return { message: "failed" };
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      setLoading(true);
      setError("");
      await axiosInstance.post("/admins/logout");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    } finally {
      // clear local + cookies always
      localStorage.removeItem("admin");
      localStorage.removeItem("role");
      Cookies.remove("accessToken");

      setIsAuthenticated(false);
      setAuthChecked(true);
      setLoading(false);
    }
  };

  // ================= GET ROLE =================
  const GetRole = async () => {
    try {
      const res = await axiosInstance.get("/admins/get-roles");
      const roles = res.data.roleNames;
      localStorage.setItem("role", roles);
      return roles;
    } catch (err) {
      console.error("Error getting roles:", err.response?.data || err.message);
      throw err;
    }
  };

  // ================= ADMIN CRUD =================
  const register = async (formData) => {
    try {
      setLoading(true);
      setError("");
      await axiosInstance.post("/admins/register", formData, { noAuth: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (adminID) => {
    try {
      await axiosInstance.delete(`/admins/delete/${adminID}`);
    } catch (err) {
      console.error("Delete admin error:", err.response?.data || err.message);
    }
  };

  const getAllAdmins = async () => {
    try {
      const res = await axiosInstance.get("/admins/get-all-admins");
      return res.data;
    } catch (err) {
      console.error("Error fetching admins:", err.response?.data || err.message);
    }
  };

  const updateAdmin = async (adminID, formData) => {
    try {
      const res = await axiosInstance.put(
        `/admins/update/${adminID}`,
        formData
      );
      return res.data;
    } catch (err) {
      console.error("Update admin error:", err.response?.data || err.message);
      return { success: false, message: err.message };
    }
  };

  const getAllUsers = async (page, limit) => {
    try {
      const res = await axiosInstance.get(
        `/users/get-all-users?page=${page}&limit=${limit}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  // ================= AUTO TOKEN REFRESH =================
  useEffect(() => {
    checkAuth(); // run once on app load

    const interval = setInterval(async () => {
      const token = Cookies.get("accessToken");
      if (token) {
        try {
          await axiosInstance.post("/admins/refresh", {}, { withCredentials: true });
          checkAuth();
        } catch (err) {
          console.error("Auto refresh failed:", err);
          logout();
        }
      }
    }, 9 * 60 * 1000); // refresh every 9 min (if expiry = 10 min)

    return () => clearInterval(interval);
  }, []);

  return (
    <LoginContext.Provider
      value={{
        loading,
        error,
        isAuthenticated,
        authChecked, // ✅ export this so ProtectedRoute can wait
        register,
        login,
        logout,
        GetRole,
        deleteAdmin,
        getAllAdmins,
        updateAdmin,
        getAllUsers,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
