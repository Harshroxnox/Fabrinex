import axios from "axios";
import Cookies from "js-cookie";

//Authenticated Axios Instance(require token)
export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true
});

// Helper to get access token 
const getAccessToken= ()=> Cookies.get('accessToken');
//attach access token to every request(if not marked noAuth)
axiosInstance.interceptors.request.use(
  (config)=>{
    const token = getAccessToken();
    if(token && !config.noAuth){
      config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
  },
  (error)=> Promise.reject(error)
);

//Refresh Token handler
const refreshAccessToken = async()=>{
  try {
    const res= await axios.post('http://localhost:5000/api/v1/admins/refresh',{},
      {withCredentials:true}
    );
    const newToken =res.data?.accessToken;
    if(newToken){
      Cookies.set('accessToken',newToken);//storing updated token
    }
    return newToken;
  } catch (err) {
    console.error("Refresh token failed:",err.response?.data || err.message);
    throw err;
  }
}

// ✅ Automatically retry request after token refresh on 403
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.noAuth
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest); // Retry original request
        }
      } catch (refreshError) {
        console.error("Auto-refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
