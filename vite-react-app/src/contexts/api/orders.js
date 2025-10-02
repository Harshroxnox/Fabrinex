import axios from "axios"
import axiosInstance from "../../utils/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllOrders = async (page,limit) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/orders/get-all-orders?page=${page}&limit=${limit}`);
        return res.data;
    } catch (error) {
        console.log("error fetching order data");

    }
}

export const getOrder = async (orderID) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/orders/get-order/${orderID}`);
        return res.data;
    } catch (error) {
        console.log("error fetching data");
    }
}

export const createOrderOffline =(data) =>  axiosInstance.post("/orders/create-order-offline", data);
