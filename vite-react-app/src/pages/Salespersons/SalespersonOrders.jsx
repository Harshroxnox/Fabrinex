import React, { useState } from "react";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
// import "./SalespersonOrders.css"; // import the CSS file

const SalespersonOrders = () => {
  const [salesPersonID, setSalesPersonID] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [orders, setOrders] = useState([]);
  const [commission, setCommission] = useState(null);

  const fetchOrders = async () => {
    if (!salesPersonID || !dateFrom || !dateTo) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `http://localhost:5000/api/v1/salespersons/salesperson-orders/${salesPersonID}`,
        {
          params: {
            date_from: dateFrom,
            date_to: dateTo,
          },
        }
      );

      setOrders(res.data.orders || []);
      setCommission(res.data.commission || null);
    } catch (error) {
      console.error("Error fetching salesperson orders:", error);
      alert("Failed to fetch data");
    }
  };

  return (
    <div className="salesperson-info-container">
      <h1>Salesperson Orders</h1>

      {/* Filters */}
      <div className="salesperson-info-filters">
        <div className="salesperson-info-filter-group">
          <label>Salesperson ID</label>
          <input
            type="number"
            value={salesPersonID}
            onChange={(e) => setSalesPersonID(e.target.value)}
          />
        </div>

        <div className="salesperson-info-filter-group">
          <label>Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="salesperson-info-filter-group">
          <label>Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <button onClick={fetchOrders} className="salesperson-info-button">
          Fetch Orders
        </button>
      </div>

      {/* Commission */}
      {commission && (
        <h6>Total Commission: ₹{parseFloat(commission).toFixed(2)}</h6>
      )}

      {/* Table */}
      {orders.length > 0 ? (
        <table className="salesperson-info-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              {/* <th>Payment Method</th> */}
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Amount</th>
              {/* <th>Profit</th> */}
              {/* <th>Tax</th> */}
              {/* <th>Discount</th> */}
              <th>Commission %</th>
              <th>Commission Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderID}>
                <td>{order.orderID}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                {/* <td>{order.payment_method}</td> */}
                <td>{order.payment_status}</td>
                <td>{order.order_status}</td>
                <td>₹{order.amount}</td>
                {/* <td>₹{order.profit}</td> */}
                {/* <td>₹{order.tax}</td> */}
                {/* <td>₹{order.promo_discount}</td> */}
                <td>{order.commission}%</td>
                <td>₹{parseFloat(order.commission_amt).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found</p>
      )}
    </div>
  );
};

export default SalespersonOrders;
