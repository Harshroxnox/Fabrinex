import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleRequest = async (fn) => {
  try {
    const response = await fn();
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data.error  || error.message,
    };
  }
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/purchases`,
});

export const createPurchase = (purchaseData) =>
  handleRequest(() => api.post('/create-purchase', purchaseData));

export const getAllPurchases = ({ page, limit }) =>
  handleRequest(() => api.get(`/get-all-purchases/?page=${page}&limit=${limit}`));

export const getPurchaseById = (purchaseID) =>
  handleRequest(() => api.get(`/get-purchase-by-id/${purchaseID}`));

export const searchPurchasesBySeller = ({ searchTerm, page = 1, limit = 10 }) =>
  handleRequest(() => api.get(`/search-by-seller?supplier=${searchTerm}&page=${page}&limit=${limit}`));

export const searchPurchasesByDateRange = ({ startDate, endDate, page = 1, limit = 10 }) =>
  handleRequest(() => api.get(`/search/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`));