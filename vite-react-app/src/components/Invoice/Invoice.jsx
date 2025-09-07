import React, { useCallback, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import styles from "./Invoice.module.css";
import { getOrder } from "../../contexts/api/orders";

const Invoice = ({ order }) => {
  const id = order; // parent must pass <Invoice order={id} />
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const downloadPDF = () => {
    const invoice = document.getElementById("invoice");
    html2pdf()
      .from(invoice)
      .save(`invoice_${orderData?.order?.orderID || id}.pdf`);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrder(id); // ✅ res is already the response body
      console.log(res);
      setOrderData(res);
    } catch (error) {
      console.error("error fetching order data", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p>Loading invoice...</p>;
  if (!orderData) return <p>No invoice found.</p>;

  // Prepare totals
  const subtotal = orderData.items?.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.price_at_purchase),
    0
  ) || 0;

  const taxRate = orderData.items?.[0]?.tax
    ? parseFloat(orderData.items[0].tax) / 100
    : 0;

  const tax = subtotal * taxRate;
  const deliveryCharge = 0; // your API didn’t send this
  const total = parseFloat(orderData.order.amount);

  return (
    <div className={styles.invoiceContainer}>
      <div id="invoice" className={styles.invoiceBox}>
        {/* Header */}
        <div className={styles.invoiceHeader}>
          <div className={styles.billTo}>
            <h4>Bill To:</h4>
            <p>{orderData.order.customer_name}</p>
            <p>{orderData.order.address_line}</p>
            <p>{orderData.order.city}, {orderData.order.state} - {orderData.order.pincode}</p>
            <p>{orderData.order.order_location}</p>
          </div>
          <div className={styles.invoiceDetails}>
            <p><strong>Invoice #</strong> {orderData.order.orderID}</p>
            <p><strong>Invoice Date:</strong> {new Date(orderData.order.created_at).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> {orderData.order.payment_method}</p>
            <p><strong>Payment Status:</strong> {orderData.order.payment_status}</p>
            <p><strong>Order Status:</strong> {orderData.order.order_status}</p>
            <p className={styles.amountDue}><strong>Amount Due:</strong> ₹{total.toFixed(2)}</p>
          </div>
        </div>

        {/* Seller Info */}
        <div className={styles.billTo} style={{ marginBottom: "10px" }}>
          <p style={{ fontSize: "15px", fontWeight: "500" }}>Billed By:</p>
          <p style={{ fontSize: "15px", fontWeight: "350" }}>Rahul</p>
        </div>

        {/* Items Table */}
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Color</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items?.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.color}</td>
                <td>{item.size}</td>
                <td>{item.quantity}</td>
                <td>₹{parseFloat(item.price_at_purchase).toFixed(2)}</td>
                <td>₹{(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className={styles.summary}>
          <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
          <p><strong>Tax ({orderData.items?.[0]?.tax || 0}%):</strong> ₹{tax.toFixed(2)}</p>
          <p><strong>Delivery Charge:</strong> ₹{deliveryCharge.toFixed(2)}</p>
          <p className={styles.total}><strong>Total:</strong> ₹{total.toFixed(2)}</p>
        </div>
      </div>

      <button onClick={downloadPDF} className={styles.downloadBtn}>
        Download Invoice
      </button>
    </div>
  );
};

export default Invoice;
