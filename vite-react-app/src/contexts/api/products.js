import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import VariantsList from "../../pages/Products/VariantsList";

//Helper function to handle responses
const handleRequest = async (fn) => {
  try {
    const response = await fn();
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getProductAdmin = (productID) =>
  handleRequest(() => axiosInstance.get(`/products/get-product-admin/${productID}`));

export const getVariantBarcodeAdmin = (barcode) =>
  handleRequest(() => axiosInstance.get(`products/get-variant-barcode-admin/${barcode}`));

// export const uploadSecondaryImages = (variantID, secondaryImages) =>
//   handleRequest(() =>
//     axios.post(
//       `http://localhost:5000/api/v1/products/upload-secondary-images/${variantID}`,
//       secondaryImages
//     )
//   );

export const getBestSellingPrices = () =>
  handleRequest(() => axiosInstance.get("/dashboard/best-selling-prices"));

//Base API instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1/products",
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

    return handleRequest( ()=> {
        api.post(`/upload-secondary-images/${variantID}`, formData,
            {
                headers: {"Content-Type":"multipart/form-data"}
            }
        )
    });
};