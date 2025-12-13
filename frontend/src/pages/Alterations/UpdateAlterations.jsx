import { useState } from "react";
import { updateAlterations } from "../../contexts/api/alterations";
import "./updateAlterationsModal.css";

export default function UpdateAlterationModal({ alteration, onClose, onSuccess }) {
  const [status, setStatus] = useState(alteration.status);
  const [payment, setPayment] = useState(alteration.payment_status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setError("");
    setLoading(true);
    
    try {
      await updateAlterations(alteration.alterationID, {
        status: status,
        payment_status: payment,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update alteration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ["Pending", "Ready", "Delivered"];
  const paymentOptions = ["Unpaid", "Paid"];

  return (
    <div className="update-alteration-modal-backdrop" onClick={onClose}>
      <div 
        className="update-alteration-modal-content" 
        onClick={e => e.stopPropagation()}
      >
        
        <h3 className="update-alteration-form-title">
          Update Alteration (Bill No: {alteration.bill_no || 'N/A'})
        </h3>

        {error && <p className="update-alteration-error-text">{error}</p>}

        <div className="update-alteration-select-group">
            <label htmlFor="update-alteration-status-select">Order Status</label>
            <select 
                id="update-alteration-status-select"
                className="update-alteration-select" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
            >
                {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>

        <div className="update-alteration-select-group">
            <label htmlFor="update-alteration-payment-select">Payment Status</label>
            <select 
                id="update-alteration-payment-select"
                className="update-alteration-select" 
                value={payment} 
                onChange={(e) => setPayment(e.target.value)}
                disabled={loading}
            >
                 {paymentOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>

        <div className="update-alteration-modal-actions">
            <button 
                className="update-alteration-cancel-btn" 
                onClick={onClose}
                type="button"
                disabled={loading}
            >
                Cancel
            </button>
            <button 
                className="update-alteration-update-btn" 
                onClick={handleUpdate}
                disabled={loading}
            >
                {loading ? "Updating..." : "Update"}
            </button>
        </div>
      </div>
    </div>
  );
}