import React, { useEffect, useState, useCallback } from "react";
import { FaTrashAlt, FaEye } from 'react-icons/fa';
import { deleteBill, getAllBills, uploadBill } from '../../contexts/api/bills';
import "./Bills.css";
import toast from "react-hot-toast";

const BillManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    wholesaler_name: "",
    bill_date: "",
    bill_pdf: null,
  });

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllBills();
      setBills(res.data.bills || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleAddBill = async () => {
    if (!newBill.wholesaler_name || !newBill.bill_date || !newBill.bill_pdf) {
      alert("Please fill out all fields and select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("wholesaler_name", newBill.wholesaler_name);
    formData.append("bill_date", newBill.bill_date);
    formData.append("bill-pdf", newBill.bill_pdf);

    try {
      await uploadBill(formData);
      fetchBills();
      setNewBill({ wholesaler_name: "", bill_date: "", bill_pdf: null });
      setIsAddDialogOpen(false);
      toast.success('New Bill added!');
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error('Failed to add bill. Please try again.');
    }
  };

  const handleDelete = async (billID) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      await deleteBill(billID);
      fetchBills();
      toast.success('Bill deleted successfully!');
    } catch (error) {
      toast.error('Error deleting bill');
    }
  };
  
  const handleView = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredBills = bills.filter((bill) =>
    bill.wholesaler_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bills-container">
      <div className="bills-header">
        <h5>Bills</h5>
        <button
          className="add-bill-btn"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Bill
        </button>
      </div>
      
      <div className="bills-search-div">
        <div className="bill-search-input-wrapper">
          <input
            type="text"
            placeholder="Search by wholesaler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bills-search-input"
          />
        </div>
        <div>
          <div className="bills-search-text">Search</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading bills...</div>
      ) : (
        <div className="bills-table-container">
          <table className="bills-list">
            <thead>
              <tr>
                <th>Wholesaler Name</th>
                <th>Bill Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
          
              {filteredBills.map((bill, index) => (
                <tr key={bill.billID} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                  <td>{bill.wholesaler_name}</td>
                  <td>{formatDate(bill.bill_date)}</td>
                  <td className="actions-cell">
                     <button
                      className="bill-action-btn view-btn"
                      onClick={() => handleView(bill.pdf_url)}
                      title="View Bill"
                    >
                      <FaEye size={15} color="white"/>
                    </button>
                    <button
                      className="bill-action-btn delete-btn"
                      onClick={() => handleDelete(bill.billID)}
                      title="Delete Bill"
                    >
                      <FaTrashAlt size={15} color="white"/>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan="3" className="no-results">No bills found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isAddDialogOpen && (
        <div className="bill-dialog-overlay">
          <div className="bill-dialog-content">
            <h6>Add New Bill</h6>
            <div className="input-group">
              <label>Wholesaler Name</label>
              <input
                type="text"
                placeholder="Enter wholesaler name"
                value={newBill.wholesaler_name}
                onChange={(e) =>
                  setNewBill({ ...newBill, wholesaler_name: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>Bill Date</label>
              <input
                type="date"
                value={newBill.bill_date}
                onChange={(e) =>
                  setNewBill({ ...newBill, bill_date: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>Bill PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setNewBill({ ...newBill, bill_pdf: e.target.files[0] })
                }
              />
            </div>
            <div className="bill-dialog-actions">
              <button 
                className="bill-cancel-btn" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="bill-save-btn" 
                onClick={handleAddBill}
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

export default BillManagement;