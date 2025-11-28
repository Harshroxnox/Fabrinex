import React, { useCallback, useEffect, useState } from 'react';
import {
  ChevronDown, Search, MapPin, Calendar, DollarSign, CreditCard, Filter,
  Plus, FileInput, X, UserCheck2Icon,
  RotateCcw,
  CopyCheckIcon
} from 'lucide-react';
import Invoice from '../../components/Invoice/Invoice';
import { styles } from './Orders';
import {
  createOrderOffline,
  filterOrder,
  getAllOrders
} from '../../contexts/api/orders';
import {
  paymentStatusColor,
  paymentStatusIcon,
  statusColor
} from '../../utils/colorSelection.jsx';
import { formatDate } from '../../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { OrderCreation } from './OrderCreation.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import OrderExchangeModal from './OrderExchangeModal.jsx';
import { useSearchParams } from 'react-router-dom';


// =============================
// MAIN COMPONENT
// =============================
const OrderCreationCRM = () => {
  // -----------------------------
  // 🔹 View & Core States
  // -----------------------------
  const [currentView, setCurrentView] = useState('orders'); // 'orders' | 'create'
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(false);
  const [orderchoose, setOrderChoose] = useState(null);

  // -----------------------------
  // 🔹 Pagination
  // -----------------------------
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // -----------------------------
  // 🔹 Filters
  // -----------------------------
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [totalAmountFrom, setTotalAmountFrom] = useState("");
  const [totalAmountTo, setTotalAmountTo] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [salesPersonIdFilter, setSalesPersonIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // -----------------------------
  // 🔹 Order Tracking
  // -----------------------------
  const [trackingOrderId, setTrackingOrderId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);

  // -----------------------------
  // 🔹 Role Access
  // -----------------------------
  const roles = localStorage.getItem("role") || "";
  const canCreateOrder = roles.includes("superadmin");

  // =============================
  // 🔹 Fetch Orders (Paginated)
  // =============================
  const fetchOrders = useCallback(async (page, limit) => {
    try {
      const res = await getAllOrders(page, limit);
      setOrdersData(res.orders || []);
      setTotalPages(Math.ceil(res.total / limit));
    } catch (error) {
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔸 Initial Fetch
  useEffect(() => {
    setLoading(true);
    fetchOrders(page, limit);
  }, [page, limit, fetchOrders]);

  // =============================
  // 🔹 Filter Orders
  // =============================
  const fetchFilteredOrders = async () => {
    try {
      const params = {};
      if (statusFilter !== "All") params.order_status = statusFilter;
      if (paymentStatusFilter !== "All") params.payment_status = paymentStatusFilter;
      if (paymentMethodFilter !== "All") params.payment_method = paymentMethodFilter;
      if (dateFromFilter) params.date_from = dateFromFilter;
      if (dateToFilter) params.date_to = dateToFilter;
      if (totalAmountFrom) params.amount_from = totalAmountFrom;
      if (totalAmountTo) params.amount_to = totalAmountTo;

      const data = await filterOrder(params);
      setOrdersData(data.orders || []);
    } catch (err) {
      toast.error(`Error fetching filtered orders: ${err.message || "Unknown error"}`);
    }
  };

  // 🔸 Refetch on filter change
  useEffect(() => {
    fetchFilteredOrders();
  }, [
    statusFilter, paymentStatusFilter, paymentMethodFilter,
    totalAmountFrom, totalAmountTo, dateFromFilter, dateToFilter
  ]);

  // =============================
  // 🔹 Handlers
  // =============================

  const handleAdd = async (newOrder) => {
    try {
      await createOrderOffline(newOrder);
      return true;
    } catch {
      toast.error("Error creating order");
      return false;
    }
  };

  const handleTrackOrder = () => {
    const order = ordersData.find(
      (o) => o.id.toLowerCase() === trackingOrderId.toLowerCase()
    );
    setTrackedOrder(order);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // =============================
  // 🔹 Utility Helpers
  // =============================
  const getStatusColor = (status) => statusColor(status);
  const getPaymentStatusColor = (status) => paymentStatusColor(status);
  const getPaymentStatusIcon = (status) => paymentStatusIcon(status);

  const uniqueLocations = [...new Set(ordersData.map(order => order.location))];
  const uniquePaymentMethods = [...new Set(ordersData.map(order => order.payment_method))];

  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [orderToExchange, setOrderToExchange] = useState(null);

  const handleOpenExchangeModal = (orderID) => {
    setOrderToExchange(orderID);
    setExchangeModalOpen(true);
  };

  // Handler to close and reset the modal state
  const handleCloseExchangeModal = () => {
    setOrderToExchange(null);
    setExchangeModalOpen(false);
  };


  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'create') {
      setCurrentView('create');
    }
    else{
      setCurrentView('orders');   
    }
  }, [searchParams]);

  const handleInternalCreateClick = () => {
    setSearchParams({ view: 'create' });
  }

  const handleBackToOrders = () => {
    setSearchParams({});
    setCurrentView('orders');
  }
  // =============================
  // 🔹 Conditional View: Create Order
  // =============================
  if (currentView === 'create') {
    return (
      <OrderCreation
        setCurrentView={handleBackToOrders}
        handleAdd={handleAdd}
        fetchOrders={fetchOrders}
        page={page}
        limit={limit}
      />
    );
  }



  // =============================
  // 🔹 Render: Orders Page
  // =============================
  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Orders</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Filter Button */}
            <div style={styles.filtersContainer}>
              <button onClick={() => setShowFilters(!showFilters)} style={styles.filterButton}>
                <Filter size={16} color="white" />
                Filters
                <ChevronDown
                  size={16}
                  style={{
                    transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>

              {/* Filter Dropdown */}
              {showFilters && (
                <div style={styles.filterDropdown}>
                  {/* Date Filters */}
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}><Calendar size={14} /> Date From</label>
                    <input type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} style={styles.input} />
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}><Calendar size={14} /> Date To</label>
                    <input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} style={styles.input} />
                  </div>

                  {/* Order Status */}
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Order Status</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
                      <option value="All">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Payment Status</label>
                    <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} style={styles.select}>
                      <option value="All">All Payment Status</option>
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Amount Filters */}
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}><DollarSign size={14} /> Amount From</label>
                    <input type="number" value={totalAmountFrom} onChange={(e) => setTotalAmountFrom(e.target.value)} style={styles.input} placeholder="Min Amount" />
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}><DollarSign size={14} /> Amount To</label>
                    <input type="number" value={totalAmountTo} onChange={(e) => setTotalAmountTo(e.target.value)} style={styles.input} placeholder="Max Amount" />
                  </div>

                  {/* Payment Method */}
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}><CreditCard size={14} /> Payment Method</label>
                    <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} style={styles.select}>
                      <option value="All">All Payment Method</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="netbanking">NetBanking</option>
                      <option value="wallet">Wallet</option>
                      <option value="cash-on-delivery">Cash On Delivery</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Create Order Button */}
            <button
              style={{
                ...styles.createButton,
                ...(canCreateOrder ? {} : styles.disabledButton)
              }}
              onClick={handleInternalCreateClick}
              disabled={!canCreateOrder}
            >
              <Plus size={16} color="white" /> Create Order
            </button>
          </div>
        </div>

        {/* Orders Table */}
