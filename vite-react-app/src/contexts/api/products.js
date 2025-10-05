import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import VariantsList from "../../pages/Products/VariantsList";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//Helper function to handle responses
const handleRequest = async (fn) => {
  try {
    const response = await fn();
    return { data: response.data, error: null };
  } catch (error) {
    console.log(error);
    return {
      data: null,
      error: error.response?.data.error || error.message,
    };
  }
};

export const getProductAdmin = (productID) =>
  handleRequest(() => axiosInstance.get(`/products/get-product-admin/${productID}`));

export const getVariantBarcodeAdmin = (barcode) =>
  handleRequest(() => axiosInstance.get(`products/get-variant-barcode-admin/${barcode}`));


export const getBestSellingPrices = () =>
  handleRequest(() => axiosInstance.get("/dashboard/best-selling-prices"));

export const getVariantSalesByBarcode = (barcode) =>
  handleRequest( () => axiosInstance.get(`/products/get-variant-price-quantity/${barcode}`));

//Base API instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/products`,
});

//Product APIs
export const createProduct = (productData) =>
  handleRequest(() => api.post("/create-product", productData));

export const updateProduct = (productID, updateData) =>
  handleRequest(() => api.put(`/update-product/${productID}`, updateData));

export const getProduct = (productID) =>
  handleRequest(() => api.get(`/get-product/${productID}`));

export const getAllProducts = () =>
  handleRequest(() => api.get("/get-all-products"));

export const getProductByIDByAdmin = (productID) =>
  handleRequest(() => axiosInstance.get(`/products/get-product-admin/${productID}`));

export const deleteProduct = (productID) =>
  handleRequest(() => api.delete(`/delete-product/${productID}`));

//Variant APIs
export const createVariant = (productID, variantData) =>
  handleRequest(() =>
    api.post(`/create-variant/${productID}`, variantData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const updateVariant = (variantID, updateData) =>
  handleRequest(() => api.put(`/update-variant/${variantID}`, updateData));

export const getVariant = (variantID) =>
  handleRequest(() => api.get(`/get-variant/${variantID}`));

export const getVariantAdmin = (variantID) =>
  handleRequest(() => axiosInstance.get(`/products/get-variant-admin/${variantID}`));

export const getVariantsByProduct = (productID) =>
  handleRequest(() => api.get(`/get-variants/${productID}`));

export const getAllVariants = () =>
  handleRequest(() => api.get("/get-all-variants"));

export const deleteVariant = (variantID) =>
  handleRequest(() => api.delete(`/delete-variant/${variantID}`));

export const uploadSecondaryImages = (variantID , secondaryImages) => {
    const formData = new FormData();
    secondaryImages.forEach( (file) => {
        formData.append("images", file);
    });

    return handleRequest(() =>
    api.post(`/upload-secondary-images/${variantID}`, formData, {
      headers: { "Content-Type": "multipart-form-data" },
    })
  );
};

export const deleteSecondaryImage = (variantImageID) => {
  return handleRequest( ()=>
    api.delete(`/delete-secondary-image/${variantImageID}`)
  );
};


export const downloadProductLabels = () => {
  return handleRequest(() =>
    axiosInstance.get("/products/get-labels", {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    })
  );
};

export const downloadLabelsByDate = (dates) =>{
  console.log(dates);
  return handleRequest(()=>
    axiosInstance.get(`/products/get-labels-by-date?date_from=${dates.dateFrom}&date_to=${dates.dateTo}`,{
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    })
  );
};