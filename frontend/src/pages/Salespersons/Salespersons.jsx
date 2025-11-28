import React, { useEffect, useState, useCallback } from "react";
import "./Salespersons.css";
import {
  deleteSalesPersons,
  getAllSalesPersons,
  updateCommission,
  addSalesPerson,
} from "../../contexts/api/salespersons";
import { Trash, Search, Plus } from "lucide-react";
import SalespersonOrders from "./SalespersonOrders";
import toast from "react-hot-toast";

const Salespersons = () => {
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refresh,setRefresh] = useState(false);
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Form states
  const [newSalesperson, setNewSalesperson] = useState({
    name: "",
    commission: "",
    phone_number: "",
  });
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [newCommission, setNewCommission] = useState("");

  // Fetch salespersons
  const fetchSalespersons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllSalesPersons();
      setSalespersons(res.data.salesPersons || []);
    } catch (error) {
      toast.error("Error fetching salespersons");
      // console.error("Error fetching s/alespersons:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch salespersons on mount
  useEffect(() => {
    fetchSalespersons();
  }, [fetchSalespersons]);

  // Add salesperson
  const handleAdd = async () => {
    if (!newSalesperson.name || !newSalesperson.commission || !newSalesperson.phone_number) {
      toast.error("Please fill all fields.");
      return;
    }
    newSalesperson.phone_number = '+91' + newSalesperson.phone_number;
    try {
      const res = await addSalesPerson(newSalesperson);
      // Refresh the list after adding
      fetchSalespersons();
      setNewSalesperson({ name: "", commission: "", phone_number: "" });
      setIsAddDialogOpen(false);
      toast.success(res.data.message || 'New Salesperson added!');
      setRefresh(!refresh);
    } catch (error) {
      toast.error(error || 'Error while adding new salesperson');
    }
  };

  // Delete salesperson
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salesperson?")) return;

    try {
      await deleteSalesPersons(id);
      // Refresh the list after deleting
      fetchSalespersons();
      toast.success('Salesperson Deleted!');
    } catch (error) {
      toast.error('Error while deleting salesperson');
    }
  };

  // Update commission
  const handleUpdateCommission = async () => {
    if (!selectedSalesperson) return;
    
    try {
      await updateCommission(selectedSalesperson.salesPersonID, {
        commission: newCommission,
      });
      // Refresh the list after updating
      setIsUpdateDialogOpen(false);
      fetchSalespersons();
      setSelectedSalesperson(null);
      setNewCommission("");
      toast.success('Commission updated');
    } catch (error) {
      // console.error("Error updating commission:", error);
      toast.error('Error while updating commission'); 
    }
  };

  // Filter salespersons by name
  const filteredSalespersons = salespersons.filter((sp) =>
    sp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="salesperson-container no-scrollbar">
      <div className="salespersons-header">
        <h5 style={{fontSize:'35px'}}>Salespersons</h5>
        <button className="add-salesperson-btn" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={18} color="white" />
          Add Salesperson
        </button>
      </div>
      
      <div className="salesperson-search-div">
        <div className="search-input-wrapper">
          {/* <Search size={18} className="search-icon" /> */}
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="salesperson-search-input"
          />
        </div>
        <div className="salesperson-search-text">
          Search
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading salespersons...</div>
      ) : (
        <div className="salesperson-table-container no-scrollbar">
          <table className="salesperson-list">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Commission (%)</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalespersons.map((sp, index) => (
                <tr key={sp.salesPersonID} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                  <td>{sp.salesPersonID} </td>
                  <td>{sp.name}</td>
                  <td>{sp.commission}</td>
                  <td>{sp.phone_number}</td>
                  <td className="actions-cell">
                    <button
                      className="salesperson-edit-btn"
                      onClick={() => {
                        setSelectedSalesperson(sp);
                        setNewCommission(sp.commission);
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      Update Commission
                    </button>
                    <button
                      className="salesperson-delete-btn"
                      onClick={() => handleDelete(sp.salesPersonID)}
                    >
                      <Trash size={15} color="white"/>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSalespersons.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-results">No salespersons found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <SalespersonOrders refresh={refresh}/>

      {/* Add Salesperson Dialog */}
      {isAddDialogOpen && (
        <div className="salesperson-dialog-overlay">
          <div className="salesperson-dialog-content">
            <h6>Add New Salesperson</h6>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter name"
                value={newSalesperson.name}
                onChange={(e) =>
                  setNewSalesperson({ ...newSalesperson, name: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>Commission (%)</label>
              <input
                type="number"
                placeholder="Enter commission percentage"
                value={newSalesperson.commission}
                onChange={(e) =>
                  setNewSalesperson({ ...newSalesperson, commission: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>Phone Number(+91)</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={newSalesperson.phone_number}
                onChange={(e) =>
                  setNewSalesperson({ ...newSalesperson, phone_number: e.target.value })
                }
              />
            </div>
            <div className="salesperson-dialog-actions">
              <button className="salesperson-cancel-btn" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </button>
              <button className="salesperson-save-btn" onClick={handleAdd}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Commission Dialog */}
      {isUpdateDialogOpen && selectedSalesperson && (
        <div className="salesperson-dialog-overlay">
          <div className="salesperson-dialog-content">
            <h6>Update Commission for {selectedSalesperson.name}</h6>
            <div className="input-group">
              <label>New Commission (%)</label>
              <input
                type="number"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
              />
            </div>
            <div className="salesperson-dialog-actions">
              <button
                className="salesperson-cancel-btn"
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Cancel
              </button>
              <button className="salesperson-save-btn" onClick={handleUpdateCommission}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salespersons;