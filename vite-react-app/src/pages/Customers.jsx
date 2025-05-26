import React, { useState } from 'react';
import { Search, Plus, ChevronDown, Edit, Mail, MessageCircle, Phone, Download, X, Check, XCircle } from 'lucide-react';
import CustomerProfile from './CustomerProfile';
import { customerData } from '../constants/customerData';
const CustomersPage = () => {
  const [purchaseHistoryFilter, setPurchaseHistoryFilter] = useState('All History');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [totalSpentFilter, setTotalSpentFilter] = useState('All Amounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showBulkActions, setShowBulkActions] = useState(false);

  const purchaseHistoryOptions = ['All History', 'Last 30 days', 'Last 3 months', 'Last 6 months', 'Last year'];
  const locationOptions = ['All Locations', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const totalSpentOptions = ['All Amounts', '$0 - $100', '$100 - $500', '$500 - $1000', '$1000+'];

  const [customersData, setCustomersData] = useState(customerData);

  const handleAddCustomer = () => {
    alert('Add customer functionality would be implemented here');
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer.customerId);
    setEditForm({...customer});
  };

  const handleSaveEdit = () => {
    setCustomersData(prevData => 
      prevData.map(customer => 
        customer.customerId === editingCustomer ? editForm : customer
      )
    );
    setEditingCustomer(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditForm({});
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.customerId));
    }
  };

  const handleBulkWhatsApp = () => {
    const selectedNames = customersData
      .filter(c => selectedCustomers.includes(c.customerId))
      .map(c => c.name)
      .join(', ');
    alert(`WhatsApp message would be sent to: ${selectedNames}`);
  };

  const handleBulkEmail = () => {
    const selectedNames = customersData
      .filter(c => selectedCustomers.includes(c.customerId))
      .map(c => c.name)
      .join(', ');
    alert(`Email would be sent to: ${selectedNames}`);
  };

  const handleBulkSMS = () => {
    const selectedNames = customersData
      .filter(c => selectedCustomers.includes(c.customerId))
      .map(c => c.name)
      .join(', ');
    alert(`SMS would be sent to: ${selectedNames}`);
  };

  const handleDownloadSheet = () => {
    const headers = ['Name', 'Phone Number', 'WhatsApp Number', 'Email', 'Total Orders', 'Customer ID', 'Joined Date', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.phone,
        customer.whatsapp,
        customer.email,
        customer.orders,
        customer.customerId,
        customer.joinedDate,
        customer.location
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'customers.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredCustomers = customersData.filter(customer => {
    const searchMatch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const locationMatch = locationFilter === 'All Locations' || customer.location === locationFilter;
    
    let spentMatch = true;
    if (totalSpentFilter !== 'All Amounts') {
      const spent = parseInt(customer.totalSpent.replace('$', ''));
      switch (totalSpentFilter) {
        case '$0 - $100':
          spentMatch = spent >= 0 && spent <= 100;
          break;
        case '$100 - $500':
          spentMatch = spent > 100 && spent <= 500;
          break;
        case '$500 - $1000':
          spentMatch = spent > 500 && spent <= 1000;
          break;
        case '$1000+':
          spentMatch = spent > 1000;
          break;
      }
    }
    
    return searchMatch && locationMatch && spentMatch;
  });

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      border: '0.01rem solid black',
      borderRadius: '2rem',
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      paddingRight: '3.5rem',
      gap: '1rem',
      maxWidth: '86vw',
      margin: '0 auto',
      padding: '32px 24px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'
    },
    title: {
      fontSize: '2rem',
      textDecoration: 'none',
      fontWeight: '600',
      margin: 0,
      color: 'black'
    },
    headerButtons: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    addButton: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '300',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    downloadButton: {
      backgroundColor: '#059669',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '300',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    searchContainer: {
      marginBottom: '24px'
    },
    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '1rem',
      maxWidth: '400px'
    },
    searchInput: {
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '1rem',
      fontWeight: '300',
      color: '#2c2c2c',
      width: '100%',
      marginLeft: '8px'
    },
    filtersContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px'
    },
    selectWrapper: {
      position: 'relative'
    },
    select: {
      appearance: 'none',
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: '300',
      color: '#2c2c2c',
      cursor: 'pointer',
      outline: 'none',
      width: 'fit-content',
      paddingRight: '1.5rem',
    },
    selectIcon: {
      position: 'absolute',
      left: 'calc(100% - 24px)',
      top: '65%',
      alignItems: 'center',
      transform: 'translateY(-60%)',
      pointerEvents: 'none',
      color: '#9ca3af'
    },
    bulkActions: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '1rem 2rem',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    bulkButton: {
      backgroundColor: '#6366f1',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.9rem',
      fontWeight: '300',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    tableContainer: {
      border: '0.01rem solid #a2a2a2',
      padding: '2rem',
      borderRadius: '2rem',
      backgroundColor: '#FDFDFD',
      overflow: 'hidden'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    table: {
      borderCollapse: 'separate',
      borderSpacing: '0',
    //   border: '0.1rem solid #a2a2a2',
      borderRadius: '0.8rem',
      fontSize: '1rem',
      width: '100%'
    },
    tableHeader: {
      backgroundColor: '#FDFDFD'
    },
    th: {
      fontWeight: '500',
      padding: '0.6rem 1.5rem',
      textAlign: 'left',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '1rem'
    },
    thCheckbox: {
      fontWeight: '500',
      padding: '0.6rem 1rem',
      textAlign: 'center',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '1rem',
      width: '50px'
    },
    tbody: {
      backgroundColor: '#FDFDFD'
    },
    tr: {
      transition: 'background-color 0.2s'
    },
    td: {
      padding: '0.6rem 1.5rem',
      textAlign: 'left',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '1rem'
    },
    tdCheckbox: {
      padding: '0.6rem 1rem',
      textAlign: 'center',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '1rem'
    },
    lastRowTd: {
      padding: '0.6rem 1.5rem',
      textAlign: 'left',
    //   border: 'none',
      fontSize: '1rem'
    },
    lastRowTdCheckbox: {
      padding: '0.6rem 1rem',
      textAlign: 'center',
    //   border: 'none',
      fontSize: '1rem'
    },
    customerName: {
      fontWeight: '600',
      color: 'black',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    email: {
      color: '#2c2c2c',
      fontWeight: '300'
    },
    phone: {
      color: '#2c2c2c',
      fontWeight: '300'
    },
    orders: {
      color: 'black',
      fontWeight: '300'
    },
    totalSpent: {
      fontWeight: '600',
      color: 'black'
    },
    customerId: {
      color: '#2c2c2c',
      fontWeight: '300'
    },
    joinedDate: {
      color: '#2c2c2c',
      fontWeight: '300'
    },
    editInput: {
      backgroundColor: '#f9f9f9',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '1.2rem',
      width: '100%'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    editButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#6366f1',
      padding: '4px'
    },
    saveButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#059669',
      padding: '4px'
    },
    cancelButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#dc2626',
      padding: '4px'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    },
    noResults: {
      textAlign: 'center',
      padding: '2rem',
      color: '#6b7280',
      fontSize: '1rem'
    }
  };
  const [selectedCtoView, setSelectedCtoView] = useState(null);
  const [showProfile, setShowProfile] = useState(false);  

  return (
    <div style={styles.container}>
      {showProfile ? (
        <div>
          <XCircle style={{position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer'}} onClick={() => setShowProfile(false)}/>
          <CustomerProfile/>
          </div>
        ) : (
             <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Customers</h1>
          <div style={styles.headerButtons}>
            <button 
              style={styles.downloadButton}
              onClick={handleDownloadSheet}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              <Download size={16} />
              Download Sheet
            </button>
            <button 
              style={styles.addButton}
              onClick={handleAddCustomer}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
            >
              <Plus size={16} />
              Add Customer
            </button>
          </div>
        </div>

        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <Search size={16} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.filtersContainer}>
          <div style={styles.selectWrapper}>
            <select
              value={purchaseHistoryFilter}
              onChange={(e) => setPurchaseHistoryFilter(e.target.value)}
              style={styles.select}
            >
              {purchaseHistoryOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'All History' ? 'Purchase History' : option}
                </option>
              ))}
            </select>
            <ChevronDown style={styles.selectIcon} size={16} />
          </div>
          
          <div style={styles.selectWrapper}>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={styles.select}
            >
              {locationOptions.map(location => (
                <option key={location} value={location}>
                  {location === 'All Locations' ? 'Location' : location}
                </option>
              ))}
            </select>
            <ChevronDown style={styles.selectIcon} size={16} />
          </div>

          <div style={styles.selectWrapper}>
            <select
              value={totalSpentFilter}
              onChange={(e) => setTotalSpentFilter(e.target.value)}
              style={styles.select}
            >
              {totalSpentOptions.map(amount => (
                <option key={amount} value={amount}>
                  {amount === 'All Amounts' ? 'Total Spent' : amount}
                </option>
              ))}
            </select>
            <ChevronDown style={styles.selectIcon} size={16} />
          </div>
        </div>

        {selectedCustomers.length > 0 && (
          <div style={styles.bulkActions}>
            <span style={{fontSize: '1rem', color: '#2c2c2c'}}>
              {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected:
            </span>
            <button 
              style={styles.bulkButton}
              onClick={handleBulkWhatsApp}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
            <button 
              style={styles.bulkButton}
              onClick={handleBulkEmail}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <Mail size={14} />
              Email
            </button>
            <button 
              style={styles.bulkButton}
              onClick={handleBulkSMS}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <Phone size={14} />
              SMS
            </button>
          </div>
        )}

        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.thCheckbox}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>WhatsApp</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Orders</th>
                  <th style={styles.th}>Customer ID</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody style={styles.tbody}>
                {filteredCustomers.map((customer, index) => (
                  <tr 
                    key={customer.customerId} 
                    style={styles.tr}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FDFDFD'}
                  >
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTdCheckbox : styles.tdCheckbox}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={selectedCustomers.includes(customer.customerId)}
                        onChange={() => handleSelectCustomer(customer.customerId)}
                      />
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          style={styles.editInput}
                        />
                      ) : (
                        <span 
                          style={styles.customerName}
                          onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
                          onMouseOut={(e) => e.target.style.color = 'black'}
                          onClick={()=>{setShowProfile(true)}}
                        >
                          {customer.name}
                        </span>
                      )}
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          style={styles.editInput}
                        />
                      ) : (
                        <span style={styles.phone}>{customer.phone}</span>
                      )}
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="text"
                          value={editForm.whatsapp}
                          onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                          style={styles.editInput}
                        />
                      ) : (
                        <span style={styles.phone}>{customer.whatsapp}</span>
                      )}
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          style={styles.editInput}
                        />
                      ) : (
                        <span style={styles.email}>{customer.email}</span>
                      )}
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <span style={styles.totalSpent}>{customer.orders}</span>
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <span style={styles.customerId}>{customer.customerId}</span>
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <span style={styles.joinedDate}>{customer.joinedDate}</span>
                    </td>
                    <td style={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <div style={styles.actionButtons}>
                        {editingCustomer === customer.customerId ? (
                          <>
                            <button 
                              style={styles.saveButton}
                              onClick={handleSaveEdit}
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              style={styles.cancelButton}
                              onClick={handleCancelEdit}
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button 
                            style={styles.editButton}
                            onClick={() => handleEditCustomer(customer)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div style={styles.noResults}>
              No customers found matching your search criteria.
            </div>
          )}
        </div>
      </div>
        )}
    </div>
  );
};

export default CustomersPage;