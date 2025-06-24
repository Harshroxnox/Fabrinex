import React, { useState } from 'react';
import './ProductsList.css';

const ProductFilters = ({ onSearch, onVariantSearch, onReset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [variantSearchTerm, setVariantSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleVariantSearch = (e) => {
    e.preventDefault();
    onVariantSearch(variantSearchTerm);
  };

  const handleReset = () => {
    setSearchTerm('');
    setVariantSearchTerm('');
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

      <form onSubmit={handleVariantSearch} className="search-form">
        <input
          type="text"
          placeholder="Search variants by color or size..."
          value={variantSearchTerm}
          onChange={(e) => setVariantSearchTerm(e.target.value)}
        />
        <button type="submit">Search Variants</button>
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