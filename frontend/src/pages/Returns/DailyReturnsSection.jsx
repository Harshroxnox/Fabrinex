import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight, CornerDownLeft } from 'lucide-react';
import { getReturnsByDateRange } from '../../contexts/api/orders'; 
import { formatDate } from '../../utils/dateFormatter.js';
import { returnsStyles } from './styles.js'; 

const DailyReturnsSection = () => {
  const [returnsData, setReturnsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturns, setTotalReturns] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const formatPrice = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

  const fetchReturns = useCallback(async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);

    try {
      const res = await getReturnsByDateRange(dateFrom, dateTo, page, limit);
      setReturnsData(res.returns || []);
      setTotalReturns(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / limit));
    } catch (error) {
      toast.error('Error fetching returns.');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, page, limit]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  return (
    <div style={returnsStyles.container}> 
      <h2 style={returnsStyles.headerTitle}>
        <CornerDownLeft size={24} style={{ marginRight: '10px' }}/>
        Product Returns History ({totalReturns})
      </h2>
      
      {/* Filters */}
      <div style={returnsStyles.filterGroup}> 
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={returnsStyles.input} />
        <span>to</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={returnsStyles.input} />
        <button onClick={() => setPage(1)} style={returnsStyles.filterButton}><RefreshCw size={16} color="white"/> Filter</button>
      </div>

      {/* Table */}
      <div style={returnsStyles.tableContainer}>
        {loading ? (
          <div style={returnsStyles.loadingMessage}>Loading...</div>
        ) : returnsData.length === 0 ? (
          <div style={returnsStyles.loadingMessage}>No returns found.</div>
        ) : (
          <table style={returnsStyles.table}>
            <thead>
              <tr>
                <th style={returnsStyles.th}>Date</th>
                <th style={returnsStyles.th}>Order ID</th>
                <th style={returnsStyles.th}>Customer</th>
                <th style={returnsStyles.th}>Product</th>
                <th style={returnsStyles.th}>Qty</th>
                <th style={returnsStyles.th}>Unit Refund (Inc Tax)</th>
                <th style={returnsStyles.th}>Total Credited</th>
              </tr>
            </thead>
            <tbody>
              {returnsData.map((item, index) => (
                <tr key={index}>
                  <td style={returnsStyles.td}>{formatDate(item.created_at)}</td>
                  <td style={returnsStyles.td}><strong>#{item.orderID}</strong></td>
                  <td style={returnsStyles.td}>{item.customer_name}</td>
                  <td style={returnsStyles.td}>
                    {item.product_name}<br/>
                    <span style={{fontSize:'0.8em', color:'#666'}}>{item.color} | {item.size}</span>
                  </td>
                  <td style={returnsStyles.td}>
                    <span style={{color: '#b91c1c', fontWeight:'bold', background:'#fee2e2', padding:'2px 6px', borderRadius:'4px'}}>
                       -{item.returned_quantity}
                    </span>
                  </td>
                  {/* Backend now provides calculated values */}
                  <td style={returnsStyles.td}>{formatPrice(item.unit_refund_amount_inc_tax)}</td>
                  <td style={{...returnsStyles.td, fontWeight:'700', color:'#059669'}}>
                    {formatPrice(item.total_credit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default DailyReturnsSection;