import React, { useState } from 'react';
import { Search, Plus, ChevronDown, Edit, Mail, MessageCircle, Phone, Download, X, Check, XCircle } from 'lucide-react';
import CustomerProfile from '../CustomerProfile/CustomerProfile';
import { customerData } from '../../constants/customerData';
import styles from './Customers.module.css';

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
  // const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCtoView, setSelectedCtoView] = useState(null);
  const [showProfile, setShowProfile] = useState(false);  
  const handleCustomerClick = (customer) => {
    setSelectedCtoView(customer);
    setShowProfile(true);
  };

  return (
    <div className={styles.container}>
      
      {showProfile ? (
        <div>
          <XCircle style={{position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer'}} onClick={() => setShowProfile(false)}/>
          <CustomerProfile customer={selectedCtoView} onClose={() => setShowProfile(false)} />
          </div>
        ) : (
             <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Customers</h1>
          <div className={styles.headerButtons}>
            <button 
              className={styles.downloadButton}
              onClick={handleDownloadSheet}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              <Download size={16} />
              Download Sheet
            </button>
            <button 
              className={styles.addButton}
              onClick={handleAddCustomer}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
            >
              <Plus size={16} />
              Add Customer
            </button>
          </div>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search size={16} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.selectWrapper}>
            <select
              value={purchaseHistoryFilter}
              onChange={(e) => setPurchaseHistoryFilter(e.target.value)}
              className={styles.select}
            >
              {purchaseHistoryOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'All History' ? 'Purchase History' : option}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.selectIcon} size={16} />
          </div>

          <div className={styles.selectWrapper}>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={styles.select}
            >
              {locationOptions.map(location => (
                <option key={location} value={location}>
                  {location === 'All Locations' ? 'Location' : location}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.selectIcon} size={16} />
          </div>

          <div className={styles.selectWrapper}>
            <select
              value={totalSpentFilter}
              onChange={(e) => setTotalSpentFilter(e.target.value)}
              className={styles.select}
            >
              {totalSpentOptions.map(amount => (
                <option key={amount} value={amount}>
                  {amount === 'All Amounts' ? 'Total Spent' : amount}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.selectIcon} size={16} />
          </div>
        </div>

        {selectedCustomers.length > 0 && (
          <div className={styles.bulkActions}>
            <span className={styles.bulkActionsText}>
              {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected:
            </span>
            <button 
              className={styles.bulkButton}
              onClick={handleBulkWhatsApp}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
            <button 
              className={styles.bulkButton}
              onClick={handleBulkEmail}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <Mail size={14} />
              Email
            </button>
            <button 
              className={styles.bulkButton}
              onClick={handleBulkSMS}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <Phone size={14} />
              SMS
            </button>
          </div>
        )}

        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.thCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Phone</th>
                  <th className={styles.th}>WhatsApp</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Orders</th>
                  <th className={styles.th}>Customer ID</th>
                  <th className={styles.th}>Joined</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {filteredCustomers.map((customer, index) => (
                  <tr 
                    key={customer.customerId} 
                    className={styles.tr}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FDFDFD'}
                  >
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTdCheckbox : styles.tdCheckbox}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedCustomers.includes(customer.customerId)}
                        onChange={() => handleSelectCustomer(customer.customerId)}
                      />
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className={styles.editInput}
                        />
                      ) : (
                        <span 
                          className={styles.customerName}
                          onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
                          onMouseOut={(e) => e.target.style.color = 'black'}
                          onClick={()=>{setShowProfile(true);handleCustomerClick(customer)}}
                        >
                          {customer.name}
                        </span>
                      )}
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className={styles.editInput}
                        />
                      ) : (
                        <span className={styles.phone}>{customer.phone}</span>
                      )}
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="text"
                          value={editForm.whatsapp}
                          onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                          className={styles.editInput}
                        />
                      ) : (
                        <span className={styles.phone}>{customer.whatsapp}</span>
                      )}
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      {editingCustomer === customer.customerId ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className={styles.editInput}
                        />
                      ) : (
                        <span className={styles.email}>{customer.email}</span>
                      )}
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <span className={styles.totalSpent}>{customer.orders}</span>
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <span className={styles.customerId}>{customer.customerId}</span>
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <span className={styles.joinedDate}>{customer.joinedDate}</span>
                    </td>
                    <td className={index === filteredCustomers.length - 1 ? styles.lastRowTd : styles.td}>
                      <div className={styles.actionButtons}>
                        {editingCustomer === customer.customerId ? (
                          <>
                            <button 
                              className={styles.saveButton}
                              onClick={handleSaveEdit}
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className={styles.cancelButton}
                              onClick={handleCancelEdit}
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className={styles.editButton}
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
            <div className={styles.noResults}>
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