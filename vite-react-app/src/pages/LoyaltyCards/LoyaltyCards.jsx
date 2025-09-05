import React, { useEffect, useState, useCallback } from "react";
import { Trash, Search, Plus } from "lucide-react";
import "./LoyaltyCards.css";
import { createLoyaltyCards, deleteLoyaltyCards, getAllLoyaltyCards } from "../../contexts/api/loyaltyCards";
// Mock API functions (replace with your actual API calls)


const LoyaltyCards = () => {
  const [loyaltyCards, setLoyaltyCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLoyaltyCard, setNewLoyaltyCard] = useState({
    discount: ""
  });

  // Fetch loyalty cards
  const fetchLoyaltyCards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllLoyaltyCards();
      setLoyaltyCards(res.data.loyaltyCards || []);
    } catch (error) {
      console.error("Error fetching loyalty cards:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch loyalty cards on mount
  useEffect(() => {
    fetchLoyaltyCards();
  }, [fetchLoyaltyCards]);

  // Add loyalty card
  const handleAdd = async () => {
    if (!newLoyaltyCard.discount) {
      alert("Please enter a discount value.");
      return;
    }

    try {
      const res = await createLoyaltyCards(newLoyaltyCard);
      // Refresh the list after adding
      fetchLoyaltyCards();
      setNewLoyaltyCard({ discount: "" });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding loyalty card:", error);
    }
  };

  // Delete loyalty card
  const handleDelete = async (barcode) => {
    if (!window.confirm("Are you sure you want to delete this loyalty card?")) return;

    try {
      await deleteLoyaltyCards(barcode);
      // Refresh the list after deleting
      fetchLoyaltyCards();
    } catch (error) {
      console.error("Error deleting loyalty card:", error);
    }
  };

  // Filter loyalty cards by barcode
  const filteredLoyaltyCards = loyaltyCards.filter((card) =>
    card.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="loyalty-cards-container">
      <div className="loyalty-cards-header">
        <h5>Loyalty Cards</h5>
        <button 
          className="add-loyalty-card-btn"
          onClick={() => setIsAddDialogOpen(true)}
        >
          {/* <Plus size={18} color="white" /> */}
          Add Loyalty Card
        </button>
      </div>
      
      <div className="loyalty-cards-search-div">
        <div className="loyalty-card-search-input-wrapper">
          {/* <Search size={18} className="search-icon" /> */}
          <input
            type="text"
            placeholder="Search by barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="loyalty-cards-search-input"
          />
        </div>
        <div>
          <div className="loyalty-cards-search-text">Search</div>
        </div>

      </div>

      {loading ? (
        <div className="loading-state">Loading loyalty cards...</div>
      ) : (
        <div className="table-container">
          <table className="loyalty-cards-list">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Discount (%)</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoyaltyCards.map((card, index) => (
                <tr key={card.loyaltyCardID} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                  <td className="barcode-cell">{card.barcode}</td>
                  <td>{card.discount}%</td>
                  <td>{formatDate(card.created_At)}</td>
                  <td className="actions-cell">
                    <button
                      className="loyalty-card-delete-btn"
                      onClick={() => handleDelete(card.barcode)}
                    >
                      <Trash size={15} color="white"/>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLoyaltyCards.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-results">No loyalty cards found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Loyalty Card Dialog */}
      {isAddDialogOpen && (
        <div className="loyalty-card-dialog-overlay">
          <div className="loyalty-card-dialog-content">
            <h6>Add New Loyalty Card</h6>
            <div className="input-group">
              <label>Discount (%)</label>
              <input
                type="number"
                placeholder="Enter discount percentage"
                value={newLoyaltyCard.discount}
                onChange={(e) =>
                  setNewLoyaltyCard({ discount: e.target.value })
                }
              />
            </div>
            <div className="loyalty-card-dialog-actions">
              <button 
                className="loyalty-card-cancel-btn" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="loyalty-card-save-btn" 
                onClick={handleAdd}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCards;