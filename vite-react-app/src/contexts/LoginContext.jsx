import React, { createContext,useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
//step1: create context
export const LoginContext= createContext();
//step2: create provider
export const LoginProvider=({children})=>{
    const [loading , setLoading]=useState(false);
    const [error,setError]= useState('');
    axios.defaults.withCredentials=true;
    const register = async (formData)=>{
        try {
            setLoading(true);
            const res= await axios.post('http://localhost:5000/api/v1/admins/register',formData);
            console.log(res.data.message);
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        }
    };
    const GetRole = async () => {
        try {
            const accessToken= Cookies.get('accessToken');
            // console.log("acccess token:",accessToken);
            const res = await axios.get('http://localhost:5000/api/v1/admins/get-roles', {
                headers:{
                    "Authorization":`Bearer ${accessToken}`
                }
            });
            const roles= res.data;
            // setRole(roles[0]);
            localStorage.setItem("role",roles);
            // console.log(res.data);
            return res.data;
        } 
        catch (error) {
            console.log("Error fetching the user role:", error.response?.data || error.message);
            throw error;
        }
    };

    const login = async (formData)=>{
        try {
            setLoading(true);
            const res=await axios.post('http://localhost:5000/api/v1/admins/login',formData);
            console.log(res.data.message);

            localStorage.setItem("admin",formData.email);
            // console.log(admin,role);
            GetRole();
            console.log(`User with email ${localStorage.getItem("admin")} and role ${localStorage.getItem("role")} logged in successfully`)
            return {message:"success"};
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    }

    const logout=async ()=>{
        try {
            setLoading(true);
            const res= await axios.post('http://localhost:5000/api/v1/admins/logout');
            console.log(res.data.message);
            // setEmail('');
            // setAdmin('');
            localStorage.removeItem("admin");
        } catch (error) {
            setError(error.response?.data?.message || 'Logout failed');
        }
    }

    const deleteAdmin = async (adminID)=>{
        try {
            const accessToken= Cookies.get('accessToken');
            const res = await axios.delete(`http://localhost:5000/api/v1/admins/delete/${adminID}`,{
                headers:{
                    "Authorization":`Bearer ${accessToken}`
                }
            });
            console.log(res.data.message);
        } catch (error) {
            console.error("deleting admin error: ",error);
        }
    }
    const getAllAdmins= async ()=>{
        try {
            const accessToken= Cookies.get('accessToken');
            const res= await axios.get("http://localhost:5000/api/v1/admins/get-all-admins",{
                headers:{
                "Authorization":`Bearer ${accessToken}`
            }});
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.log("error fetching all admins",error);
        }
    }
    const updateAdmin = async (adminID, formData) => {
    try {
        const accessToken = Cookies.get('accessToken');
        console.log("password:",formData.password);
        const res = await axios.put(`http://localhost:5000/api/v1/admins/update/${adminID}`,formData, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
        });
        return res.data;
    } catch (error) {
        console.error("Error updating admin:", error); // ✅ For debugging
        return { success: false, message: error.message }; // ✅ Return clean object
    }
    };

    const getAllUsers = async ()=>{
        try {
            const res= await axios.get("http://localhost:5000/api/v1/users/get-all-users");
            console.log(res.data.users);
            return res.data.users;
        } catch (error) {
            console.log("error while fetching all customers",error);   
        }
    }
    return(
        <LoginContext.Provider value={{loading,error,register,login,logout,GetRole,deleteAdmin,getAllAdmins,updateAdmin,getAllUsers}}>
            {children}
        </LoginContext.Provider>
    )
    
}