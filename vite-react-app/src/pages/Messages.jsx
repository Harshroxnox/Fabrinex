import React, { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  Calendar, 
  Filter, 
  Plus, 
  Mail, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  Send,
  X,
  Check,
  Clock,
  FileText
} from 'lucide-react';

const MessagingSection = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'Email',
    category: 'Promotions',
    subject: '',
    content: '',
    variables: ['customerName', 'orderTotal']
  });

  const templates = [
    {
      id: 1,
      name: 'Welcome New Customers',
      type: 'Email',
      category: 'Welcome',
      status: 'Active',
      lastUpdated: '2023-08-15',
      subject: 'Welcome to Our Store!',
      content: 'Hello {{customerName}}, welcome to our amazing store...',
      sentCount: 1250
    },
    {
      id: 2,
      name: 'Order Confirmation',
      type: 'SMS',
      category: 'Order Updates',
      status: 'Active',
      lastUpdated: '2023-08-10',
      subject: '',
      content: 'Your order {{orderId}} has been confirmed. Total: ${{orderTotal}}',
      sentCount: 3420
    },
    {
      id: 3,
      name: 'Promotional Offer',
      type: 'Email',
      category: 'Promotions',
      status: 'Draft',
      lastUpdated: '2023-08-05',
      subject: '50% Off Everything!',
      content: 'Hey {{customerName}}, get 50% off on all items...',
      sentCount: 0
    },
    {
      id: 4,
      name: 'Abandoned Cart Reminder',
      type: 'Email',
      category: 'Abandoned Cart',
      status: 'Active',
      lastUpdated: '2023-07-28',
      subject: 'Don\'t forget your items!',
      content: 'Hi {{customerName}}, you left items worth ${{cartTotal}} in your cart...',
      sentCount: 890
    },
    {
      id: 5,
      name: 'New Product Launch',
      type: 'Email',
      category: 'Promotions',
      status: 'Draft',
      lastUpdated: '2023-07-20',
      subject: 'Exciting New Product Launch!',
      content: 'Dear {{customerName}}, we\'re excited to announce our new product...',
      sentCount: 0
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Draft':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Paused':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <Check size={14} />;
      case 'Draft':
        return <Edit3 size={14} />;
      case 'Paused':
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Email':
        return <Mail size={14} />;
      case 'SMS':
        return <MessageSquare size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const statusMatch = statusFilter === 'All' || template.status === statusFilter;
    const typeMatch = typeFilter === 'All' || template.type === typeFilter;
    const categoryMatch = categoryFilter === 'All' || template.category === categoryFilter;
    const searchMatch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       template.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const dateMatch = (() => {
      if (!dateFromFilter && !dateToFilter) return true;
      const templateDate = new Date(template.lastUpdated);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;
      
      if (fromDate && toDate) {
        return templateDate >= fromDate && templateDate <= toDate;
      } else if (fromDate) {
        return templateDate >= fromDate;
      } else if (toDate) {
        return templateDate <= toDate;
      }
      return true;
    })();

    return statusMatch && typeMatch && categoryMatch && searchMatch && dateMatch;
  });

  const uniqueCategories = [...new Set(templates.map(template => template.category))];

  const handleCreateTemplate = () => {
    console.log('Creating template:', templateForm);
    setShowCreateTemplate(false);
    setTemplateForm({
      name: '',
      type: 'Email',
      category: 'Promotions',
      subject: '',
      content: '',
      variables: ['customerName', 'orderTotal']
    });
  };

  const styles = {
    container: {
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      border: '0.01rem solid black',
      borderRadius: '2rem',
      width: '84vw',
      overflow: 'hidden'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      paddingRight: '3.5rem',
      gap: '1rem',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '32px 24px',
      overflow: 'hidden'
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
    headerActions: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    searchContainer: {
      position: 'relative',
      minWidth: '300px'
    },
    searchInput: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      fontSize: '1rem',
      fontWeight: '300',
      color: '#2c2c2c',
      outline: 'none',
      width: '100%'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '65%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    filtersContainer: {
      position: 'relative',
    },
    filterButton: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '2rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    createButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '2rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    filterDropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      padding: '1rem',
      minWidth: '640px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 1000,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    filterLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    selectWrapper: {
      position: 'relative'
    },
    select: {
      appearance: 'none',
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#2c2c2c',
      cursor: 'pointer',
      outline: 'none',
      width: '100%',
      paddingRight: '2rem'
    },
    dateInput: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#2c2c2c',
      outline: 'none',
      width: '100%'
    },
    selectIcon: {
      position: 'absolute',
      right: '12px',
      top: '65%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: '#9ca3af'
    },
    tableContainer: {
      border: '0.01rem solid #a2a2a2',
      padding: '2rem',
      borderRadius: '2rem',
      backgroundColor: '#FDFDFD',
      overflow: 'hidden',
      marginBottom: '2rem'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    table: {
      borderCollapse: 'separate',
      borderSpacing: '0',
      borderRadius: '0.8rem',
      fontSize: '1rem',
      width: '100%',
      minWidth: '900px'
    },
    tableHeader: {
      backgroundColor: '#FDFDFD'
    },
    th: {
      fontWeight: '500',
      padding: '0.75rem 1rem',
      textAlign: 'left',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
    },
    tbody: {
      backgroundColor: '#FDFDFD'
    },
    tr: {
      transition: 'background-color 0.2s'
    },
    td: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
    },
    lastRowTd: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
    },
    templateName: {
      fontWeight: '600',
      color: 'black'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    typeBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: '#e0f2fe',
      color: '#0369a1'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      transition: 'background-color 0.2s'
    },
    editButton: {
      color: '#3b82f6'
    },
    deleteButton: {
      color: '#ef4444'
    },
    sendButton: {
      color: '#10b981'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: '#FDFDFD',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      border: '0.01rem solid #a2a2a2'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'black',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      color: '#6b7280'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.25rem'
    },
    input: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      fontWeight: '300',
      color: '#2c2c2c',
      outline: 'none',
      width: '100%'
    },
    textarea: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      fontWeight: '300',
      color: '#2c2c2c',
      outline: 'none',
      width: '100%',
      minHeight: '120px',
      resize: 'vertical'
    },
    modalFooter: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '2rem'
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    saveButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    variablesHint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Templates</h1>
          <div style={styles.headerActions}>
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search templates"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.filtersContainer}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={styles.filterButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
              >
                <Filter size={16} style={{color:
                "white"}} color='white'/>
                Filters
                <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} color='white' />
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
                      style={styles.dateInput}
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
                      style={styles.dateInput}
                    />
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Status</label>
                    <div style={styles.selectWrapper}>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={styles.select}
                      >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Paused">Paused</option>
                      </select>
                      <ChevronDown style={styles.selectIcon} size={16} />
                    </div>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Type</label>
                    <div style={styles.selectWrapper}>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={styles.select}
                      >
                        <option value="All">All Types</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                      </select>
                      <ChevronDown style={styles.selectIcon} size={16} />
                    </div>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Category</label>
                    <div style={styles.selectWrapper}>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={styles.select}
                      >
                        <option value="All">All Categories</option>
                        {uniqueCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <ChevronDown style={styles.selectIcon} size={16} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowCreateTemplate(true)}
              style={styles.createButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              <Plus size={16} />
              Create Template
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Last Updated</th>
                  <th style={styles.th}>Sent Count</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody style={styles.tbody}>
                {filteredTemplates.map((template, index) => (
                  <tr 
                    key={template.id} 
                    style={styles.tr}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FDFDFD'}
                  >
                    <td style={index === filteredTemplates.length - 1 ? styles.lastRowTd : styles.td}>
                      <span style={styles.templateName}>{template.name}</span>
                    </td>
                    <td style={index === filteredTemplates.length - 1 ? styles.lastRowTd : styles.td}>
                      <span style={styles.typeBadge}>
                        {getTypeIcon(template.type)}
                        {template.type}
                      </span>
                    </td>
                    <td style={index === filteredTemplates.length - 1 ? styles.lastRowTd : styles.td}>
                      {template.category}
                    </td>
                    <td style={index === filteredTemplates.length - 1 ? styles.lastRowTd : styles.td}>
                      <span 
                        style={{
                          ...styles.statusBadge,
                          ...getStatusColor(template.status)
                        }}
                      >
                        {getStatusIcon(template.status)}
                        {template.status}
                      </span>
                    </td>
                    <td style={index === filteredTemplates.length - 1 ? styles.lastRowTd : styles.td}>
                      {template.lastUpdated}
                    </td>
                    <td style={index === filteredTemplates.length - 1 ? styles.lastRowTd : styles.td}>
                      {template.sentCount.toLocaleString()}
                    </td>
                    <td style={index === filteredTemplates.length - 1 ? styles.lastRowTd : styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionButton, ...styles.editButton}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Edit template"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          style={{...styles.actionButton, ...styles.sendButton}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Send template"
                        >
                          <Send size={14} />
                        </button>
                        <button 
                          style={{...styles.actionButton, ...styles.deleteButton}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Delete template"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Template Modal */}
        {showCreateTemplate && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Create Template</h2>
                <button 
                  onClick={() => setShowCreateTemplate(false)}
                  style={styles.closeButton}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Template Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  placeholder="Enter template name"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <div style={styles.selectWrapper}>
                  <select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({...templateForm, type: e.target.value})}
                    style={styles.select}
                  >
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                  <ChevronDown style={styles.selectIcon} size={16} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <div style={styles.selectWrapper}>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    style={styles.select}
                  >
                    <option value="Promotions">Promotions</option>
                    <option value="Welcome">Welcome</option>
                    <option value="Order Updates">Order Updates</option>
                    <option value="Abandoned Cart">Abandoned Cart</option>
                  </select>
                  <ChevronDown style={styles.selectIcon} size={16} />
                </div>
              </div>

              {templateForm.type === 'Email' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Subject</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                    placeholder="Enter email subject"
                    style={styles.input}
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Content</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                  placeholder="Enter your message content..."
                  style={styles.textarea}
                />
                {/* <div style={styles.variablesHint}>
                  Available variables: {{`{{customerName}}`}}, {{`{{orderTotal}}`}}, {{`{{orderId}}`}}, {{`{{cartTotal}}`}}
                </div> */}
              </div>

              <div style={styles.modalFooter}>
                <button 
                  onClick={() => setShowCreateTemplate(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTemplate}
                  style={styles.saveButton}
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSection;