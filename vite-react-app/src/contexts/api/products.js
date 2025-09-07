import axiosInstance from "../../utils/axiosInstance";

export const getProductAdmin = () => axiosInstance.get("/products/get-product-admin/:productID");

export const getVariantBarcodeAdmin = (barcode) => axiosInstance.get(`products/get-variant-barcode-admin/${barcode}`);