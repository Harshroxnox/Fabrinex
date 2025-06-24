import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Base API configuration
    const api = axios.create({
        baseURL: 'http://localhost:5000/api/v1/products',
    });

    // Product-related functions
    const createProduct = async (productData) => {
        try {
            setLoading(true);
            const response = await api.post('/create-product', productData);
            return response.data; // { message, productID }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (productID, updateData) => {
        try {
            setLoading(true);
            const response = await api.put(`/update-product/${productID}`, updateData);
            return response.data; // { message }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getProduct = async (productID) => {
        try {
            setLoading(true);
            const response = await api.get(`/get-product/${productID}`);
            return response.data; // { product details with variants }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAllProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/get-all-products');
            return response.data; // [ array of products ]
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (productID) => {
        try {
            setLoading(true);
            const response = await api.delete(`/delete-product/${productID}`);
            return response.data; // { message }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Variant-related functions
    const createVariant = async (productID, variantData) => {
        try {
            setLoading(true);
            const response = await api.post(`/create-variant/${productID}`, variantData,{
              headers:{
                'Content-Type':'multipart/form-data'
              }
            });
            return response.data; // { message, variantID }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateVariant = async (variantID, updateData) => {
        try {
            setLoading(true);
            const response = await api.put(`/update-variant/${variantID}`, updateData);
            return response.data; // { message }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getVariant = async (variantID) => {
        try {
            setLoading(true);
            const response = await api.get(`/get-variant/${variantID}`);
            return response.data; // { variant details }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    const [variantsListOfProduct,setVariantsListOfProduct]= useState(null);
    const getVariantsByProduct = async (productID) => {
        try {
            setLoading(true);
            // console.log("sdcsdc");
            const response = await api.get(`/get-variants/${productID}`);
            // console.log(response.data);
            setVariantsListOfProduct((e)=>{e= response.data});
            return response.data; // [ array of variants ]
            
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAllVariants = async () => {
        try {
            setLoading(true);
            const response = await api.get('/get-all-variants');
            return response.data; // [ array of all variants with product info ]
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteVariant = async (variantID) => {
        try {
            setLoading(true);
            const response = await api.delete(`/delete-variant/${variantID}`);
            return response.data; // { message }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProductContext.Provider value={{
            loading,
            error,
            clearError: () => setError(null),
            
            // Product functions
            createProduct,
            updateProduct,
            getProduct,
            getAllProducts,
            deleteProduct,
            
            // Variant functions
            createVariant,
            updateVariant,
            getVariant,
            getVariantsByProduct,
            getAllVariants,
            deleteVariant,
            variantsListOfProduct
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);

export {ProductContext};