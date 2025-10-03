import axios from "../../utils/axiosInstance";
export const addSalesPerson = (data)=> axios.post("/salespersons/add-salesperson/" ,data);
export const updateCommission = (salesPersonID, data ) => axios.put(`/salespersons/update-commission/${salesPersonID}` , data);
export const getAllSalesPersons = () => axios.get("/salespersons/get-all-salespersons");
export const deleteSalesPersons = (salesPersonID) => axios.delete(`salespersons/delete-salesperson/${salesPersonID}`);
export const getSalespersonOrders = (salesPersonID, dateFrom, dateTo) =>
  axios.get(`/salespersons/salesperson-orders/${salesPersonID}`, {
    params: {
      date_from: dateFrom,
      date_to: dateTo,
    },
  });