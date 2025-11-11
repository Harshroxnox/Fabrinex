import React, { useCallback,useEffect, useState } from 'react';
import { ChevronDown, Search, MapPin, Calendar, DollarSign, CreditCard, CheckCircle, XCircle, Clock, Filter, Plus, Scan, Minus, ShoppingCart, ArrowLeft, Package, X, FileInput, UserCheck2Icon } from 'lucide-react';
import Invoice from '../../components/Invoice/Invoice';
import { styles } from './Orders';
import { createOrderOffline, filterOrder, getAllOrders } from '../../contexts/api/orders';
import { paymentStatusColor, paymentStatusIcon, statusColor } from '../../utils/colorSelection.jsx';
import { getVariantBarcodeAdmin } from '../../contexts/api/products.js';
import { getDiscountByBarcode } from '../../contexts/api/loyaltyCards.js';
import { formatDate } from '../../utils/dateFormatter.js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { OrderCreation } from './OrderCreation.jsx';

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
  


  //invoice states
  const [invoice, setInvoice] = useState(null);
  const [orderchoose,setOrderChoose]=useState(0);


  //pagination
  const [page,setPage] = useState(1); // current page
  const [limit,setLimit] = useState(10); //items per page
  const [totalPages , setTotalPages] = useState(1);

  //roles of the admin
  const roles = localStorage.getItem("role") || "";
  const canCreateOrder = roles.includes("superadmin") ;
  const fetchOrders = useCallback(async (page,limit) => {
    try {
      setLoading(true);
      const res = await getAllOrders(page,limit);
      setOrdersData(res.orders || []);
      setTotalPages(Math.ceil(res.total/limit));
    } catch (error) {
      toast.error("Error fetching orders:", error);
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









  



const handleAdd = async (newOrder) => {
  try {
    await createOrderOffline(newOrder);
    return true;  // signal success
  } catch (error) {
    toast.error("Error creating order:", error);
    return false; // signal failure
  }
};


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
      console.error("Error fetching filtered orders:", err);
      toast.error(`Error fetching filtered orders: ${err.message || "Unknown error"}`);
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

  if (currentView === 'create') {
    return (
      <OrderCreation
      setCurrentView={setCurrentView}
      handleAdd = {handleAdd}
      fetchOrders={fetchOrders}
      page= {page}
      limit={limit}
      />
    )
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
                    key={order.orderID} 
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