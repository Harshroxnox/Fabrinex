import axios from "axios";
import React, { createContext, useState } from "react";
//step1: create a context
export const ProductContext = createContext();
// step 2: create provider
export const ProductProvider=({children})=>{
    const [loading,setLoading]= useState(false);
    const [productData,setProductData]= useState([]);
    const productList= async ()=>{
        try {
            setLoading(true);
            const res= await axios.get('http://localhost:5000/api/v1/products/get-all-products');
            setProductData(res.data);
            console.log(res.data);
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    return (<ProductContext.Provider value={{loading,productData,productList}}>{children}</ProductContext.Provider>)
}