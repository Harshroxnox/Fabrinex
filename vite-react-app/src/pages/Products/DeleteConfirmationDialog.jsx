import React from 'react';
import './ProductsList.css';

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Confirm Deletion</h3>
        <p >Are you sure you want to delete "{itemName}"?</p>
        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;