import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Search, MapPin, Calendar, DollarSign, CreditCard, Filter, Plus, Scan, Minus, ShoppingCart, ArrowLeft, Package, X, FileInput } from 'lucide-react';
import Invoice from '../../components/Invoice/Invoice';
import { getAllOrders } from '../../contexts/api/orders';
import './Orders.css'; // We'll create this CSS file
import { productData } from '../../constants/ProductsData';

const OrderCreationCRM = () => {


  const productsDB = productData;

  const [currentView, setCurrentView] = useState('orders');
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [totalAmountFilter, setTotalAmountFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    userID: '',
    customerName: '',
    location: '',
    paymentMethod: 'Credit Card'
  });
  const [salesperson, setSalesperson] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [orderchoose, setOrderChoose] = useState(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await getAllOrders();
      setOrdersData(res.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'shipped':
        return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'success':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'failed':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

// Order creation functions
const handleBarcodeSubmit = () => {
  if (!barcodeInput.trim()) return;
  
  // Find product by barcode
  const product = productsDB.find(p => p.barcode === barcodeInput.trim());
  
  if (product) {
    // Check if product already exists in selected products
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    
    if (existingProduct) {
      // If product exists, check stock before increasing quantity
      if (existingProduct.quantity < product.stock) {
        setSelectedProducts(prev => 
          prev.map(p => 
            p.id === product.id 
              ? { ...p, quantity: p.quantity + 1 }
              : p
          )
        );
      } else {
        alert(`Cannot add more. Stock limit: ${product.stock}`);
      }
    } else {
      // If product doesn't exist, add it with quantity 1
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
    
    // Clear the barcode input
    setBarcodeInput('');
  } else {
    alert('Product not found with this barcode!');
  }
};

const updateQuantity = (productId, newQuantity) => {
  // Find the product in our database
  const product = productsDB.find(p => p.id === productId);
  
  // If quantity is 0 or negative, remove the product
  if (newQuantity <= 0) {
    removeProduct(productId);
    return;
  }
  
  // Check if new quantity exceeds available stock
  if (newQuantity > product.stock) {
    alert(`Cannot exceed stock limit: ${product.stock}`);
    return;
  }
  
  // Update the quantity
  setSelectedProducts(prev =>
    prev.map(p =>
      p.id === productId ? { ...p, quantity: newQuantity } : p
    )
  );
};


const removeProduct = (productId) => {
  setSelectedProducts(prev => prev.filter(p => p.id !== productId));
};

const calculateTotal = () => {
  return selectedProducts.reduce((total, product) => 
    total + (product.price * product.quantity), 0
  ).toFixed(2);
};

const generateOrderId = () => {
  // Find the highest order ID in current orders
  const lastOrder = ordersData.sort((a, b) => 
    parseInt(b.id.substring(1)) - parseInt(a.id.substring(1))
  )[0];
  
  // Start from 1000 if no orders exist, otherwise increment
  const lastId = lastOrder ? parseInt(lastOrder.id.substring(1)) : 1000;
  return `#${lastId + 1}`;
};

const handleCreateOrder = () => {
  // Validate required fields
  if (!customerInfo.userID || !customerInfo.customerName || selectedProducts.length === 0) {
    alert('Please fill all customer information and add at least one product');
    return;
  }

  // Validate salesperson information
  if (!salesperson.trim()) {
    alert('Please enter salesperson name');
    return;
  }

  // Create the new order object
  const newOrder = {
    id: generateOrderId(),
    userID: customerInfo.userID,
    customer: customerInfo.customerName,
    total: parseFloat(calculateTotal()),
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: customerInfo.paymentMethod,
    location: customerInfo.location || 'Store Location',
    date: new Date().toISOString().split('T')[0],
    items: selectedProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      quantity: p.quantity
    })),
    tracking: [
      {
        location: 'Order Placed',
        date: new Date().toISOString().split('T')[0],
        status: 'Confirmed'
      }
    ],
    salesperson: salesperson.trim()
  };

  // Add the new order to our orders data
  setOrdersData(prev => [newOrder, ...prev]);
  
  // Reset the form
  setSelectedProducts([]);
  setCustomerInfo({
    userID: '',
    customerName: '',
    location: '',
    paymentMethod: 'Credit Card'
  });
  setSalesperson("");
  setBarcodeInput('');
  
  // Show success message and navigate back to orders view
  alert('Order created successfully!');
  setCurrentView('orders');
};

  // Orders page functions
