import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";

const handleRequest = async (fn) => {
  try {
    const response = await fn();
    return { data: response.data.result, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getMetrics = () => handleRequest(() => axiosInstance.get("/dashboard/get-metrics"));
