import React, { createContext, use, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
//step1: create context
export const LoginContext= createContext();
//step2: create provider
export const LoginProvider=({children})=>{
    // const [users,setUser]=useState(null);
    const [isAuthenticated , setIsAuthenticated]=useState(false);
    const [loading , setLoading]=useState(false);
    const [error,setError]= useState('');
    // const email='';
    const [email,setEmail]=useState('');
    const [role,setRole]=useState('superadmin');
    // include credentials when using cookies
    axios.defaults.withCredentials=true;
    //register
    const register = async (formData)=>{
        try {
            setLoading(true);
            const res= await axios.post('http://localhost:5000/api/v1/admins/register',formData);
            // setUser(res.data)
            console.log(res.data.message);
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        }
    };
     const GetRole = async () => {
  try {
    // Just make the request — browser will send the HttpOnly cookie
    const res = await axios.get('http://localhost:5000/api/v1/admins/get-roles', {
      withCredentials: true, // 🔥 required to send cookies
    });

    setRole(res.data); // assuming setRole is defined in your component
    return res.data;
  } catch (error) {
    console.log("Error fetching the user role:", error.response?.data || error.message);
    throw error;
  }
};

    const login = async (formData)=>{
        try {
            setLoading(true);
            const res=await axios.post('http://localhost:5000/api/v1/admins/login',formData);
            console.log(res.data.message);
            console.log(formData);
            setEmail(formData.email);
            localStorage.setItem('email', formData.email);
            console.log(formData.email);
            GetRole();
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    }

    const logout=async ()=>{
        try {
            setLoading(true);
            const res= await axios.post('http://localhost:5000/api/v1/admins/logout');
            console.log(res.data.message);
            setEmail('');
        } catch (error) {
            setError(error.response?.data?.message || 'Logout failed');
        }
    }

    return(
        <LoginContext.Provider value={{isAuthenticated,loading,error,register,login,email,logout,role,GetRole}}>
            {children}
        </LoginContext.Provider>
    )
    
}