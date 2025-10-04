import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";

const handleRequest = async (fn) => {
  try {
    const response = await fn();
    return { data: response.data.result, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data.error || error.message,
    };
  }
};

export const getMetrics = ({ year, month }) => {
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  if (month) params.append('month', month);

  const queryString = params.toString();
  const url = `/dashboard/get-metrics${queryString ? `?${queryString}` : ''}`;

  return handleRequest(() => axiosInstance.get(url));
};

export const getTodaysMetrics = () => handleRequest(() => axiosInstance.get("/dashboard/todays-metrics"));