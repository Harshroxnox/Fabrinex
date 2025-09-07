import axios, { axiosInstance } from "../../utils/axiosInstance";
export const createLoyaltyCards = (data)=> axios.post("/loyaltycards/create" ,data);
export const getAllLoyaltyCards = () => axios.get("/loyaltycards/get-all-loyaltycards");
export const deleteLoyaltyCards = (barcode) => axios.delete(`loyaltycards/delete/${barcode}`);
export const getDiscountByBarcode = (barcode) => axios.get(`/loyaltycards/get-discount/${barcode}`);