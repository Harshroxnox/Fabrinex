import React, { useCallback, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { getOrder } from "../../contexts/api/orders";
import "./Invoice.css";

const Invoice = ({ order: orderId }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrder(orderId);
      setOrderData(res);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p>Loading invoice...</p>;
  if (!orderData) return <p>No invoice found.</p>;

  const { order, items } = orderData;

  const gstRate = parseFloat(items[0].tax);
  const discountPercent = parseFloat(order.promo_discount);

  const totalSale = items.reduce(
    (sum, item) => sum + parseFloat(item.price_at_purchase) * item.quantity,
    0
  );

  const totalSavings = items.reduce((sum, item) => {
    const price = parseFloat(item.price_at_purchase);
    const qty = Number(item.quantity);
    const discount = (price * qty * discountPercent) / 100;
    return sum + discount;
  }, 0);

  const taxableTotal = totalSale - totalSavings;

  const gstTotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price_at_purchase);
    const qty = Number(item.quantity);
    const discountAmt = (price * discountPercent) / 100;
    const discountedPrice = price - discountAmt;
    const taxable = discountedPrice * qty;
    return sum + (taxable * gstRate) / 100;
  }, 0);

  const cgst = gstTotal / 2;
  const sgst = gstTotal / 2;

  const totalBeforeRound = taxableTotal + gstTotal;
  const roundedTotal = Math.round(totalBeforeRound);
  const roundOff = (roundedTotal - totalBeforeRound).toFixed(2);

  const numberToWords = (num) => {
    num = Math.floor(Number(num));
    if (isNaN(num)) return "";
    if (num === 0) return "Zero Only";

    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
      "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const two = (n) => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");

    const three = (n) => {
      let s = "";
      if (n > 99) {
        s += ones[Math.floor(n / 100)] + " Hundred";
        if (n % 100) s += " and ";
      }
      return s + two(n % 100);
    };

    let str = "";

    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;

    if (crore) str += three(crore) + " Crore ";
    if (lakh) str += three(lakh) + " Lakh ";
    if (thousand) str += three(thousand) + " Thousand ";
    if (remainder) str += three(remainder);

    return str.trim() + " Only";
  };

  const formatIN = (num) =>
    Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePrint = () => {
    window.print(); 
  }

  return (
    <div className="invoice-container">

      <div id="invoice" className="thermal-invoice">

        <h2 className="shop-name">Noor Creations</h2>
        <p className="shop-address">MOTI &nbsp;BAZAR &nbsp;PARADE &nbsp;JAMMU&nbsp; 180001</p>
        <p className="shop-contact">Phone : 6006464546&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
        <p className="shop-gst"><strong>&nbsp;&nbsp;&nbsp;&nbsp;GSTIN : 01NXZPS2503D1Z8</strong></p>

        <h3 className="invoice-title">TAX INVOICE</h3>

        <div className="invoice-row">
          <span className="invoice-label">Invoice No/Date :</span>
          <span className="invoice-no">{order.orderID}</span>
          <span className="invoice-date">/ {formatDate(order.created_at)}</span>
        </div>

        <div className="customer-row">
          <span className="invoice-label">Customer Name &nbsp;:&nbsp;&nbsp;&nbsp;</span>
          <span>{order.customer_name || "Cash"}</span>
        </div>

        <div className="customer-row">
          <span className="invoice-label">Cust Mobile No :</span>
          <span>&nbsp;&nbsp;&nbsp;</span>
        </div>

        <table className="bill-table">
          <thead>
            <tr className="main-header">
              <th>Sl</th>
              <th>Product</th>
              <th>Price</th>
              <th>Disc(%)</th>
              <th>Amt.</th>
            </tr>

            <tr className="sub-header">
              <th>Qty.</th>
              <th>&nbsp;&nbsp;HSN Code</th>
              <th>GST %</th>
              <th></th>
              <th>GST Amt</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => {
              const price = parseFloat(item.price_at_purchase);
              const qty = Number(item.quantity);
              const discountAmt = (price * discountPercent) / 100;
              const discountedPrice = price - discountAmt;
              const taxable = discountedPrice * qty;
              const gstAmt = (taxable * gstRate) / 100;
              const totalAmt = taxable + gstAmt;

              return (
                <React.Fragment key={i}>
                  <tr className="table-row-1">
                    <td>{i + 1}</td>
                    <td>{item.product_name}</td>
                    <td>{price.toFixed(2)}</td>
                    <td>{discountPercent.toFixed(2)}</td>
                    <td>{totalAmt.toFixed(2)}</td>
                  </tr>

                  <tr className="sub-row">
                    <td></td>
                    <td>{qty}.00 &nbsp;&nbsp;</td>
                    <td>{gstRate}%</td>
                    <td></td>
                    <td>{gstAmt.toFixed(2)}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        <div className="post-table-summary">

          <div className="summary-line"></div>

          <div className="total-row">
            <span></span>
            <span style={{ borderTop: "1px solid #000", paddingTop: "3px" }}>
              Total&nbsp;:&nbsp;<strong>{formatIN(totalBeforeRound)}</strong>
            </span>
          </div>

          <div className="roundoff-row">
            <span style={{ fontStyle: 'italic' }}>Add :  Rounded Off (+</span>
            <span>{formatIN(roundOff)}</span>
          </div>

          <div className="summary-line"></div>

          <div className="final-row">
            <span>{formatIN(Math.abs(roundOff))}</span>
            <span>{formatIN(roundedTotal)}</span>
          </div>

        </div>

        <p className="in-words">Rupees {numberToWords(roundedTotal)}</p>

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
              <td>{formatIN(taxableTotal)}</td>
              <td>{formatIN(cgst)}</td>
              <td>{formatIN(sgst)}</td>
            </tr>
          </tbody>
        </table>

        <div className="summary">
          <p>
            <strong>
              Total GST&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp; ₹{formatIN(gstTotal)}
            </strong>
          </p>

          <p>
            <strong>
              Total Sale&nbsp;&nbsp;&nbsp;&nbsp; :&nbsp;&nbsp;&nbsp; ₹{formatIN(totalSale)}
            </strong>
          </p>

          <p>
            <strong>
              Total Savings&nbsp;:&nbsp; ₹{formatIN(totalSavings)}
            </strong>
          </p>

          <p>
            <strong>  
              Net Payable&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;₹{formatIN(roundedTotal)}
            </strong>
          </p>
        </div>

        <p className="footer">THANK YOU. VISIT US AGAIN.</p>

      </div>

      <button
        onClick={() => {
          html2pdf()
            .from(document.getElementById("invoice"))
            .set({
              margin: 0,
              filename: `invoice_${order.orderID}.pdf`,
              image: { type: "jpeg", quality: 1 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: "mm", format: [80, 297], orientation: "portrait" },
            })
            .save();
        }}
        className="invoice-download-btn"
      >
        Download Invoice
      </button>
      <button onClick={handlePrint} className="invoice-download-btn">
        Print Invoice
      </button>

    </div>
  );
};

export default Invoice;
