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