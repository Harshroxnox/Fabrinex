import React, { useCallback,useEffect, useState } from 'react';
import { ChevronDown, Search, MapPin, Calendar, DollarSign, CreditCard, CheckCircle, XCircle, Clock, Filter, Plus, Scan, Minus, ShoppingCart, ArrowLeft, Package, X, FileInput, UserCheck2Icon } from 'lucide-react';
import Invoice from '../../components/Invoice/Invoice';
import { styles } from './Orders';
import { createOrderOffline, getAllOrders } from '../../contexts/api/orders';
import { paymentStatusColor, paymentStatusIcon, statusColor } from '../../utils/colorSelection.jsx';
import { getVariantBarcodeAdmin } from '../../contexts/api/products.js';
import { getDiscountByBarcode } from '../../contexts/api/loyaltyCards.js';
import { formatDate } from '../../utils/dateFormatter.js';
import axios from 'axios';

const OrderCreationCRM = () => {
  const [currentView, setCurrentView] = useState('orders'); // 'orders' or 'create'
  const [ordersData, setOrdersData] = useState([]);
  const [loading , setLoading] = useState(true);
  // Orders page filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [totalAmountFrom, setTotalAmountFrom] = useState("");
  const [totalAmountTo, setTotalAmountTo] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  
  const [locationFilter, setLocationFilter] = useState('All');

  const [trackingOrderId, setTrackingOrderId] = useState('');


  const [salesPersonIdFilter ,setSalesPersonIdFilter] = useState('');



  const [trackedOrder, setTrackedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Order creation states
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone_number: '',
    location: 'Noor Creations',
    payment_method: ''
  }); 
  const [product, setProduct] = useState({});
  const [items , setItems] = useState([]);
  const [salesPerson , setSalesperson] = useState("");

  //invoice states
  const [invoice, setInvoice] = useState(null);
  const [orderchoose,setOrderChoose]=useState(0);

  //loyaltycard states
  const [isOpen , setIsOpen] =useState(false);
  const [barcode , setBarcode] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [showDiscount , setShowDiscount] = useState(false);

  //pagination
  const [page,setPage] = useState(1); // current page
  const [limit,setLimit] = useState(10); //items per page
  const [totalPages , setTotalPages] = useState(1);

  //roles of the admin
  const roles = localStorage.getItem("role");
  const canCreateOrder = roles.includes("superadmin") || roles.includes("admin");
  const fetchOrders = useCallback(async (page,limit) => {
    try {
      setLoading(true);
      const res = await getAllOrders(page,limit);
      console.log(res);
      setOrdersData(res.orders || []);
      setTotalPages(Math.ceil(res.total/limit));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchOrders(page,limit)}, [ page,limit,fetchOrders]);


  //handle prev
  const handlePrev = () => {
    if(page > 1) setPage(page - 1);
  }
  //handle next button
  const handleNext = () => {
    if(page < totalPages) setPage(page + 1);
  }
  //get colors
  const getStatusColor =(status) => statusColor(status);
  const getPaymentStatusColor = (status) => paymentStatusColor(status);
  const getPaymentStatusIcon = (status) => paymentStatusIcon(status);

  // --- order total
  const getDiscount = useCallback(async (discountBarcode) => {
    try {
      setLoading(true);
      const res = await getDiscountByBarcode(discountBarcode);
      // setDiscount(res.data.discount);
      return res.data.discount;
    } catch (error) {
      console.log("Error fetching discount of loyalty card");
      return null;
    }
    finally{
      setLoading(false);
    }
  });

  const handleDiscountApply = async (barcode)=>{
    console.log(barcode);
    const LoyaltyCardDiscount = await getDiscount(barcode);
    setDiscount(LoyaltyCardDiscount);
    setShowDiscount(true);
    setIsOpen(false);
  }

  const calculateTotalAfterDiscount = (total, disc) => {
    return (disc * total)/100;
  }
  // -- order total


  const fetchVariantByBarcode = useCallback(async (barcode) => {
    try {
      setLoading(true);
      const res = await getVariantBarcodeAdmin(barcode);
      setProduct(res.data.variant);
      return res.data.variant;
    } catch (error) {
      console.log("Error fetching product by barcode");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Order creation functions
  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) return;
    const product = await fetchVariantByBarcode(barcodeInput);
    if (!product) return;
    setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
  };


  const updateQuantity = (variantID, newQuantity) => {
    const product = selectedProducts.find(p => p.variantID === variantID);
    if (newQuantity < 0) {
      return ;
    }
    if (newQuantity > product.stock) {
      alert(`Cannot exceed stock limit: ${product.stock}`);
      return;
    }
    setSelectedProducts(prev =>
      prev.map(p =>
        p.variantID === variantID ? { ...p, quantity: newQuantity } : p
      )
    );
  };


  

  const removeProduct = (variantId) => {
    console.log(selectedProducts);
    console.log(variantId);
    setSelectedProducts(prev => prev.filter(p => p.variantID !== variantId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => 
      total + (product.price * product.quantity), 0
    ).toFixed(2);
  };

const handleAdd = async (newOrder) => {
  try {
    await createOrderOffline(newOrder);
    return true;  // signal success
  } catch (error) {
    console.error("Error creating order:", error);
    return false; // signal failure
  }
};

const handleCreateOrder = async () => {
  if (selectedProducts.length === 0 || !customerInfo.payment_method) {
    alert('Please fill all customer information and add at least one product');
    return;
  }


  const newOrder = {

    payment_method: customerInfo.payment_method,
    items: selectedProducts.map(p => ({
      barcode: p.barcode,
      quantity: p.quantity,
    })),
    salesPersonID: salesPerson
  };

  if(customerInfo.phone && customerInfo.name){

    newOrder.name = customerInfo.name,
    newOrder.phone_number = '+91' + customerInfo.phone
  }
  if(barcode !== 0){
    newOrder.loyalty_barcode = barcode;
  }
  const success = await handleAdd(newOrder);

  if (success) {
    console.log(newOrder);
    setSelectedProducts([]);
    setCustomerInfo({
      phone: '',
      name: '',
      location: '',
      payment_method: '',
    });
    setBarcodeInput('');
    alert('Order created successfully!');
    setCurrentView('orders');
    fetchOrders(page,limit);
  } else {
    alert('Failed to create order. Please try again.');
  }
};


  // // Orders page functions
  // const filteredOrders = ordersData.filter(order => {
  //   const statusMatch = statusFilter === 'All' || order.status === statusFilter;
  //   const paymentStatusMatch = paymentStatusFilter === 'All' || order.payment_status === paymentStatusFilter;
  //   const locationMatch = locationFilter === 'All' || order.location === locationFilter;
  //   const paymentMethodMatch = paymentMethodFilter === 'All' || order.payment_method === paymentMethodFilter;
    
  //   const totalAmountMatch = (() => {
  //     switch (totalAmountFilter) {
  //       case 'Under $150':
  //         return order.total < 150;
  //       case '$150 - $200':
  //         return order.total >= 150 && order.total <= 200;
  //       case 'Over $200':
  //         return order.total > 200;
  //       default:
  //         return true;
  //     }
  //   })();

  //   const dateMatch = (() => {
  //     if (!dateFromFilter && !dateToFilter) return true;
  //     const orderDate = new Date(order.created_at);
  //     const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
  //     const toDate = dateToFilter ? new Date(dateToFilter) : null;
      
  //     if (fromDate && toDate) {
  //       return orderDate >= fromDate && orderDate <= toDate;
  //     } else if (fromDate) {
  //       return orderDate >= fromDate;
  //     } else if (toDate) {
  //       return orderDate <= toDate;
  //     }
  //     return true;
  //   })();

  //   return statusMatch && paymentStatusMatch && locationMatch && paymentMethodMatch && totalAmountMatch && dateMatch;
  // });

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
      const res = await axios.get("http://localhost:5000/api/v1/orders/filter", {params});
      setOrdersData(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching filtered orders:" ,err);
    }
  }
  useEffect( () => {
    fetchFilteredOrders();
  }, [statusFilter, paymentStatusFilter, paymentMethodFilter , totalAmountFrom , totalAmountTo ,dateFromFilter , dateToFilter]);

  const handleTrackOrder = () => {
    const order = ordersData.find(o => o.id.toLowerCase() === trackingOrderId.toLowerCase());
    setTrackedOrder(order);
  };

  const uniqueLocations = [...new Set(ordersData.map(order => order.location))];
  const uniquePaymentMethods = [...new Set(ordersData.map(order => order.payment_method))];

  const uniqueSalesPersons = ['Virat' , 'Louis Litt' , 'Rachel Zane' , 'Anurag'];
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


{/* salesPersons information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Package size= {20}/>
              Salesperson Information
            </h2>
            <div style={styles.formGrid}>
              <div style = {styles.formGroup}>
                <label style={styles.label}> Salesperson ID *</label>
                <input
                type="number"
                style={styles.input}
                value = {salesPerson}
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
                <label style={styles.label}>Customer Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter customer name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer Phone No. (+91)*</label>
                <input
                  type="text"
                  style={styles.input}
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
                  placeholder="Enter customer Phone No."
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
                  value={customerInfo.payment_method}
                  onChange={(e) => {
                    const value = e.target.value; 
                    setCustomerInfo(prev => ({ ...prev, payment_method: value })); 
                    console.log(value);
                  }}
                >
                  <option value="" disabled>Select Payment Method</option>
                  <option value="card">Card</option>
                  <option value="upi">Upi</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                  <option value="cash-on-delivery">Cash On Delivery</option>
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
                style={{...styles.scanButton, backgroundColor: '#2563eb'}}
                onClick={handleBarcodeSubmit}
              >
                Add Product
              </button>
            </div>
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <ShoppingCart size={20} />
                Selected Products ({selectedProducts.length})
              </h2>
              {selectedProducts.map(product => (
                <div key={product.productID} style={styles.productCard}>
                  <div style={styles.productHeader}>
                    <div>
                      <div style={styles.productName}>{product.product_name}({product.color}, {product.size})</div>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        ID: {product.variantID} | Stock: {product.stock}
                      </div>
                    </div>
                    <div style={styles.productPrice}>Subtotal: ₹{(product.price * product.quantity).toFixed(2)}</div>
                  </div>
                  <div style={styles.quantityControls}>
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(product.variantID, product.quantity - 1)}
                      disabled = {(product.quantity === 0)}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      style={styles.quantityInput}
                      value={product.quantity}
                      onChange={(e) => updateQuantity(product.variantID, parseInt(e.target.value) || 0)}
                      min="1"
                      max={product.stock}
                    />
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(product.variantID, product.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                    <span style={{marginLeft: '1rem', color: '#6b7280', fontSize: '0.875rem'}}>
                      <div>Product price: ₹{product.price}</div>
                    </span>
                    <button
                      style={styles.removeButton}
                      onClick={() => removeProduct(product.variantID)}
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
                  <span>₹{calculateTotal()}</span>
                </div>
                {showDiscount &&
                <div style={styles.summaryRow}>
                  <span> Loyalty Discount ( {discount} % ):</span>
                  <span>₹{calculateTotalAfterDiscount(calculateTotal(), discount)}</span>
                </div>
                }
                <div style={styles.totalRow}>
                  <span>Total Amount:</span>
                  <span>{calculateTotal() - calculateTotalAfterDiscount(calculateTotal(), discount)}</span>
                </div>
              </div>


              <div style={styles.LoyaltyButtonDiv}>
                <button style={styles.LoyaltyButton}
                        onClick={() => setIsOpen(true)}> 
                 Add Loyalty Card </button>
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
         {isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add loyalty Cards into order</h2>
            <input
              type="text"
              placeholder="Enter loyalty card barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.modalActions}>
              <button style={styles.cancelButton} onClick={() => {setIsOpen(false); setBarcode(0);}}>
                Cancel
              </button>
              <button
                style={styles.applyButton}
                onClick={() => handleDiscountApply(barcode)}
              >
                Apply
              </button>

            </div>
          </div>
        </div>
      )}
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
                      <option value="cancelled">Cancelled</option>
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
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                 {/* Total Amount From */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>
                    <DollarSign size={14} />
                    Amount From
                  </label>
                  <input
                    type="number"
                    value={totalAmountFrom}
                    onChange={(e) => setTotalAmountFrom(e.target.value)}
                    style={styles.input}
                    placeholder="Min Amount"
                  />
                </div>

                {/* Total Amount To */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>
                    <DollarSign size={14} />
                    Amount To
                  </label>
                  <input
                    type="number"
                    value={totalAmountTo}
                    onChange={(e) => setTotalAmountTo(e.target.value)}
                    style={styles.input}
                    placeholder="Max Amount"
                  />
                </div>


                  {/* <div style={styles.filterGroup}>
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
                  </div> */}

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
                      <option value="All">All Payment Method</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="netbanking">NetBanking</option>
                      <option value="wallet">Wallet</option>
                      <option value="cash-on-delivery">Cash On Delivery</option>
                    </select>
                  </div>
                  {/* <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>
                      <UserCheck2Icon size={14}/>
                      SalesPerson
                    </label>
                    {/* <select 
                    value = {salesPersonIdFilter}
                    onChange={(e)=> setSalesPersonIdFilter(e.target.value)}
                    style={styles.select}
                    >
                      <option value = "All" > All Salespersons</option>
                      {uniqueSalesPersons.map(method)}
                      <option key={method} value={method} ></option>
            
                    </select> */}
                    {/* </div> */}
                </div>
              )}
            </div>
            
            <button 
              style={{
                ...styles.createButton,
                ...(canCreateOrder ? {} : styles.disabledButton)
              }}
              onClick={() => setCurrentView('create')}
              disabled = {!canCreateOrder}
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
                  {/* <th style={styles.th}>Customer ID</th> */}
                  <th style={styles.th}>Customer Name</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Order Status</th>
                  <th style={styles.th}>Payment Status</th>
                  <th style={styles.th}>Payment Method</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Check Invoice</th>
                  {/* <th style={styles.th}>Billed By</th> */}
                </tr>
              </thead>
              <tbody style={{backgroundColor: '#FDFDFD'}}>
                {ordersData.map((order, index) => (
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
                    {/* <td style={styles.td}>
                      <span style={{color: 'black', fontWeight: '300'}}>{order.userID}</span>
                    </td> */}
                    <td style={styles.td}>
                      <span style={{color: 'black', fontWeight: '400',fontSize:'15px'}}>{order.customer_name}</span>
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
                      <span style={{color: 'black', fontWeight: '300'}}>{order.order_location}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: '#2c2c2c', fontWeight: '300'}}>{formatDate(order.created_at)}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{color: '#2c2c2c', fontWeight: '300'}} onClick={()=> {setInvoice(true);setOrderChoose(order.orderID);console.log(order.orderID) }}><FileInput style={{color: '#2c2c2c', fontWeight: '300',alignContent: 'center',cursor: 'pointer'}}/></span>
                    </td>
                    {/* <td style = {styles.td}>
                      <span style= {{ color:'#2c2c2c', fontWeight: '300'}}> salesPerson</span> 
                    </td> */}
                  </tr>
                          
                ))}
              </tbody>
            </table>
          </div>
        </div>
        }
            <div style={styles.PageDiv}>
              <button onClick={handlePrev} disabled={page ===1} style={styles.orderPreviousBtn}>
                Previous
              </button>
              <span style={styles.orderPageText}>
                Page {page} of {totalPages}
              </span>
              <button onClick={handleNext} disabled={page === totalPages} style={styles.orderNextBtn}>
                Next
              </button>
            </div>

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