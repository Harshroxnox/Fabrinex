import axios from "../../utils/axiosInstance";
export const createLoyaltyCards = (data)=> axios.post("/loyaltycards/create" ,data);
export const getAllLoyaltyCards = () => axios.get("/loyaltycards/get-all-loyaltycards");
export const deleteLoyaltyCards = (barcode) => axios.delete(`loyaltycards/delete/${barcode}`);