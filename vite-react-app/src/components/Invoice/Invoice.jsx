import React, { useCallback, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { getOrder } from "../../contexts/api/orders";
import "./Invoice.css";

const Invoice = (orderId ) => {
  // console.log("Rendering Invoice for Order ID:", orderId);
  const id = orderId.order;
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const downloadPDF = () => {
    const invoice = document.getElementById("invoice");
    const opt = {
      margin: 0,
      filename: `invoice_${orderData?.order?.orderID || id}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: [80, 297], orientation: "portrait" },
    };
    html2pdf().from(invoice).set(opt).save();
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrder(id);
      setOrderData(res);
    } catch (error) {
      console.error("Error fetching order data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p>Loading invoice...</p>;
  if (!orderData) return <p>No invoice found.</p>;

  const { order, items } = orderData;
  const gstRate = parseFloat(items[0].tax);
  const discountPercent = parseFloat(order.promo_discount);

  // --- Calculations ---
  const itemsWithTotals = items.map((item, i) => {
    const price = parseFloat(item.price_at_purchase);
    const qty = parseInt(item.quantity);
    const discountAmt = (price * discountPercent) / 100;
    const discountedPrice = price - discountAmt;
    const taxableAmt = discountedPrice * qty;
    const gstAmt = (taxableAmt * gstRate) / 100;
    const totalAmt = taxableAmt + gstAmt;
    return { ...item, discountedPrice, gstAmt, totalAmt };
  });

  const taxableTotal = itemsWithTotals.reduce(
    (sum, i) => sum + i.discountedPrice * i.quantity,
    0
  );
  const gstTotal = itemsWithTotals.reduce((sum, i) => sum + i.gstAmt, 0);
  const cgst = gstTotal / 2;
  const sgst = gstTotal / 2;
  const totalBeforeRound = taxableTotal + gstTotal;
  const roundedTotal = Math.round(totalBeforeRound);
  const roundOff = (roundedTotal - totalBeforeRound).toFixed(2);

  // --- Correct number to words (supports 0 .. 999999) ---
// numberToWords using Indian numbering (thousand, lakh, crore)
const numberToWords = (num) => {
  num = Math.floor(Number(num)); // use integer part
  if (isNaN(num)) return "";
  if (num === 0) return "Zero Only";
  if (num < 0) return "Minus " + numberToWords(Math.abs(num));

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits = (n) => {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? " " + ones[o] : "");
  };

  const threeDigits = (n) => {
    let str = "";
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred";
      const rem = n % 100;
      if (rem) str += " and ";
      n = rem;
    }
    if (n > 0) str += twoDigits(n);
    return str;
  };

  let words = "";

  const crore = Math.floor(num / 10000000);
  num = num % 10000000;

  const lakh = Math.floor(num / 100000);
  num = num % 100000;

  const thousand = Math.floor(num / 1000);
  const remainder = num % 1000;

  if (crore > 0) {
    words += (crore < 100 ? twoDigits(crore) : threeDigits(crore)) + " Crore";
  }
  if (lakh > 0) {
    if (words) words += " ";
    words += (lakh < 100 ? twoDigits(lakh) : threeDigits(lakh)) + " Lakh";
  }
  if (thousand > 0) {
    if (words) words += " ";
    words += (thousand < 100 ? twoDigits(thousand) : threeDigits(thousand)) + " Thousand";
  }
  if (remainder > 0) {
    if (words) words += " ";
    words += threeDigits(remainder);
  }

  return words.trim() + " Only";
};

  return (
    <div className="invoice-container">
      <div id="invoice" className="thermal-invoice">
        <h2 className="shop-name">Noor Creations</h2>
        <p className="shop-address">
          MOTI BAZAR PARADE JAMMU<br />
          Phone: 6006464546
        </p>
        <p><strong>GSTIN:</strong> 01HXZPS2503D1Z8</p>
        <h3 className="invoice-title">TAX INVOICE</h3>

        <div className="invoice-info">
          <p><strong>Invoice No/Date:</strong> {order.orderID} / {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Customer Name:</strong> {order.customer_name || "Cash"}</p>
          <p><strong>Cust Mobile No:</strong> — </p>
        </div>

        <table className="bill-table">
          <thead>
            <tr>
              <th>SI</th>
              <th>Product</th>
              <th>Price</th>
              <th>Disc(%)</th>
              <th>Amt</th>
            </tr>
          </thead>
          <tbody>
            {itemsWithTotals.map((item, i) => (
              <React.Fragment key={i}>
                <tr>
                  <td>{i + 1}</td>
                  <td>{item.product_name}</td>
                  <td>{parseFloat(item.price_at_purchase).toFixed(2)}</td>
                  <td>{discountPercent}%</td>
                  <td>{item.totalAmt.toFixed(2)}</td>
                </tr>
                <tr className="sub-row">
                  <td></td>
                  <td>Qty: {item.quantity} | HSN: 540752</td>
                  <td>GST%: {gstRate}%</td>
                  <td>GST Amt:</td>
                  <td>{item.gstAmt.toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="total-section">
          <p><strong>Total:</strong> ₹{totalBeforeRound.toFixed(2)}</p>
          <p><strong>Add: Rounded Off (+{roundOff})</strong></p>
          <p><strong>Net Total:</strong> ₹{roundedTotal.toFixed(2)}</p>
        </div>

        <p className="in-words">
          Rupees {numberToWords(roundedTotal)}
        </p>

        <table className="gst-summary">
          <thead>
            <tr>
              <th>Tax Rate</th>
              <th>Taxable Amt</th>
              <th>CGST Amt</th>
              <th>SGST Amt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{gstRate}%</td>
              <td>{taxableTotal.toFixed(2)}</td>
              <td>{cgst.toFixed(2)}</td>
              <td>{sgst.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="summary">
          <p><strong>Total GST:</strong> ₹{gstTotal.toFixed(2)}</p>
          <p><strong>Total Sale:</strong> ₹{(roundedTotal + 1000).toFixed(2)}</p>
          <p><strong>Total Savings:</strong> ₹1000.00</p>
          <p><strong>Net Payable:</strong> ₹{roundedTotal.toFixed(2)}</p>
        </div>

        <p className="footer">THANK YOU. VISIT US AGAIN.</p>
      </div>

      <button onClick={downloadPDF} className="invoice-download-btn">
        Download Invoice
      </button>
    </div>
  );
};

export default Invoice;
