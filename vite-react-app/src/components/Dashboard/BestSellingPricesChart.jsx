import React, { useEffect, useState } from "react";
import { getBestSellingPrices } from "../../contexts/api/products";
import "./BestSellingVariantTable.css"; // Import CSS

const BestSellingVariantTable = () => {
  const [variants, setVariants] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBestSellingPrices();
      if (res?.data?.data) {
        setVariants(res.data.data);
      }
    };
    fetchData();
  }, []);

  // Filtered data based on search
  const filteredVariants = variants.filter((variant) =>
    `${variant.name} ${variant.size} ${variant.color}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="variant-container">
      <h1 className="title">Best Selling Price per Variant</h1>
      <h4 className="subtitle">At which price each variant sold the most</h4>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search variant..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {/* Table */}
      <div className="table-wrapper">
        <table className="variant-table">
          <thead>
            <tr>
              <th>Variant ID</th>
              <th>Name</th>
              <th>Size</th>
              <th>Color</th>
              <th>Price at Purchase (₹)</th>
              <th>Total Sold</th>
            </tr>
          </thead>
          <tbody>
            {filteredVariants.length > 0 ? (
              filteredVariants.map((variant) => (
                <tr key={variant.variantID}>
                  <td>{variant.variantID}</td>
                  <td>{variant.name}</td>
                  <td>{variant.size}</td>
                  <td>{variant.color}</td>
                  <td>₹{variant.price_at_purchase}</td>
                  <td>{variant.total_sold}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No variants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BestSellingVariantTable;
