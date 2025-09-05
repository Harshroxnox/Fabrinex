import React, { useCallback, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import styles from "./Invoice.module.css"; // Changed to CSS Module
import { getOrder } from "../../contexts/api/orders";

const Invoice = ({ orderID }) => {
  const downloadPDF = () => {
    const invoice = document.getElementById("invoice");
    html2pdf().from(invoice).save(`invoice_${order.id}.pdf`);
  };
  const [orderData,setOrderData] = useState([]);
  const [loading , setLoading] = useState(true);
  const fetchData = useCallback( async () => {
    try {
      setLoading(true);
      const res = await getOrder(orderID);
      console.log(res);
      setOrderData(res);
    } catch (error) {
      console.error("error fetching order data", error);
    }
    finally{
      setLoading(false);
    }
  } , []);

    // Fetch orders data on mount
    useEffect(() => {
      fetchData();
    }, [fetchData]);

  // const subtotal = orderData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  // const delieveryCharge = +(order.delieveryCharge || 0).toFixed(2);
  // const tax = +(subtotal * 0.13).toFixed(2);
  // const total = +(subtotal + tax).toFixed(2);

  return (
    <div className={styles.invoiceContainer}>
      <div id="invoice" className={styles.invoiceBox}>
        <div className={styles.invoiceHeader}>
          <div className={styles.billTo}>
            <h4>Bill To:</h4>
            <p>{orderData.customer_name}</p>
            <p>noot</p>
            {/* <p>{order.country}</p> */}
            <p>{orderData.email}</p>
          </div>
          <div className={styles.invoiceDetails}>
            <p><strong>Invoice #</strong> {orderData.orderID}</p>
            <p><strong>Invoice Date:</strong> {orderData.created_at}</p>
            {/* <p className={styles.amountDue}><strong>Amount Due:</strong> ₹{total}</p> */}
          </div>
        </div>
        <div className={styles.billTo} style={{marginBottom:'10px'}}>
          <p style={{fontSize:'15px' , fontWeight:'500'}}> Billed By:</p>
          <p style={{fontSize:'15px' , fontWeight:'350'}}> {orderData.billedBy}</p>
        </div>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.qty}</td>
                <td>₹{item.price}</td>
                <td>₹{(item.qty * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.notes}>
          <p><strong>Notes / Memo:</strong></p>
          <p>{orderData.notes || "Free Shipping with 30-day money-back guarantee."}</p>
        </div>

        <div className={styles.summary}>
          <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
          <p><strong>Tax (13%):</strong> ₹{tax.toFixed(2)}</p>
          <p><strong>Delievery Charge:</strong> ₹{delieveryCharge.toFixed(2)}</p>
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
