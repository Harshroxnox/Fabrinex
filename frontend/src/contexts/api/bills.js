import axiosInstance from "../../utils/axiosInstance";

const handleRequest = async (fn) => {
    try {
        const response = await fn();
        return {data : response.data , error: null};
    } catch (error) {
        return {
            data : null,
            error : error.response?.data.error   || "An unexpected error occurred.",
        }
    }
}

export const getAllBills = () => 
    handleRequest( () => axiosInstance.get("/bills/get-all-bills"))

export const deleteBill = (billID) =>
  handleRequest(() => axiosInstance.delete(`/bills/delete-bill/${billID}`));

export const uploadBill = (formData) =>
  handleRequest(() =>
    axiosInstance.post("/bills/upload-bill", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );