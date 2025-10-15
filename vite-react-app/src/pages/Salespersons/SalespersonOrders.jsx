import React, { useState, useCallback, useEffect } from "react";
import { getSalespersonOrders,getAllSalesPersons } from "../../contexts/api/salespersons";
import './Salespersons.css';
import toast from "react-hot-toast";
const SalespersonOrders = (refresh) => {
  const [salesPersonID, setSalesPersonID] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [orders, setOrders] = useState([]);
  const [commission, setCommission] = useState(null);
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch salespersons
  const fetchSalespersons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllSalesPersons();
      setSalespersons(res.data.salesPersons || []);
    } catch (error) {
      toast.error("Error fetching salespersons:", error);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    fetchSalespersons();
  }, [fetchSalespersons]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!salesPersonID || !dateFrom || !dateTo) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await getSalespersonOrders(salesPersonID, dateFrom, dateTo);
      setOrders(res.data.orders || []);
      setCommission(res.data.commission || null);
    } catch (error) {
      // console.error("Error fetching salesperson orders:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [salesPersonID, dateFrom, dateTo]);

  return (
    <div className="salesperson-info-container">
      <h1>Salesperson Orders</h1>

      {/* Filters */}
      <div className="salesperson-info-filters">
        <div className="salesperson-info-filter-group">
          <label>Salesperson</label>
          <select value={salesPersonID} onChange={(e) => setSalesPersonID(e.target.value)}>
            <option value="">Select Salesperson</option>
            {salespersons.map((sp) => (
              <option key={sp.salesPersonID} value={sp.salesPersonID}>
                {sp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="salesperson-info-filter-group">
          <label>Date From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>

        <div className="salesperson-info-filter-group">
          <label>Date To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <button onClick={fetchOrders} disabled={loading} className="salesperson-info-button">
          {loading ? "Loading..." : "Fetch Orders"}
        </button>
      </div>

      {/* Commission */}
      {commission && <h6>Total Commission: ₹{parseFloat(commission).toFixed(2)}</h6>}

      {/* Orders Table */}
      {orders.length > 0 ? (
        <table className="salesperson-info-table no-scrollbar">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Amount</th>
              <th>Commission %</th>
              <th>Commission Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderID}>
                <td>{order.orderID}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{order.payment_status}</td>
                <td>{order.order_status}</td>
                <td>₹{order.amount}</td>
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
