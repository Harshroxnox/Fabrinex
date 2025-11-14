import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReturnsByDateRange } from '../../contexts/api/orders'; 
import { formatDate } from '../../utils/dateFormatter.js';
import { returnsStyles } from './styles.js'; 

const DailyReturnsSection = () => {
  const [returnsData, setReturnsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturns, setTotalReturns] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const formatPrice = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

  const fetchReturns = useCallback(async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select both a start and end date.');
      return;
    }

    setLoading(true);

    try {
      const res = await getReturnsByDateRange(dateFrom, dateTo, page, limit);

      setReturnsData(res.returns || []);

      const totalCount = res.total || 0;
      setTotalReturns(totalCount);
      setTotalPages(Math.ceil(totalCount / limit));

    } catch (error) {
      const msg = error.response?.data?.message || 'Error fetching returns.';
      toast.error(msg);
      setReturnsData([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, page, limit]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleFilter = () => {
    setPage(1); // Reset page
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div style={returnsStyles.container}> 
      
      <h2 style={returnsStyles.headerTitle}>
        Product Returns History ({totalReturns} Total)
      </h2>
      
      <div style={returnsStyles.filterGroup}> 
        <label style={{ fontWeight: '500' }}>
          <Calendar size={16} style={{ marginRight: '0.5rem' }} />
          Date From:
        </label>

        <input 
          type="date" 
          value={dateFrom} 
          onChange={(e) => setDateFrom(e.target.value)} 
          style={returnsStyles.input} 
        />

        <label style={{ fontWeight: '500' }}>Date To:</label>

        <input 
          type="date" 
          value={dateTo} 
          onChange={(e) => setDateTo(e.target.value)} 
          style={returnsStyles.input} 
        />

        <button onClick={handleFilter} style={returnsStyles.filterButton}>
          <RefreshCw size={16} /> Filter
        </button>
      </div>

      {/* TABLE */}
      <div style={returnsStyles.tableContainer}>
        {loading ? (
          <div style={returnsStyles.loadingMessage}>Loading returns...</div>
        ) : returnsData.length === 0 ? (
          <div style={returnsStyles.loadingMessage}>
            No returns logged between {dateFrom} and {dateTo}.
          </div>
        ) : (
          <table style={returnsStyles.table}>
            <thead>
              <tr>
                <th style={returnsStyles.th}>Date</th>
                <th style={returnsStyles.th}>Order ID</th>
                <th style={returnsStyles.th}>Customer Name</th>
                <th style={returnsStyles.th}>Product Name</th>
                <th style={returnsStyles.th}>Variant (Color/Size)</th>
                <th style={returnsStyles.th}>Qty Returned</th>
                <th style={returnsStyles.th}>Credit Per Item</th>
                <th style={returnsStyles.th}>Total Credit</th>
              </tr>
            </thead>
            <tbody>
              {returnsData.map((item, index) => (
                <tr key={index}>
                  <td style={returnsStyles.td}>{formatDate(item.created_at)}</td>
                  <td style={returnsStyles.td}><strong>{item.orderID}</strong></td>
                  <td style={returnsStyles.td}>{item.customer_name}</td>
                  <td style={returnsStyles.td}>{item.product_name}</td>
                  <td style={returnsStyles.td}>{item.color} / {item.size}</td>
                  <td style={returnsStyles.td}>{item.returned_quantity}</td>
                  <td style={returnsStyles.td}>{formatPrice(item.price_at_purchase)}</td>
                  <td style={{ ...returnsStyles.td, fontWeight: '600', color: '#10b981' }}>
                    {formatPrice(item.total_credit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div style={paginationControlsStyle}>
          <button 
            onClick={handlePrev} 
            disabled={page === 1} 
            style={paginationButtonStyle}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={paginationSpanStyle}>
            Page {page} of {totalPages}
          </span>

          <button 
            onClick={handleNext} 
            disabled={page === totalPages} 
            style={paginationButtonStyle}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

const paginationControlsStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  marginTop: '25px',
  padding: '10px',
};

const paginationButtonStyle = {
  padding: '8px 16px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  color: '#3b82f6', // Use primary color
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  transition: 'background-color 0.2s, color 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};

const paginationSpanStyle = {
  fontSize: '16px',
  color: '#495057',
  fontWeight: '500',
};

export default DailyReturnsSection;
