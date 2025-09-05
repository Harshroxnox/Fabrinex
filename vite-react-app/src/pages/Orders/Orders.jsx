


import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Search, MapPin, Calendar, DollarSign, CreditCard, CheckCircle, XCircle, Clock, Filter, Plus, Scan, Minus, ShoppingCart, ArrowLeft, Package, X, FileInput } from 'lucide-react';
import Invoice from '../../components/Invoice/Invoice';
import { ordersData } from '../../constants/ordersData';
import { productData } from '../../constants/ProductsData';
import { styles } from './Orders';
import { getAllOrders } from '../../contexts/api/orders';
import { paymentStatusColor, paymentStatusIcon, statusColor } from '../../utils/colorSelection.jsx';
// Sample products database
const productsDB = productData;
// Initial orders data (your existing data)
const initialOrdersData = ordersData;
const OrderCreationCRM = () => {
  const [currentView, setCurrentView] = useState('orders'); // 'orders' or 'create'
  const [ordersData, setOrdersData] = useState([]);
  const [loading , setLoading] = useState(true);
    // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      console.log(res);
      setOrdersData(res.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Orders page filters
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

  // Order creation states
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    userID: '',
    customer_name: '',
    location: 'noor',
    payment_method: 'Credit Card'
  }); 
  const [salesperson , setSalesperson] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [orderchoose,setOrderChoose]=useState([]);

  const getStatusColor =(status) => statusColor(status);
  const getPaymentStatusColor = (status) => paymentStatusColor(status);

  useEffect(()=>{
    console.log(orderchoose);
  },[orderchoose])
  const getPaymentStatusIcon = (status) => paymentStatusIcon(status);

  // Order creation functions
  const handleBarcodeSubmit = () => {
    if (!barcodeInput.trim()) return;
    
    const product = productsDB.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      const existingProduct = selectedProducts.find(p => p.id === product.id);
      if (existingProduct) {
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
        setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
      }
      setBarcodeInput('');
    } else {
      alert('Product not found with this barcode!');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = productsDB.find(p => p.id === productId);
    if (newQuantity <= 0) {
      removeProduct(productId);
      return;
    }
    if (newQuantity > product.stock) {
      alert(`Cannot exceed stock limit: ${product.stock}`);
      return;
    }
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
    const lastOrder = ordersData.sort((a, b) => 
      parseInt(b.id.substring(1)) - parseInt(a.id.substring(1))
    )[0];
    const lastId = lastOrder ? parseInt(lastOrder.id.substring(1)) : 1000;
    return `#${lastId + 1}`;
  }; // no need ,,, will remove

  const handleCreateOrder = () => {
    if (!customerInfo.userID || !customerInfo.customer_name || selectedProducts.length === 0) {
      alert('Please fill all customer information and add at least one product');
      return;
    }

    const newOrder = {
      orderID: generateOrderId(),
      userID: customerInfo.userID,
      customer_name: customerInfo.customer_name,
      amount: parseFloat(calculateTotal()),
      order_status: 'pending',
      payment_status: 'pending',
      payment_method: customerInfo.paymentMethod,
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
      ]
    }; //need to update

    console.log(newOrder);

    setOrdersData(prev => [newOrder, ...prev]);
    
    // Reset form
    setSelectedProducts([]);
    setCustomerInfo({
      userID: '',
      customer_name: '',
      location: '',
      payment_method: 'Credit Card'
    });
    setBarcodeInput('');
    
    alert('Order created successfully!');
    setCurrentView('orders');
  };

  // Orders page functions
  const filteredOrders = ordersData.filter(order => {
    const statusMatch = statusFilter === 'All' || order.status === statusFilter;
    const paymentStatusMatch = paymentStatusFilter === 'All' || order.payment_status === paymentStatusFilter;
    const locationMatch = locationFilter === 'All' || order.location === locationFilter;
    const paymentMethodMatch = paymentMethodFilter === 'All' || order.payment_method === paymentMethodFilter;
    
    const totalAmountMatch = (() => {
      switch (totalAmountFilter) {
        case 'Under $150':
          return order.total < 150;
        case '$150 - $200':
          return order.total >= 150 && order.total <= 200;
        case 'Over $200':
          return order.total > 200;
        default:
          return true;
      }
    })();

    const dateMatch = (() => {
      if (!dateFromFilter && !dateToFilter) return true;
      const orderDate = new Date(order.created_at);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;
      
      if (fromDate && toDate) {
        return orderDate >= fromDate && orderDate <= toDate;
      } else if (fromDate) {
        return orderDate >= fromDate;
      } else if (toDate) {
        return orderDate <= toDate;
      }
      return true;
    })();

    return statusMatch && paymentStatusMatch && locationMatch && paymentMethodMatch && totalAmountMatch && dateMatch;
  });

  const handleTrackOrder = () => {
    const order = ordersData.find(o => o.id.toLowerCase() === trackingOrderId.toLowerCase());
    setTrackedOrder(order);
  };

  const uniqueLocations = [...new Set(ordersData.map(order => order.location))];
  const uniquePaymentMethods = [...new Set(ordersData.map(order => order.payment_method))];

  if (currentView === 'create') {
    return (
      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create New Order</h1>
            <button 
              style={styles.backButton}
              onClick={() => setCurrentView('orders')}
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>
          </div>


{/* salespersons information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Package size= {20}/>
              Salesperson Information
            </h2>
            <div style={styles.formGrid}>
              <div style = {styles.formGroup}>
                <label style={styles.label}> Salesperson name *</label>
                <input
                type="text"
                style={styles.input}
                value = {salesperson}
                onChange={(e)=>  setSalesperson(e.target.value)}
                placeholder='Enter Salesperson Name'
                />
              </div>
            </div>
          </div>
          {/* Customer Information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Package size={20} />
              Customer Information
            </h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer ID *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={customerInfo.userID}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, userID: e.target.value}))}
                  placeholder="Enter customer ID"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={customerInfo.customerName}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, customerName: e.target.value}))}
                  placeholder="Enter customer name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  style={styles.input}
                  value={customerInfo.location}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, location: e.target.value}))}
                  placeholder="Enter location"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Method</label>
                <select
                  style={styles.select}
                  value={customerInfo.paymentMethod}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, paymentMethod: e.target.value}))}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Scanning */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Scan size={20} />
              Scan Products
            </h2>
            <div style={styles.scanContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Barcode</label>
                <input
                  type="text"
                  style={styles.input}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or enter barcode"
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
                />
              </div>
              <button
                style={styles.scanButton}
                onClick={() => setScanMode(!scanMode)}
              >
                <Scan size={16} />
                {scanMode ? 'Stop Scan' : 'Start Scan'}
              </button>
              <button
                style={{...styles.scanButton, backgroundColor: '#2563eb'}}
                onClick={handleBarcodeSubmit}
              >
                Add Product
              </button>
            </div>
            {scanMode && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '0.5rem',
                border: '2px dashed #3b82f6',
                textAlign: 'center',
                color: '#1d4ed8'
              }}>
                📷 Camera scanning mode active - Point camera at barcode
              </div>
            )}
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <ShoppingCart size={20} />
                Selected Products ({selectedProducts.length})
              </h2>
              {selectedProducts.map(product => (
                <div key={product.id} style={styles.productCard}>
                  <div style={styles.productHeader}>
                    <div>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        ID: {product.id} | Stock: {product.stock}
                      </div>
                    </div>
                    <div style={styles.productPrice}>Subtotal: ${(product.price * product.quantity).toFixed(2)}</div>
                  </div>
                  <div style={styles.quantityControls}>
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(product.id, product.quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      style={styles.quantityInput}
                      value={product.quantity}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                      min="1"
                      max={product.stock}
                    />
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(product.id, product.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                    <span style={{marginLeft: '1rem', color: '#6b7280', fontSize: '0.875rem'}}>
                      <div>Product price: ${product.price}</div>
                    </span>
                    <button
                      style={styles.removeButton}
                      onClick={() => removeProduct(product.id)}
                    >
                      
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div style={styles.orderSummary}>
                <div style={styles.summaryRow}>
                  <span>Items:</span>
                  <span>{selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>

              <button
                style={styles.createOrderButton}
                onClick={handleCreateOrder}
              >
                <CheckCircle size={20} />
                Create Order
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Orders Page View
  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Orders</h1>
           {/* {setInvoice===true && orderchoose!=='' && <Invoice order={orderchoose} />} */}
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <div style={styles.filtersContainer}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={styles.filterButton}
              >
                <Filter size={16} color="white"/>
                Filters
                <ChevronDown 
                  size={16} 
                  style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
                />
              </button>

              {showFilters && (
                <div style={styles.filterDropdown}>
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>
                      <Calendar size={14} />
                      Date From
                    </label>
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>
                      <Calendar size={14} />
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Order Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={styles.select}
                    >
                      <option value="All">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Payment Status</label>
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      style={styles.select}
                    >
                      <option value="All">All Payment Status</option>
                      <option value="Success">Success</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>
                      <DollarSign size={14} />
                      Total Amount
                    </label>
                    <select
                      value={totalAmountFilter}
                      onChange={(e) => setTotalAmountFilter(e.target.value)}
                      style={styles.select}
                    >
                      <option value="All">All Amounts</option>
                      <option value="Under ₹1500">Under ₹1500</option>
                      <option value="₹1500 - ₹2000">₹1500 - ₹2000</option>
                      <option value="Over ₹2000">Over ₹2000</option>
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>
                      <MapPin size={14} />
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      style={styles.select}
                    >
                      <option value="All">All Locations</option>
                      {uniqueLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>
                      <CreditCard size={14} />
                      Payment Method
                    </label>
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      style={styles.select}
                    >
                      <option value="All">All Methods</option>
                      {uniquePaymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              style={styles.createButton}
              onClick={() => setCurrentView('create')}
            >
              <Plus size={16} color="white" />
              Create Order
            </button>
          </div>
        </div>
        {loading === true ? <p> Loading data</p> : 
        <div style={styles.tableContainer}>
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead style={{backgroundColor: '#FDFDFD'}}>
                <tr>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer ID</th>
                  <th style={styles.th}>Customer Name</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Order Status</th>
                  <th style={styles.th}>Payment Status</th>
                  <th style={styles.th}>Payment Method</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Check Invoice</th>
                  <th style={styles.th}>Billed By</th>
                </tr>
              </thead>
              <tbody style={{backgroundColor: '#FDFDFD'}}>
                {filteredOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    style={{
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = '#FDFDFD'}
                  >
                    <td style={styles.td}>
                      <span style={{fontWeight: '600', color: 'black'}}>{order.orderID}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: 'black', fontWeight: '300'}}>{order.userID}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: 'black', fontWeight: '300'}}>{order.customer_name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{fontWeight: '600', color: 'black'}}>₹{order.amount}</span>
                    </td>
                    <td style={styles.td}>
                      <span 
                        style={{
                          ...styles.statusBadge,
                          ...getStatusColor(order.order_status)
                        }}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span 
                        style={{
                          ...styles.statusBadge,
                          ...getPaymentStatusColor(order.payment_status)
                        }}
                      >
                        {getPaymentStatusIcon(order.payment_status)}
                        {order.payment_status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: '#2c2c2c', fontWeight: '300'}}>{order.payment_method}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: 'black', fontWeight: '300'}}>noor</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: '#2c2c2c', fontWeight: '300'}}>{order.created_at}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: '#2c2c2c', fontWeight: '300'}} onClick={()=> {setInvoice(true);setOrderChoose(order.orderID) }}><FileInput style={{color: '#2c2c2c', fontWeight: '300',alignContent: 'center',cursor: 'pointer'}}/></span>
                    </td>
                    <td style = {styles.td}>
                      <span style= {{ color:'#2c2c2c', fontWeight: '300'}}> salesperson</span> 
                    </td>
                  </tr>
                          
                ))}
              </tbody>
            </table>
          </div>
        </div>
        }

        <div style={styles.section}>
          <h2 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'black'}}>
            Track Order
          </h2>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem'}}>
            <input
              type="text"
              placeholder="Enter Order ID (e.g., #1001)"
              value={trackingOrderId}
              onChange={(e) => setTrackingOrderId(e.target.value)}
              style={{
                ...styles.input,
                flex: '1',
                maxWidth: '300px'
              }}
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
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Search size={16} />
              Track Order
            </button>
          </div>

          {trackedOrder && (
            <div style={{
              marginTop: '1rem',
              fontSize: '1rem',
              padding: '1rem',
              border: '0.01rem solid #a2a2a2',
              borderRadius: '1rem',
              backgroundColor: '#f9fafb'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'black', fontSize: '1rem' }}>
                Order Tracking for {trackedOrder.id}
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '1rem' 
              }}>
                <div>Customer: {trackedOrder.customer}</div>
                <div><strong>Order Date:</strong> {trackedOrder.date}</div>
                <div><strong>Current Status:</strong> 
                  <span 
                    style={{
                      ...styles.statusBadge,
                      ...getStatusColor(trackedOrder.status),
                      marginLeft: '0.5rem'
                    }}
                  >
                    {trackedOrder.status}
                  </span>
                </div>
                <div><strong>Destination:</strong> {trackedOrder.location}</div>
              </div>
              
              <h4 style={{ margin: '1rem 0 0.5rem 0', color: 'black' }}>Tracking Timeline</h4>
              <div style={{
                marginTop: '1rem',
                paddingLeft: '1rem',
                borderLeft: '2px solid #e5e7eb'
              }}>
                {trackedOrder.tracking.map((step, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    paddingBottom: index === trackedOrder.tracking.length - 1 ? '0' : '1rem'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.25rem',
                      top: '0',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: index === trackedOrder.tracking.length - 1 ? '#3b82f6' : '#10b981'
                    }}></div>
                    <div style={{paddingLeft: '0.5rem'}}>
                      <div><strong>{step.location}</strong></div>
                      <div>{step.date} - {step.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
     {invoice && orderchoose && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Close button */}
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
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.5rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
            
            {/* Invoice component */}
            <Invoice order={orderchoose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCreationCRM;