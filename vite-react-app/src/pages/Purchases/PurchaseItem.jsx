import React, { useState, useEffect } from 'react';
import ItemsList from './ItemsList';
import './PurchaseItem.css';
import toast from 'react-hot-toast';
import { getPurchaseById } from '../../contexts/api/purchases';

const PurchaseItem = ({ purchase }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detailedPurchase, setDetailedPurchase] = useState(null);
    
    const fetchPurchaseDetails = async () => {
        if (!purchase.purchaseID) return;
        setLoading(true);
        try {
            const { data, error } = await getPurchaseById(purchase.purchaseID);
            if (error) {
                throw new Error(error);
            }
            setDetailedPurchase(data.data || {});
        } catch (err) {
            toast.error(`Failed to fetch purchase details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const toggleExpand = () => {
        const newExpandedState = !isExpanded;
        setIsExpanded(newExpandedState);
        if (newExpandedState && !detailedPurchase) {
            fetchPurchaseDetails();
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };
    
    const items = detailedPurchase?.items || [];
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return (
        <div className={`purchase-item-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="purchase-summary-header" onClick={toggleExpand}>
                <div className="info-section">
                    <span className="invoice-number">#{purchase.invoiceNumber || 'N/A'}</span>
                    <span className="seller-name">{purchase.sellerDetails?.name || 'Unknown Seller'}</span>
                </div>
                <div className="financial-section">
                    <span className="invoice-date">{formatDate(purchase.invoiceDate)}</span>
                    <span className="grand-total">₹{parseFloat(purchase.grandTotal || 0).toFixed(2)}</span>
                    <span className="expand-icon">{isExpanded ? '▼' : '►'}</span>
                </div>
            </div>
            
            {isExpanded && (
                <div className="purchase-details-section">
                    {loading ? (
                        <p className="loading-text">Loading Details...</p>
                    ) : items.length > 0 ? (
                        <>
                            <div className="purchase-totals">
                                <span>Total Unique Items: <strong>{totalItems}</strong></span>
                                <span>Total Quantity: <strong>{totalQuantity}</strong></span>
                            </div>
                            <ItemsList items={items} />
                        </>
                    ) : (
                        <p className="no-items-message">No items found for this purchase.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PurchaseItem;