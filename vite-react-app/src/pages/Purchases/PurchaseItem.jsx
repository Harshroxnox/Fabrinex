import React, { useState, useEffect } from 'react';
import ItemsList from './ItemsList';
import './PurchaseItem.css'; 

import toast from 'react-hot-toast';
import { getPurchaseById } from '../../contexts/api/purchases';

const PurchaseItem = ({ purchase }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [purchaseData , setPurchaseData] = useState(purchase || {});
  const toggleExpand = () => setIsExpanded(!isExpanded);


  const fetchItems = async () => {
    if (!purchase.purchaseID) return;
    setLoading(true);
    try {
      const { data, error } = await getPurchaseById(purchase.purchaseID);
      if (error) {
        toast.error(`Error fetching purchase details: ${error}`);
        return;
      }

      setPurchaseData(data.data || {});
      setItems(data.data.items || []);
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && items.length === 0) {
      fetchItems();
    }
  }, [isExpanded, purchase.purchaseID]);

  const renderMetaData = () => {
    if (!purchase.metaData || typeof purchase.metaData !== 'object') {
      return 'No metadata';
    }
    return Object.entries(purchase.metaData).map(([key, val]) => (
      <div key={key}>
        <span>{key.replace(/_/g, ' ')}:</span>
        <span style={{ fontWeight: 'normal' }}> {val}</span>
      </div>
    ));
  };
  return (
    <div className={`purchase-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="purchase-header" onClick={toggleExpand}>
        <div className="purchase-info">
          <div className="purchase-name-row">
            <span className="purchase-category">
              {new Date(purchase.purchaseDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="purchase-name">
            {renderMetaData()}
          </div>
        </div>
        
        <div className="purchase-actions">
          <span className="expand-icon">
            {isExpanded ? '▼' : '►'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="purchase-items-section">
          {loading ? (
            <p>Loading items...</p>
          ) : items.length > 0 ? (
            <div>
            <div> Total Items : {purchaseData.totalItems}</div>
            <div> Total Quantity In Purchase : {purchaseData.totalQuantity}</div>
            <ItemsList items={items} />
            </div>
          ) : (
            <p className="no-items-message">No items found for this purchase.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseItem;