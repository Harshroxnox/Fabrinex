import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";

export const getProductAdmin = () => axiosInstance.get("/products/get-product-admin/:productID");

export const getVariantBarcodeAdmin = (barcode) => axiosInstance.get(`products/get-variant-barcode-admin/${barcode}`);

export const uploadSecondaryImages = async (variantID, secondaryImages) => {
    try {
        const res = await axios.post(`http://localhost:5000/api/v1/products/upload-secondary-images/${variantID}`,
            secondaryImages);
        return res.data;
    } catch (error) {
        console.log("error uploading secondary images" , error);
        throw error ;
    }
}

export const getBestSellingPrices = () => axiosInstance.get("/dashboard/best-selling-prices");