const filteredOrders = ordersData.filter(order => {
  const statusMatch = statusFilter === 'All' || order.order_status === statusFilter;
  const paymentStatusMatch = paymentStatusFilter === 'All' || order.payment_status === paymentStatusFilter;
  const locationMatch = locationFilter === 'All' || order.location === locationFilter;
  const paymentMethodMatch = paymentMethodFilter === 'All' || order.payment_method === paymentMethodFilter;
  
  const totalAmountMatch = (() => {
    switch (totalAmountFilter) {
      case 'Under ₹150':
        return order.amount < 150;
      case '₹150 - ₹200':
        return order.amount >= 150 && order.amount <= 200;
      case 'Over ₹200':
        return order.amount > 200;
      default:
        return true;
    }
  })();

  const dateMatch = (() => {
    if (!dateFromFilter && !dateToFilter) return true;
    
    try {
      const orderDate = new Date(order.created_at);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;
      
      // Set time to beginning/end of day for proper date comparison
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);
      orderDate.setHours(12, 0, 0, 0); // Neutral time for comparison
      
      if (fromDate && toDate) {
        return orderDate >= fromDate && orderDate <= toDate;
      } else if (fromDate) {
        return orderDate >= fromDate;
      } else if (toDate) {
        return orderDate <= toDate;
      }
      return true;
    } catch (error) {
      console.error('Error parsing dates:', error);
      return true; // Don't filter if date parsing fails
    }
  })();

  return statusMatch && paymentStatusMatch && locationMatch && 
         paymentMethodMatch && totalAmountMatch && dateMatch;
});

