import React, { useState } from 'react';
import './ProductsList.css';

const ProductFilters = ({ onSearch, onReset }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleReset = () => {
    setSearchTerm('');
    onReset();
  };

  return (
    <div className="filters-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search Products</button>
      </form>

      <button 
        className="reset-btn"
        onClick={handleReset}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ProductFilters;
