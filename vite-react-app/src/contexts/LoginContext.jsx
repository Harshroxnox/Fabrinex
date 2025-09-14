import React, { createContext, useState } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../utils/axiosInstance"; // ✅ Your axiosInstance with interceptors

// Step 1: Create context
export const LoginContext = createContext();

// Step 2: Create provider
export const LoginProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Register (public)
  const register = async (formData) => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/admins/register", formData, { noAuth: true });
      console.log("Registration successful:", res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login (public)
  const login = async (formData) => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/admins/login", formData, { noAuth: true });

      localStorage.setItem("admin", formData.email);
      // 🔒 Fetch role (protected)
      await GetRole();

      console.log(
        `User with email ${localStorage.getItem("admin")} and role ${localStorage.getItem("role")} logged in.`
      );

      return { message: "success" };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout (public)
  const logout = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/admins/logout");

      console.log("Logout successful:", res.data.message);
      localStorage.removeItem("admin");
      localStorage.removeItem("role");
      Cookies.remove("accessToken");
    } catch (err) {
      setError(err.response?.data?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Get current role
  const GetRole = async () => {
    try {
      const res = await axiosInstance.get("/admins/get-roles");
      const roles = res.data;
      localStorage.setItem("role", roles);
    //   console.log(roles);
      return roles;
    } catch (err) {
      console.log("Error getting roles:", err.response?.data || err.message);
      throw err;
    }
  };

  // 🔒 Delete admin
  const deleteAdmin = async (adminID) => {
    try {
      const res = await axiosInstance.delete(`/admins/delete/${adminID}`);
      console.log("Admin deleted:", res.data.message);
    } catch (err) {
      console.error("Delete admin error:", err.response?.data || err.message);
    }
  };

  // 🔒 Get all admins
  const getAllAdmins = async () => {
    try {
      const res = await axiosInstance.get("/admins/get-all-admins");
      return res.data;
    } catch (err) {
      console.error("Error fetching admins:", err.response?.data || err.message);
    }
  };

  // 🔒 Update admin
  const updateAdmin = async (adminID, formData) => {
    try {
      const res = await axiosInstance.put(`/admins/update/${adminID}`, formData);
      return res.data;
    } catch (err) {
      console.error("Update admin error:", err.response?.data || err.message);
      return { success: false, message: err.message };
    }
  };

  // 🔒 Get all users (customers)
  const getAllUsers = async (page,limit) => {
    try {
      const res = await axiosInstance.get(`/users/get-all-users?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  return (
    <LoginContext.Provider
      value={{
        loading,
        error,
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
