import React, { useState } from 'react';
import { Edit3, Mail, Phone, MapPin, Tag, XCircle } from 'lucide-react';
import styles from './CustomerProfile.module.css';

const CustomerProfile = ({ customer, onClose }) => {
  const [notes, setNotes] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return styles.statusCompleted;
      case 'Shipped': return styles.statusShipped;
      case 'Cancelled': return styles.statusCancelled;
      case 'Resolved': return styles.statusResolved;
      case 'Closed': return styles.statusClosed;
      case 'Open': return styles.statusOpen;
      default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.customerProfileContainer}>
      <div className={styles.customerProfileContent}>
        <XCircle
          style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer' }}
          onClick={onClose}
        />

        <div className={styles.profileHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Customer Profile</h1>
            <p className={styles.pageSubtitle}>View and manage customer details, orders, and interactions.</p>
          </div>
        </div>

        <div className={styles.profileGrid}>
          <div className={styles.profileLeftColumn}>
            <div className={styles.profileCard}>
              <div className={styles.customerHeader}>
                <div className={styles.customerAvatar}>
                  <img src={customer.avatar || 'https://via.placeholder.com/150'} alt={customer.name} />
                </div>
                <div className={styles.customerBasicInfo}>
                  <h2 className={styles.customerName}>{customer.name}</h2>
                  <p className={styles.customerSince}>Joined: {customer.joinedDate}</p>
                  <p className={styles.customerId}>ID: {customer.customerId}</p>
                </div>
                <button className={styles.editProfileBtn}>
                  <Edit3 size={16} /> Edit Profile
                </button>
              </div>
            </div>

            <div className={styles.profileCard}>
              <h3 className={styles.sectionTitle}>Contact Information</h3>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}><Mail size={16} /> Email</div>
                  <div className={styles.contactValue}>{customer.email}</div>
                </div>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}><Phone size={16} /> Phone</div>
                  <div className={styles.contactValue}>{customer.phone}</div>
                </div>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}><MapPin size={16} /> Location</div>
                  <div className={styles.contactValue}>{customer.location}</div>
                </div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <h3 className={styles.sectionTitle}>Order History</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.profileTable}>
                  <thead>
                    <tr><th>Order ID</th><th>Date</th><th>Status</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {customer.orderHistory?.map((order, index) => (
                      <tr
                        key={order.id}
                        className={index === customer.orderHistory.length - 1 ? styles.lastRow : ''}
                      >
                        <td>{order.id}</td>
                        <td>{order.date}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.profileCard}>
              <h3 className={styles.sectionTitle}>Support Interactions</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.profileTable}>
                  <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
                  <tbody>
                    {customer.supportInteractions?.map((interaction, index) => (
                      <tr
                        key={index}
                        className={index === customer.supportInteractions.length - 1 ? styles.lastRow : ''}
                      >
                        <td>{interaction.date}</td>
                        <td>{interaction.subject}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusColor(interaction.status)}`}>
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

          <div className={styles.profileRightColumn}>
            <div className={styles.profileCard}>
              <h3 className={styles.sectionTitle}>Customer Summary</h3>
              <div className={styles.summaryStats}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Total Spending</div>
                  <div className={styles.statValue}>{customer.totalSpent}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Orders</div>
                  <div className={styles.statValue}>{customer.orders}</div>
                </div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <h3 className={styles.sectionTitle}>Notes</h3>
              <textarea
                className={styles.notesTextarea}
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {customer.tags && (
              <div className={styles.profileCard}>
                <h3 className={styles.sectionTitle}>Tags</h3>
                <div className={styles.tagsContainer}>
                  {customer.tags.map((tag, index) => (
                    <span key={index} className={styles.customerTag}>
                      <Tag size={12} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
