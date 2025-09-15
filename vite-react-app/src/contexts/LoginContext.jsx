import React, { createContext, useState } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../utils/axiosInstance";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isAuthenticated , setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async (formData) => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/admins/register", formData, { noAuth: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };


  const login = async (formData) => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/admins/login", formData, { noAuth: true });
      localStorage.setItem("admin", formData.email);
      await GetRole();
      setIsAuthenticated(true);
      return { message: "success" };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/admins/logout");
      localStorage.removeItem("admin");
      localStorage.removeItem("role");
      setIsAuthenticated(false);
      Cookies.remove("accessToken");
    } catch (err) {
      setError(err.response?.data?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const GetRole = async () => {
    try {
      const res = await axiosInstance.get("/admins/get-roles");
      const roles = res.data;
      localStorage.setItem("role", roles);
      return roles;
    } catch (err) {
      console.log("Error getting roles:", err.response?.data || err.message);
      throw err;
    }
  };

  const deleteAdmin = async (adminID) => {
    try {
      const res = await axiosInstance.delete(`/admins/delete/${adminID}`);
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
      const res = await axiosInstance.put(`/admins/update/${adminID}`, formData);
      return res.data;
    } catch (err) {
      console.error("Update admin error:", err.response?.data || err.message);
      return { success: false, message: err.message };
    }
  };

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
        isAuthenticated
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
