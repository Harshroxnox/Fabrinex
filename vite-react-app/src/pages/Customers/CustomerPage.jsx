import React, { useState, useEffect, useContext } from 'react';
import './CustomerPage.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { LoginContext } from '../../contexts/LoginContext';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name: { sort: 'none' },
    email: { sort: 'none' },
    order_count: { sort: 'none' },
    created_at: { sort: 'none' }
  });
  const [notificationMethod, setNotificationMethod] = useState('email');

  const {getAllUsers}= useContext(LoginContext);
  // Sample data - in a real app, you would fetch this from your API
  useEffect(() => {
    const fetchData= async ()=>{
      const sampleData =await  getAllUsers();
      setCustomers(sampleData);
      setFilteredCustomers(sampleData);
    };
    fetchData();
    
  }, [getAllUsers]);

  // Apply search and filters whenever they change
  useEffect(() => {
    let result = [...customers];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone_number.includes(term) ||
        customer.whatsapp_number.includes(term)
      );
    }
    
    // Apply sorting
    Object.entries(filters).forEach(([key, value]) => {
      if (value.sort === 'asc') {
        result.sort((a, b) => {
          if (a[key] < b[key]) return -1;
          if (a[key] > b[key]) return 1;
          return 0;
        });
      } else if (value.sort === 'desc') {
        result.sort((a, b) => {
          if (a[key] > b[key]) return -1;
          if (a[key] < b[key]) return 1;
          return 0;
        });
      }
    });
    
    setFilteredCustomers(result);
  }, [customers, searchTerm, filters]);

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.userID));
    }
    setSelectAll(!selectAll);
  };

  const handleSort = (column) => {
    setFilters(prev => {
      const currentSort = prev[column].sort;
      let nextSort;
      if (currentSort === 'none') nextSort = 'asc';
      else if (currentSort === 'asc') nextSort = 'desc';
      else nextSort = 'none';
      
      return {
        ...prev,
        [column]: { sort: nextSort }
      };
    });
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCustomers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'customers.xlsx');
  };

  const sendPromotions = () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer');
      return;
    }
    
    const selected = customers.filter(c => selectedCustomers.includes(c.userID));
    alert(`Preparing to send ${notificationMethod} promotions to: ${selected.map(c => c.name).join(', ')}`);
    // In a real app, you would call your API here
  };

  const getSortIcon = (column) => {
    switch (filters[column].sort) {
      case 'asc': return '↑';
      case 'desc': return '↓';
      default: return '↕';
    }
  };

  return (
    <div className="customer-page">
      <h5>Customer Management</h5>
      
      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="action-buttons">
          <button onClick={downloadExcel} className="download-btn">
            Download as Excel
          </button>
        </div>
      </div>
      
      <div className="notification-controls">
        <div className="selection-info">
          {selectedCustomers.length} customer(s) selected
        </div>
        
        <div className="notification-method">
          <label>
            <input
              type="radio"
              name="notificationMethod"
              value="email"
              checked={notificationMethod === 'email'}
              onChange={() => setNotificationMethod('email')}
            />
            Email
          </label>
          <label>
            <input
              type="radio"
              name="notificationMethod"
              value="sms"
              checked={notificationMethod === 'sms'}
              onChange={() => setNotificationMethod('sms')}
            />
            SMS
          </label>
          <label>
            <input
              type="radio"
              name="notificationMethod"
              value="whatsapp"
              checked={notificationMethod === 'whatsapp'}
              onChange={() => setNotificationMethod('whatsapp')}
            />
            WhatsApp
          </label>
          
          <button onClick={sendPromotions} className="send-promo-btn">
            Send Promotions
          </button>
        </div>
      </div>
      
      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('name')}>
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('email')}>
                Email {getSortIcon('email')}
              </th>
              <th>Phone</th>
              <th>WhatsApp</th>
              <th onClick={() => handleSort('created_at')}>
                Joined {getSortIcon('created_at')}
              </th>
              <th onClick={() => handleSort('order_count')}>
                Orders {getSortIcon('order_count')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.userID}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.userID)}
                    onChange={() => handleSelectCustomer(customer.userID)}
                  />
                </td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone_number}</td>
                <td>{customer.whatsapp_number}</td>
                <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                <td>{customer.order_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerPage;