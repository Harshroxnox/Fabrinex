import axios from "axios"

export const getAllOrders = async () => {
    try {
        const res = await axios.get("http://localhost:5000/api/v1/orders/get-all-orders");
        return res.data;
    } catch (error) {
        console.log("error fetching order data");

    }
}

export const getOrder = async (orderID) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/v1/orders/get-order/${orderID}`);
        return res.data;
    } catch (error) {
        console.log("error fetching data");
    }
}