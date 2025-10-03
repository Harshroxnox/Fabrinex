import React from 'react';
import './ItemsList.css';

const ItemsList = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="variants-container">
      <table className="variants-table">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>HSN Code</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.itemID || index}>
              <td>{item.barcode}</td>
              <td>{item.hsn_code || 'N/A'}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsList;