import React, { useState } from 'react';
import './PurchaseFilters.css';
const PurchaseFilters = ({ onSearch, onReset }) => {
  const [seller, setSeller] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSellerSearch = () => {
    if (!seller.trim()) return;
    onSearch({ type: 'seller', term: seller });
  };
  
  const handleDateSearch = () => {
    if (!startDate || !endDate) return;
    onSearch({ type: 'dateRange', dateRange: { startDate, endDate } });
  };
  
  const handleResetClick = () => {
    setSeller('');
    setStartDate('');
    setEndDate('');
    onReset();
  };

  return (
    <div className="purchase-filters-container">
      <input
        type="text"
        placeholder="Search by supplier..."
        value={seller}
        onChange={(e) => setSeller(e.target.value)}
        className="search-input"
      />
      <button onClick={handleSellerSearch}>Search Seller</button>
      
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={handleDateSearch}>Search By Dates</button>

      <button onClick={handleResetClick}>Reset All</button>
    </div>
  );
};

export default PurchaseFilters;