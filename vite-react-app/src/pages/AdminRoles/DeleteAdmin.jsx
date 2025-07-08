import React, { useContext } from 'react';
import './DeleteAdmin.css';
import { LoginContext } from '../../contexts/LoginContext';

const DeleteAdmin = ({ admin, onClose, onConfirm }) => {
  const {deleteAdmin}= useContext(LoginContext);
  const handleConfirm = () => {
    deleteAdmin(admin.adminID);
    onConfirm(admin.adminID);
  };

  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <h5>Delete Admin</h5>
        <p>Are you sure you want to delete admin <strong>{admin.email}</strong>?</p>
        <p>This action cannot be undone.</p>
        
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-delete-btn" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAdmin;