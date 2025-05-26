import React, { useState } from 'react';
import { ChevronDown, Plus, Edit, Trash2, Calendar, Percent, Tag, Filter, Save, X } from 'lucide-react';
import summerSale from '../assets/summerSale.jpg';
import welcomeSale from '../assets/welcomeSale.jpg';
import holidaySale from '../assets/holidaySale.jpg';
const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      code: 'SUMMER20',
      discount: 20,
      discountType: 'percentage',
      status: 'Active',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      description: 'Summer season discount for all products',
      usageLimit: 1000,
      usedCount: 156,
      promotionImage: summerSale
    },
    {
      id: 2,
      code: 'WELCOME10',
      discount: 10,
      discountType: 'percentage',
      status: 'Active',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      description: 'Welcome discount for new customers',
      usageLimit: 500,
      usedCount: 89,
    promotionImage: welcomeSale
    },
    {
      id: 3,
      code: 'HOLIDAY15',
      discount: 15,
      discountType: 'percentage',
      status: 'Inactive',
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      description: 'Holiday season special discount',
      usageLimit: 2000,
      usedCount: 0,
      promotionImage: holidaySale
    },
    {
      id: 4,
      code: 'BACKTOSCHOOL',
      discount: 25,
      discountType: 'percentage',
      status: 'Active',
      startDate: '2023-08-01',
      endDate: '2023-09-30',
      description: 'Back to school promotion',
      usageLimit: 750,
      usedCount: 234
    },
    {
      id: 5,
      code: 'SPRINGCLEAN',
      discount: 30,
      discountType: 'percentage',
      status: 'Inactive',
      startDate: '2023-03-01',
      endDate: '2023-04-30',
      description: 'Spring cleaning sale',
      usageLimit: 300,
      usedCount: 300
    }
  ]);

  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [discountFilter, setDiscountFilter] = useState('All');
  const [showNewPromotion, setShowNewPromotion] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  
    const [newPromotion, setNewPromotion] = useState({
    code: '',
    discount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    status: 'Active',
    description: '',
    image: null
    });


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
    headerButtons: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    newPromotionButton: {
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
    filterDropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      padding: '1rem',
      minWidth: '300px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
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
      color: '#374151'
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
      width: '100%'
    },
    livePromotionsContainer: {
      border: '0.01rem solid #a2a2a2',
      padding: '2rem',
      borderRadius: '2rem',
      backgroundColor: '#FDFDFD',
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: 'black'
    },
    promotionCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      backgroundColor: '#f9fafb',
      marginBottom: '1rem'
    },
    promotionInfo: {
      flex: 1
    },
    promotionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'black',
      marginBottom: '0.5rem'
    },
    promotionDescription: {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontWeight: '300'
    },
    promotionImage: {
      width: '120px',
      height: '80px',
      backgroundColor: '#e5e7eb',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '0.875rem'
    },
    tableContainer: {
      border: '0.01rem solid #a2a2a2',
      padding: '2rem',
      borderRadius: '2rem',
      backgroundColor: '#FDFDFD',
      overflow: 'hidden'
    },
    table: {
      borderCollapse: 'separate',
      borderSpacing: '0',
      borderRadius: '0.8rem',
      fontSize: '1rem',
      width: '100%'
    },
    th: {
      fontWeight: '500',
      padding: '0.75rem 1rem',
      textAlign: 'left',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
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
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    actionButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      transition: 'background-color 0.2s',
      marginRight: '0.5rem'
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
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      padding: '2rem',
      width: '90%',
      maxWidth: '600px',
      maxHeight: 'fit-content',
      overflowY: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'black',
      margin: 0
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '0.25rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    fullWidth: {
      gridColumn: '1 / -1'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
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
    textarea: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#2c2c2c',
      outline: 'none',
      width: '100%',
      minHeight: '80px',
      resize: 'vertical'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '1.5rem'
    },
    saveButton: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '2rem',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    cancelButton: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      padding: '0.75rem 1.5rem',
      borderRadius: '2rem',
      border: '0.01rem solid #a2a2a2',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Inactive':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    const statusMatch = statusFilter === 'All' || promotion.status === statusFilter;
    const discountMatch = (() => {
      switch (discountFilter) {
        case 'Under 15%':
          return promotion.discount < 15;
        case '15% - 25%':
          return promotion.discount >= 15 && promotion.discount <= 25;
        case 'Over 25%':
          return promotion.discount > 25;
        default:
          return true;
      }
    })();
    return statusMatch && discountMatch;
  });

  const livePromotions = promotions.filter(p => p.status === 'Active');

  const handleNewPromotion = () => {
    setNewPromotion({
      code: '',
      discount: '',
      discountType: 'percentage',
      status: 'Active',
      startDate: '',
      endDate: '',
      description: '',
      usageLimit: '',
      usedCount: 0
    });
    setShowNewPromotion(true);
  };

  const handleEditPromotion = (promotion) => {
    setNewPromotion(promotion);
    setEditingPromotion(promotion.id);
    setShowNewPromotion(true);
  };

  const handleSavePromotion = () => {
    if (editingPromotion) {
      setPromotions(promotions.map(p => 
        p.id === editingPromotion ? { ...newPromotion, id: editingPromotion } : p
      ));
    } else {
      const newId = Math.max(...promotions.map(p => p.id)) + 1;
      setPromotions([...promotions, { ...newPromotion, id: newId }]);
    }
    setShowNewPromotion(false);
    setEditingPromotion(null);
  };

  const handleDeletePromotion = (id) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  const togglePromotionStatus = (id) => {
    setPromotions(promotions.map(p => 
      p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
    ));
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Promotions</h1>
          <div style={styles.headerButtons}>
            <button 
              onClick={handleNewPromotion}
              style={styles.newPromotionButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
            >
              <Plus size={16} />
              New promotion
            </button>
            <div style={styles.filtersContainer}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={styles.filterButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
              >
                <Filter size={16} />
                Filters
                <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>

              {showFilters && (
                <div style={styles.filterDropdown}>
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={styles.select}
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Discount Range</label>
                    <select
                      value={discountFilter}
                      onChange={(e) => setDiscountFilter(e.target.value)}
                      style={styles.select}
                    >
                      <option value="All">All Discounts</option>
                      <option value="Under 15%">Under 15%</option>
                      <option value="15% - 25%">15% - 25%</option>
                      <option value="Over 25%">Over 25%</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.livePromotionsContainer}>
          <h2 style={styles.sectionTitle}>Live promotions</h2>
          {livePromotions.map(promotion => (
            <div key={promotion.id} style={styles.promotionCard}>
              <div style={styles.promotionInfo}>
                <div style={styles.promotionTitle}>{promotion.code}</div>
                <div style={styles.promotionDescription}>{promotion.description}</div>
              </div>
              <div style={styles.promotionImage}>
                <img src={promotion.promotionImage} alt={promotion.code} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.tableContainer}>
          <h2 style={styles.sectionTitle}>Promo codes</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Discount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Start Date</th>
                <th style={styles.th}>End Date</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.map((promotion, index) => (
                <tr key={promotion.id}>
                  <td style={index === filteredPromotions.length - 1 ? styles.lastRowTd : styles.td}>
                    <span style={{ fontWeight: '600', color: 'black' }}>{promotion.code}</span>
                  </td>
                  <td style={index === filteredPromotions.length - 1 ? styles.lastRowTd : styles.td}>
                    {promotion.discount}% off
                  </td>
                  <td style={index === filteredPromotions.length - 1 ? styles.lastRowTd : styles.td}>
                    <span 
                      style={{
                        ...styles.statusBadge,
                        ...getStatusColor(promotion.status),
                        cursor: 'pointer'
                      }}
                      onClick={() => togglePromotionStatus(promotion.id)}
                    >
                      {promotion.status}
                    </span>
                  </td>
                  <td style={index === filteredPromotions.length - 1 ? styles.lastRowTd : styles.td}>
                    {promotion.startDate}
                  </td>
                  <td style={index === filteredPromotions.length - 1 ? styles.lastRowTd : styles.td}>
                    {promotion.endDate}
                  </td>
                  <td style={index === filteredPromotions.length - 1 ? styles.lastRowTd : styles.td}>
                    {promotion.usedCount}/{promotion.usageLimit}
                  </td>
                  <td style={index === filteredPromotions.length - 1 ? styles.lastRowTd : styles.td}>
                    <button
                      onClick={() => handleEditPromotion(promotion)}
                      style={styles.actionButton}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Edit size={16} color="#6b7280" />
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promotion.id)}
                      style={styles.actionButton}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#fee2e2'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewPromotion && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingPromotion ? 'Edit Promotion' : 'New Promotion'}
              </h2>
              <button
                onClick={() => setShowNewPromotion(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Promo Code</label>
                <input
                  type="text"
                  value={newPromotion.code}
                  onChange={(e) => setNewPromotion({...newPromotion, code: e.target.value})}
                  style={styles.input}
                  placeholder="Enter promo code"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Discount (%)</label>
                <input
                  type="number"
                  value={newPromotion.discount}
                  onChange={(e) => setNewPromotion({...newPromotion, discount: parseInt(e.target.value) || ''})}
                  style={styles.input}
                  placeholder="Enter discount percentage"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  value={newPromotion.startDate}
                  onChange={(e) => setNewPromotion({...newPromotion, startDate: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  value={newPromotion.endDate}
                  onChange={(e) => setNewPromotion({...newPromotion, endDate: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Usage Limit</label>
                <input
                  type="number"
                  value={newPromotion.usageLimit}
                  onChange={(e) => setNewPromotion({...newPromotion, usageLimit: parseInt(e.target.value) || ''})}
                  style={styles.input}
                  placeholder="Enter usage limit"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={newPromotion.status}
                  onChange={(e) => setNewPromotion({...newPromotion, status: e.target.value})}
                  style={styles.select}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{...styles.formGroup, ...styles.fullWidth}}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                  style={styles.textarea}
                  placeholder="Enter promotion description"
                />
              </div>
            </div>
            <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
  <label style={styles.label}>Promotion Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setNewPromotion({ ...newPromotion, image: file });
      }
    }}
    style={styles.input}
  />
  {/* Optional image preview */}
  {newPromotion.image && typeof newPromotion.image === 'object' && (
    <img
      src={URL.createObjectURL(newPromotion.image)}
      alt="Promotion Preview"
      style={{ width: '150px', marginTop: '10px', borderRadius: '8px' }}
    />
  )}
</div>


            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowNewPromotion(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePromotion}
                style={styles.saveButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
              >
                <Save size={16} />
                {editingPromotion ? 'Update' : 'Create'} Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;