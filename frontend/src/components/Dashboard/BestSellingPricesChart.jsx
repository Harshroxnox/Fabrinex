import React, { useState } from "react";
import { getVariantSalesByBarcode } from "../../contexts/api/products";
import "./BestSellingVariantTable.css";

const BestSellingVariantTable = () => {
  const [barcode, setBarcode] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [searchedBarcode, setSearchedBarcode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setError("Please enter a barcode.");
      return;
    }

    setLoading(true);
    setError(null);
    setSalesData([]);

    try {
      const res = await getVariantSalesByBarcode(barcode);
      if (res?.data) {
        setSalesData(res.data);
        setSearchedBarcode(barcode);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || "An error occurred while fetching data.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="2" className="no-data">
            Loading...
          </td>
        </tr>
      );
    }

    if (error) {
        return (
          <tr>
            <td colSpan="2" className="no-data error">
              {error}
            </td>
          </tr>
        );
      }

    if (salesData.length > 0) {
      return salesData.map((item) => (
        <tr key={item.price_at_purchase}>
          <td>₹{parseFloat(item.price_at_purchase).toFixed(2)}</td>
          <td>{item.total_quantity_sold}</td>

        </tr>
      ));
    }

    if (searchedBarcode && salesData.length === 0) {
        return (
          <tr>
            <td colSpan="2" className="no-data">
              No sales data found for barcode '{searchedBarcode}'.
            </td>
          </tr>
        );
      }

    return (
        <tr>
            <td colSpan="2" className="no-data">
                Enter a variant's barcode to see its sales data.
            </td>
        </tr>
    );
  };


  return (
    <div className="variant-container">
      <h1 className="title">Variant Sales Data by Barcode</h1>
      <h4 className="subtitle">
        See total units sold at each price point for a specific variant
      </h4>

      <form onSubmit={handleSearch} className="salesperson-search-div">
        <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Enter barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="salesperson-search-input"
          />
        </div>
        <button type="submit" className="salesperson-search-text" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="table-wrapper">
        <table className="variant-table">
          <thead>
            <tr>
              <th>Price at Purchase (₹)</th>
              <th>Total Quantity Sold</th>
            </tr>
          </thead>
          <tbody>
            {renderContent()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BestSellingVariantTable;