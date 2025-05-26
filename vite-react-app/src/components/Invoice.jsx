// Invoice.jsx
import React from "react";
import html2pdf from "html2pdf.js";
import "./invoice.css";

const Invoice = ({ order }) => {
  const downloadPDF = () => {
    const invoice = document.getElementById("invoice");
    html2pdf().from(invoice).save(`invoice_${order.id}.pdf`);
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const delieveryCharge = +(order.delieveryCharge || 0).toFixed(2);
  const tax = +(subtotal * 0.13).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  return (
    <div className="invoice-container">
      <div id="invoice" className="invoice-box">
        <div className="invoice-header">
          <div className="bill-to">
            <h4>Bill To:</h4>
            <p>{order.customer}</p>
            <p>{order.location}</p>
            <p>{order.country}</p>
            <p>{order.email}</p>
          </div>
          <div className="invoice-details">
            <p><strong>Invoice #</strong> {order.id}</p>
            <p><strong>Invoice Date:</strong> {order.date}</p>
            <p className="amount-due"><strong>Amount Due:</strong> ₹{total}</p>
          </div>
        </div>

        <table className="items-table">
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
            {order.items.map((item, index) => (
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

        <div className="notes">
          <p><strong>Notes / Memo:</strong></p>
          <p>{order.notes || "Free Shipping with 30-day money-back guarantee."}</p>
        </div>

        <div className="summary">
          <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
          <p><strong>Tax (13%):</strong> ₹{tax.toFixed(2)}</p>
          <p><strong>Delievery Charge:</strong>₹{delieveryCharge.toFixed(2)}</p>
          <p className="total"><strong>Total:</strong> ₹{total.toFixed(2)}</p>
        </div>
      </div>

      <button onClick={downloadPDF} className="download-btn">
        Download Invoice
      </button>
    </div>
  );
};

export default Invoice;
