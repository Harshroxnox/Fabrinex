import React,{useEffect, useState } from 'react';
import PurchaseItem from './PurchaseItem';
import PurchaseFilters from './PurchaseFilters';
import AddPurchaseDialog from './AddPurchaseDialog';
import './PurchaseList.css';
import { getAllPurchases, searchPurchasesBySeller, searchPurchasesByDateRange } from '../../contexts/api/purchases';
import toast from 'react-hot-toast';

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({});
  const itemsPerPage = 10;

  const [searchQuery, setSearchQuery] = useState({ type: 'all', term: '', dateRange: { startDate: '', endDate: '' } });

  const roles = localStorage.getItem("role") || "";
  const canCreatePurchase = roles.includes("superadmin") || roles.includes("admin") || roles.includes("inventory-manager");

  const fetchPurchases = async () => {
    setLoading(true);
    let result;
    const params = { page: currentPage, limit: itemsPerPage };

    try {
      switch (searchQuery.type) {
        case 'seller':
          result = await searchPurchasesBySeller({ searchTerm: searchQuery.term, ...params });
          break;
        case 'dateRange':
          result = await searchPurchasesByDateRange({ ...searchQuery.dateRange, ...params });
          break;
        default:
          result = await getAllPurchases(params);
          break;
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // This is now much simpler because all API routes return the same data structure.
      if (result.data) {
        setPurchases(result.data.data || []);
        setPaginationInfo(result.data.pagination || {});
      }

    } catch (err) {
      toast.error(`Error fetching purchases: ${err.message}`);
      setPurchases([]);
      setPaginationInfo({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [currentPage, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery({ type: 'all', term: '', dateRange: { startDate: '', endDate: '' } });
    setCurrentPage(1);
  };

  const handleAddPurchase = () => {
    setIsAddDialogOpen(false);
    toast.success("Purchase added! Refreshing list...");
    fetchPurchases();
  };

  return (
    <div className="purchases-container">
      <div className="purchases-header">
        <h5>Purchases</h5>
        <div className='purchases-btn-group'>
          <button
            className="add-purchase-btn"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!canCreatePurchase}
          >
            Add New Purchase
          </button>
        </div>
      </div>

      <PurchaseFilters onSearch={handleSearch} onReset={handleReset} />

      {loading ? (
        <div className="loading-indicator">Loading purchases...</div>
      ) : (
        <div className="purchases-list">
          {purchases.length > 0 ? (
            purchases.map(purchase => (
              <PurchaseItem
                key={purchase.purchaseID}
                purchase={purchase}
                onUpdate={fetchPurchases}
              />
            ))
          ) : (
            <p className="no-purchases-message">No purchases found</p>
          )}
        </div>
      )}
      
      {paginationInfo && paginationInfo.totalPages >= 1 && (
        <div className="pagination-controls">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {paginationInfo.page} of {paginationInfo.totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === paginationInfo.totalPages}>
            Next
          </button>
        </div>
      )}

      <AddPurchaseDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddPurchase}
      />
    </div>
  );
};

export default PurchaseList;