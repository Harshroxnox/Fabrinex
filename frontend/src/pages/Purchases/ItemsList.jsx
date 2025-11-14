import React from 'react';
import './ItemsList.css'; 

const ItemsList = ({ items }) => {

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="items-list-container">
      <table className="items-table">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Item Code</th>
            <th>HSN Code</th>
            <th>Rate</th>
            <th>Tax %</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.itemID || index}>
              {/* --- Updated Data Fields --- */}
              <td>{item.barcode}</td>
              <td>{item.itemCode}</td>
              <td>{item.hsnCode || 'N/A'}</td>
              <td>₹{parseFloat(item.rate || 0).toFixed(2)}</td>
              <td>{item.taxPercent || 0}%</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>₹{parseFloat(item.value || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsList;