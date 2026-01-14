import axiosInstance from "../../utils/axiosInstance";

const handleRequest = async (fn) => {
  try {
    const response = await fn();
    // console.log(response);
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data.error || error.message,
    };
  }
};


export const fetchAlterations = () => 
    handleRequest( () => axiosInstance.get("/alterations/get-alteration"));

export const createAlterations = (formData) =>
    handleRequest( () => axiosInstance.post("/alterations/create-alteration" , formData, {
        headers: {"Content-Type" :"multipart/form-data"},
    }));
    
export const updateAlterations = (id, formData) =>
  handleRequest(() =>
    axiosInstance.put(
      `/alterations/update-alteration/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
  );

export const fetchAlterationNotifications = () => 
  handleRequest ( () => axiosInstance.get("/alterations/get-alteration-notifications") );
