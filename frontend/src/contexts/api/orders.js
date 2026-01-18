import axios from "axios"
import axiosInstance from "../../utils/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllOrders = async (page,limit) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/orders/get-all-orders?page=${page}&limit=${limit}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const getOrder = async (orderID) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/orders/get-order/${orderID}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const createOrderOffline =(data) =>  axiosInstance.post("/orders/create-order-offline", data);
export const filterOrder = async (params) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/orders/filter`, {params});
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const updateOrderForExchange = async (orderID, items) => {
    try {
        const res = await axiosInstance.put(`/orders/update-order-offline/${orderID}`, { items });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const getReturnsByDateRange = async (dateFrom, dateTo, page, limit) => {
    try {
        const params = { dateFrom, dateTo, page, limit }; // Pass pagination params
        const res = await axiosInstance.get("/orders/returns-by-range", { params }); 
        return res.data; // Assumes backend returns { returns: [...], total: 1000 }
    } catch (error) {
        throw error;
    }
};
export const downloadOrdersExcel = async (params = {}) => {
  try {
    const res = await axiosInstance.get(
      "/orders/export-excel",
      {
        params,                // optional: dateFrom, dateTo, status, etc.
        responseType: "blob"   // IMPORTANT
      }
    );
    return res.data; // Blob
  } catch (error) {
    throw error;
  }
};

// contexts/api/orders.js
export const updateOrderMeta = async (orderID, payload) => {
  try {
    const res = await axiosInstance.put(
      `/orders/update-order-meta/${orderID}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOrderPayments = async (orderID, payload) => {
  try {
    const res = await axiosInstance.put(
      `/orders/update-order-payments/${orderID}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const settleRefund = async (orderID, payload) => {
  try {
    const res = await axiosInstance.post(
      `/orders/settle-refund/${orderID}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// contexts/api/orders.js
export const cancelOrder = async (orderID) => {
  try {
    const res = await axiosInstance.delete(
      `/orders/delete-order/${orderID}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
