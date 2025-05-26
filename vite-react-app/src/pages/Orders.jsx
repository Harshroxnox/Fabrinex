import React, { useState } from 'react';
import { ChevronDown, Search, MapPin, Calendar, DollarSign, CreditCard, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import Invoice from '../components/Invoice';
import { ordersData } from '../constants/ordersData';
import './Orders.css';

const OrdersPage = () => {
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Shipped':
        return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
      case 'Pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Failed':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'Pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'Success':
        return <CheckCircle size={14} />;
      case 'Failed':
        return <XCircle size={14} />;
      case 'Pending':
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  const filteredOrders = ordersData.filter(order => {
    const statusMatch = statusFilter === 'All' || order.status === statusFilter;
    const paymentStatusMatch = paymentStatusFilter === 'All' || order.paymentStatus === paymentStatusFilter;
    const locationMatch = locationFilter === 'All' || order.location === locationFilter;
    const paymentMethodMatch = paymentMethodFilter === 'All' || order.paymentMethod === paymentMethodFilter;
    
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
      const orderDate = new Date(order.date);
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

  const handleInvoiceClick = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const uniqueLocations = [...new Set(ordersData.map(order => order.location))];
  const uniquePaymentMethods = [...new Set(ordersData.map(order => order.paymentMethod))];

  return (
    <div className="container">
      {showInvoice ? (
        <div className="mainContent">
          <XCircle 
            onClick={() => setShowInvoice(false)} 
            size={24} 
            className="invoiceCloseIcon" 
          />
          <Invoice order={selectedOrder} />
        </div>
      ) : (
        <div className="mainContent">
          <div className="header">
            <h1 className="title">Orders</h1>
            <div className="filtersContainer">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="filterButton"
              >
                <Filter size={16} />
                Filters
                <ChevronDown 
                  size={16} 
                  style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
                />
              </button>

              {showFilters && (
                <div className="filterDropdown">
                  <div className="filterGroup">
                    <label className="filterLabel">
                      <Calendar size={14} />
                      Date From
                    </label>
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className="dateInput"
                    />
                  </div>

                  <div className="filterGroup">
                    <label className="filterLabel">
                      <Calendar size={14} />
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className="dateInput"
                    />
                  </div>

                  <div className="filterGroup">
                    <label className="filterLabel">Order Status</label>
                    <div className="selectWrapper">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="select"
                      >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                      <ChevronDown className="selectIcon" size={16} />
                    </div>
                  </div>

                  <div className="filterGroup">
                    <label className="filterLabel">Payment Status</label>
                    <div className="selectWrapper">
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="select"
                      >
                        <option value="All">All Payment Status</option>
                        <option value="Success">Success</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                      </select>
                      <ChevronDown className="selectIcon" size={16} />
                    </div>
                  </div>

                  <div className="filterGroup">
                    <label className="filterLabel">
                      <DollarSign size={14} />
                      Total Amount
                    </label>
                    <div className="selectWrapper">
                      <select
                        value={totalAmountFilter}
                        onChange={(e) => setTotalAmountFilter(e.target.value)}
                        className="select"
                      >
                        <option value="All">All Amounts</option>
                        <option value="Under $150">Under $150</option>
                        <option value="$150 - $200">$150 - $200</option>
                        <option value="Over $200">Over $200</option>
                      </select>
                      <ChevronDown className="selectIcon" size={16} />
                    </div>
                  </div>

                  <div className="filterGroup">
                    <label className="filterLabel">
                      <MapPin size={14} />
                      Location
                    </label>
                    <div className="selectWrapper">
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="select"
                      >
                        <option value="All">All Locations</option>
                        {uniqueLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                      <ChevronDown className="selectIcon" size={16} />
                    </div>
                  </div>

                  <div className="filterGroup">
                    <label className="filterLabel">
                      <CreditCard size={14} />
                      Payment Method
                    </label>
                    <div className="selectWrapper">
                      <select
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        className="select"
                      >
                        <option value="All">All Methods</option>
                        {uniquePaymentMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      <ChevronDown className="selectIcon" size={16} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tableContainer">
            <div className="tableWrapper">
              <table className="table">
                <thead className="tableHeader">
                  <tr>
                    <th className="th">Order ID</th>
                    <th className="th">Customer ID</th>
                    <th className="th">Total Amount</th>
                    <th className="th">Order Status</th>
                    <th className="th">Payment Status</th>
                    <th className="th">Payment Method</th>
                    <th className="th">Invoice</th>
                  </tr>
                </thead>
                <tbody className="tbody">
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className="tr"
                    >
                      <td className={index === filteredOrders.length - 1 ? "lastRowTd" : "td"}>
                        <span className="orderId">{order.id}</span>
                      </td>
                      <td className={index === filteredOrders.length - 1 ? "lastRowTd" : "td"}>
                        <span className="customerName">{order.customerId}</span>
                      </td>
                      <td className={index === filteredOrders.length - 1 ? "lastRowTd" : "td"}>
                        <span className="total">${order.total}</span>
                      </td>
                      <td className={index === filteredOrders.length - 1 ? "lastRowTd" : "td"}>
                        <span 
                          className="statusBadge"
                          style={getStatusColor(order.status)}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className={index === filteredOrders.length - 1 ? "lastRowTd" : "td"}>
                        <span 
                          className="statusBadge"
                          style={getPaymentStatusColor(order.paymentStatus)}
                        >
                          {getPaymentStatusIcon(order.paymentStatus)}
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className={index === filteredOrders.length - 1 ? "lastRowTd" : "td"}>
                        <span className="paymentInfo">{order.paymentMethod}</span>
                      </td>
                      <td className={index === filteredOrders.length - 1 ? "lastRowTd" : "td"}>
                        <a 
                          href="#" 
                          className="invoiceLink"
                          onClick={() => handleInvoiceClick(order)}
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="trackingContainer">
            <h2 className="trackingHeader">Track Order</h2>
            <div className="trackingInputContainer">
              <input
                type="text"
                placeholder="Enter Order ID (e.g., #1001)"
                value={trackingOrderId}
                onChange={(e) => setTrackingOrderId(e.target.value)}
                className="trackingInput"
              />
              <button 
                onClick={handleTrackOrder}
                className="trackButton"
              >
                <Search size={16} />
                Track Order
              </button>
            </div>

            {trackedOrder && (
              <div className="trackingResult">
                <p style={{ margin: '0 0 0.5rem 0', color: 'black', fontSize: '1rem' }}>Order Tracking for {trackedOrder.id}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>Customer: {trackedOrder.customer}</div>
                  <div><strong>Order Date:</strong> {trackedOrder.date}</div>
                  <div><strong>Current Status:</strong> 
                    <span 
                      className="statusBadge"
                      style={{
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
                <div className="trackingTimeline">
                  {trackedOrder.tracking.map((step, index) => (
                    <div key={index} className="trackingStep">
                      <div className={`trackingDot ${index === trackedOrder.tracking.length - 1 ? '' : 'completedDot'}`}></div>
                      <div className="trackingContent">
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
      )}
    </div>
  );
};

export default OrdersPage;