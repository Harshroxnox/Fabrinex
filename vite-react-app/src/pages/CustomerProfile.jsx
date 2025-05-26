import React, { useState } from 'react';
import { Edit3, Mail, Phone, MapPin, Tag } from 'lucide-react';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const [notes, setNotes] = useState('');
  
  const customerData = {
    name: "Sophia Bennett",
    joinDate: "Customer since 2022",
    customerId: "123456789",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    email: "sophia.bennett@email.com",
    phone: "+1-555-123-4567",
    address: "123 Maple Street, Anytown, USA",
    totalSpending: 545.00,
    totalOrders: 5,
    tags: ["VIP", "Loyal", "High Value"]
  };

  const orderHistory = [
    { id: "#1001", date: "2023-01-15", status: "Completed", total: 150.00 },
    { id: "#1002", date: "2023-03-20", status: "Shipped", total: 75.00 },
    { id: "#1003", date: "2023-05-10", status: "Completed", total: 200.00 },
    { id: "#1004", date: "2023-07-05", status: "Cancelled", total: 50.00 },
    { id: "#1005", date: "2023-09-12", status: "Completed", total: 120.00 }
  ];

  const supportInteractions = [
    { date: "2023-02-28", subject: "Issue with Order #1001", status: "Resolved" },
    { date: "2023-06-15", subject: "Product Inquiry", status: "Closed" },
    { date: "2023-08-22", subject: "Return Request", status: "Open" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Shipped':
        return 'status-shipped';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Resolved':
        return 'status-resolved';
      case 'Closed':
        return 'status-closed';
      case 'Open':
        return 'status-open';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="customer-profile-container">
      <div className="customer-profile-content">
        {/* Header */}
        <div className="profile-header">
          <div className="header-left">
            <h1 className="page-title">Customer Profile</h1>
            <p className="page-subtitle">View and manage customer details, orders, and interactions.</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="profile-grid">
          {/* Left Column */}
          <div className="profile-left-column">
            {/* Customer Info Card */}
            <div className="profile-card">
              <div className="customer-header">
                <div className="customer-avatar">
                  <img src={customerData.avatar} alt={customerData.name} />
                </div>
                <div className="customer-basic-info">
                  <h2 className="customer-name">{customerData.name}</h2>
                  <p className="customer-since">{customerData.joinDate}</p>
                  <p className="customer-id">ID: {customerData.customerId}</p>
                </div>
                <button className="edit-profile-btn">
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="profile-card">
              <h3 className="section-title">Contact Information</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-label">
                    <Mail size={16} />
                    Email
                  </div>
                  <div className="contact-value">{customerData.email}</div>
                </div>
                <div className="contact-item">
                  <div className="contact-label">
                    <Phone size={16} />
                    Phone
                  </div>
                  <div className="contact-value">{customerData.phone}</div>
                </div>
                <div className="contact-item">
                  <div className="contact-label">
                    <MapPin size={16} />
                    Address
                  </div>
                  <div className="contact-value">{customerData.address}</div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="profile-card">
              <h3 className="section-title">Order History</h3>
              <div className="table-wrapper">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((order, index) => (
                      <tr key={order.id} className={index === orderHistory.length - 1 ? 'last-row' : ''}>
                        <td className="order-id">{order.id}</td>
                        <td className="order-date">{order.date}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="order-total">${order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Support Interactions */}
            <div className="profile-card">
              <h3 className="section-title">Support Interactions</h3>
              <div className="table-wrapper">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportInteractions.map((interaction, index) => (
                      <tr key={index} className={index === supportInteractions.length - 1 ? 'last-row' : ''}>
                        <td className="interaction-date">{interaction.date}</td>
                        <td className="interaction-subject">{interaction.subject}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(interaction.status)}`}>
                            {interaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="profile-right-column">
            {/* Customer Summary */}
            <div className="profile-card">
              <h3 className="section-title">Customer Summary</h3>
              <div className="summary-stats">
                <div className="stat-item">
                  <div className="stat-label">Total Spending</div>
                  <div className="stat-value">${customerData.totalSpending.toFixed(2)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Orders</div>
                  <div className="stat-value">{customerData.totalOrders}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="profile-card">
              <h3 className="section-title">Notes</h3>
              <textarea
                className="notes-textarea"
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="profile-card">
              <h3 className="section-title">Tags</h3>
              <div className="tags-container">
                {customerData.tags.map((tag, index) => (
                  <span key={index} className="customer-tag">
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;