const handleTrackOrder = () => {
  if (!trackingOrderId.trim()) {
    alert('Please enter an order ID to track');
    return;
  }

  // Normalize the input (remove # if present, handle case sensitivity)
  const searchId = trackingOrderId.trim().toLowerCase().replace(/^#/, '');
  
  // Find the order by ID (case insensitive search)
  const order = ordersData.find(o => 
    o.orderID.toLowerCase().replace(/^#/, '') === searchId
  );

  if (order) {
    setTrackedOrder(order);
  } else {
    alert(`No order found with ID: ${trackingOrderId}`);
    setTrackedOrder(null);
  }
};

// Additional utility function to get unique values for filter dropdowns
const getUniqueValues = (orders, key) => {
  const values = orders.map(order => order[key]).filter(Boolean);
  return [...new Set(values)].sort();
};

// Function to clear all filters
const clearAllFilters = () => {
  setStatusFilter('All');
  setPaymentStatusFilter('All');
  setTotalAmountFilter('All');
  setLocationFilter('All');
  setPaymentMethodFilter('All');
  setDateFromFilter('');
  setDateToFilter('');
  setTrackingOrderId('');
  setTrackedOrder(null);
};

// Function to export filtered orders to CSV
const exportToCSV = () => {
  if (filteredOrders.length === 0) {
    alert('No orders to export');
    return;
  }

  const headers = ['Order ID', 'Customer ID', 'Customer Name', 'Total Amount', 
                  'Order Status', 'Payment Status', 'Payment Method', 'Location', 'Date'];
  
  const csvContent = [
    headers.join(','),
    ...filteredOrders.map(order => [
      order.orderID,
      order.userID,
      `"${order.customer_name.replace(/"/g, '""')}"`, // Escape quotes in CSV
      order.amount,
      order.order_status,
      order.payment_status,
      order.payment_method,
      order.location,
      order.created_at
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to get filter summary text
const getFilterSummary = () => {
  const activeFilters = [];
  
  if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
  if (paymentStatusFilter !== 'All') activeFilters.push(`Payment: ${paymentStatusFilter}`);
  if (totalAmountFilter !== 'All') activeFilters.push(`Amount: ${totalAmountFilter}`);
  if (locationFilter !== 'All') activeFilters.push(`Location: ${locationFilter}`);
  if (paymentMethodFilter !== 'All') activeFilters.push(`Method: ${paymentMethodFilter}`);
  if (dateFromFilter || dateToFilter) {
    const dateRange = [];
    if (dateFromFilter) dateRange.push(`From: ${dateFromFilter}`);
    if (dateToFilter) dateRange.push(`To: ${dateToFilter}`);
    activeFilters.push(`Date: ${dateRange.join(' - ')}`);
  }
  
  return activeFilters.length > 0 
    ? `Filters: ${activeFilters.join(', ')}` 
    : 'No filters applied';
};

  const uniqueLocations = [...new Set(ordersData.map(order => order.location))];
  const uniquePaymentMethods = [...new Set(ordersData.map(order => order.paymentMethod))];

  if (currentView === 'create') {
    return (
      <div className="order-container">
        <div className="order-main-content">
          <div className="order-header">
            <h1 className="order-title">Create New Order</h1>
            <button 
              className="order-back-button"
              onClick={() => setCurrentView('orders')}
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>
          </div>

          {/* Salesperson information */}
          <div className="order-section">
            <h2 className="order-section-title">
              <Package size={20} />
              Salesperson Information
            </h2>
            <div className="order-form-grid">
              <div className="order-form-group">
                <label className="order-label">Salesperson name *</label>
                <input
                  type="text"
                  className="order-input"
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  placeholder="Enter Salesperson Name"
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="order-section">
            <h2 className="order-section-title">
              <Package size={20} />
              Customer Information
            </h2>
            <div className="order-form-grid">
              {/* Form fields remain the same */}
            </div>
          </div>

          {/* Product Scanning */}
          <div className="order-section">
            <h2 className="order-section-title">
              <Scan size={20} />
              Scan Products
            </h2>
            {/* Scan form remains the same */}
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div className="order-section">
              <h2 className="order-section-title">
                <ShoppingCart size={20} />
                Selected Products ({selectedProducts.length})
              </h2>
              {/* Product list remains the same */}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Orders Page View
  return (
    <div className="order-container">
      <div className="order-main-content">
        <div className="order-header">
          <h1 className="order-title">Orders</h1>
          <div className="order-header-controls">
            <div className="order-filters-container">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="order-filter-button"
              >
                <Filter size={16} />
                Filters
                <ChevronDown 
                  size={16} 
                  className={showFilters ? 'order-filter-arrow open' : 'order-filter-arrow'} 
                />
              </button>

              {showFilters && (
                <div className="order-filter-dropdown">
                  {/* Filter options remain the same */}
                </div>
              )}
            </div>
            
            <button 
              className="order-create-button"
              onClick={() => setCurrentView('create')}
            >
              <Plus size={16} />
              Create Order
            </button>
          </div>
        </div>

        {loading ? (
          <p className="order-loading">Loading data...</p>
        ) : (
          <div className="order-table-container">
            <div className="order-table-wrapper">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer ID</th>
                    <th>Customer Name</th>
                    <th>Total Amount</th>
                    <th>Order Status</th>
                    <th>Payment Status</th>
                    <th>Payment Method</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Check Invoice</th>
                    <th>Billed By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td>
                        <span className="order-id">{order.orderID}</span>
                      </td>
                      <td>{order.userID}</td>
                      <td>{order.customer_name}</td>
                      <td>
                        <span className="order-amount">₹{order.amount}</span>
                      </td>
                      <td>
                        <span 
                          className="order-status-badge"
                          style={getStatusColor(order.order_status)}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="order-payment-status-badge"
                          style={getPaymentStatusColor(order.payment_status)}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{order.payment_method}</td>
                      <td>noor</td>
                      <td>{order.created_at}</td>
                      <td>
                        <span onClick={() => {setInvoice(true); setOrderChoose(order)}}>
                          <FileInput className="order-invoice-icon" />
                        </span>
                      </td>
                      <td>salesperson</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Track Order section */}
        <div className="order-track-section">
          <h2 className="order-track-title">Track Order</h2>
          <div className="order-track-controls">
            <input
              type="text"
              placeholder="Enter Order ID (e.g., #1001)"
              value={trackingOrderId}
              onChange={(e) => setTrackingOrderId(e.target.value)}
              className="order-track-input"
            />
            <button 
              onClick={handleTrackOrder}
              className="order-track-button"
            >
              <Search size={16} />
              Track Order
            </button>
          </div>

          {trackedOrder && (
            <div className="order-track-result">
              {/* Tracking result remains the same */}
            </div>
          )}
        </div>
      </div>

      {invoice && orderchoose && (
        <div className="order-invoice-modal">
          <div className="order-invoice-content">
            <button
              onClick={() => {
                setInvoice(false);
                setOrderChoose(null);
              }}
              className="order-invoice-close"
            >
              <X size={20} />
            </button>
            <Invoice order={orderchoose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCreationCRM;