import React, { useState } from 'react';
import './ProductsList.css';

const ProductFilters = ({ onSearch, onVariantSearch }) => {
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

  return (
    <div className="filters-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <form onSubmit={handleVariantSearch} className="search-form">
        <input
          type="text"
          placeholder="Search variants by color/size..."
          value={variantSearchTerm}
          onChange={(e) => setVariantSearchTerm(e.target.value)}
        />
        <button type="submit">Search Variants</button>
      </form>
    </div>
  );
};

export default ProductFilters;