<div style={styles.tableContainer}>
  <AnimatePresence mode="wait">
    {loading ? (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}
      >
        Loading orders...
      </motion.div>
    ) : (
      <motion.div
        key={page} // fade animation triggers when page changes
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ overflowX: 'auto' }}
      >
        <table style={styles.table}>
          <thead style={{ backgroundColor: '#FDFDFD' }}>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer Name</th>
              <th style={styles.th}>Total Amount</th>
              <th style={styles.th}>Order Status</th>
              <th style={styles.th}>Payment Status</th>
              <th style={styles.th}>Payment Method</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Check Invoice</th>
              <th style= {styles.th}> Exchange Return </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#FDFDFD' }}>
            {ordersData.map((order) => (
              <tr key={order.orderID} style={{ cursor: 'pointer' }}>
                <td style={styles.td}><strong>{order.orderID}</strong></td>
                <td style={styles.td}>{order.customer_name}</td>
                <td style={styles.td}>₹{order.amount}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, ...getStatusColor(order.order_status) }}>
                    {order.order_status}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, ...getPaymentStatusColor(order.payment_status) }}>
                    {getPaymentStatusIcon(order.payment_status)}
                    {order.payment_status}
                  </span>
                </td>
                <td style={styles.td}>{order.payment_method}</td>
                <td style={styles.td}>{order.order_location}</td>
                <td style={styles.td}>{formatDate(order.created_at)}</td>
                <td style={styles.td}>
                  <FileInput
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInvoice(true);
                      setOrderChoose(order.orderID);
                    }}
                  />
                </td>
                <td style={styles.td}>

                  <CopyCheckIcon // Icon suggesting a circular flow/exchange
                    size={20}
                    style={{ cursor: 'pointer', color: '#10B981' }} 
                    onClick={(e) => {
                      e.stopPropagation(); // Stop row click (if any)
                      handleOpenExchangeModal(order.orderID); // Open the modal
                    }}
                    />
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    )}
  </AnimatePresence>
</div>


        {/* Pagination */}
        <div style={styles.PageDiv}>
          <button onClick={handlePrev} disabled={page === 1} style={styles.orderPreviousBtn}>
            Previous
          </button>
          <span style={styles.orderPageText}>Page {page} of {totalPages}</span>
          <button onClick={handleNext} disabled={page === totalPages} style={styles.orderNextBtn}>
            Next
          </button>
        </div>

        {/* Track Order Section */}
        <div style={styles.section}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Track Order</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Enter Order ID (e.g., #1001)"
              value={trackingOrderId}
              onChange={(e) => setTrackingOrderId(e.target.value)}
              style={{ ...styles.input, flex: 1, maxWidth: '300px' }}
            />
            <button
              onClick={handleTrackOrder}
              style={{
                backgroundColor: '#111827',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '2rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Search size={16} /> Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoice && orderchoose && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <button
              onClick={() => {
                setInvoice(false);
                setOrderChoose(null);
              }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <Invoice order={orderchoose} />
          </div>
        </div>
      )}
      {exchangeModalOpen && orderToExchange && (
        <OrderExchangeModal
          orderID={orderToExchange}
          onClose={handleCloseExchangeModal}
          onSuccessfulUpdate={handleCloseExchangeModal} // Closes modal on success
          fetchOrders={() => fetchOrders(page, limit)} // Pass the function to refresh the main list
        />
      )}
    </div>
  );
};

export default OrderCreationCRM;
