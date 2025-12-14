import React, { useContext, useState } from 'react';
import './EditAdmin.css';
import { LoginContext } from '../../contexts/LoginContext';
import toast from 'react-hot-toast';

const EditAdmin = ({ admin, onClose, onSave }) => {
  const [editedAdmin, setEditedAdmin] = useState({ 
      ...admin,
      roles: Array.isArray(admin.roles) ? [...admin.roles] : [admin.role || 'Content Admin']
  });
  const { updateAdmin } = useContext(LoginContext);
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [availableRoles] = useState([
    'superadmin',
    'admin',
    'web-editor',
    'inventory-manager',
    'marketing'
  ]);

  const handleRoleChange = (role) => {
    setEditedAdmin(prev => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role) // Remove role
        : [...prev.roles, role]; // Add role
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Always validate roles
    if (editedAdmin.roles.length === 0) {
      alert('Please select at least one role');
      return;
    }

    const updatedFormData = {
      roles: editedAdmin.roles
    };

    // 2. Conditionally validate and add password
    // This block only runs if the user types in the password field
    if (password) {
      if (password !== confirmpassword) {
        alert('Passwords do not match');
        return;
      }
      // Add password to the form data only if it's provided
      updatedFormData.password = password;
    }

    console.log("Submitted form data:", updatedFormData);
    await updateAdmin(admin.adminID, updatedFormData);
    onSave(editedAdmin); 
    toast.success('Admin updated successfully');
    onClose(); // Close modal on successful save
  };

  return (
    <div className="edit-admin-modal-overlay">
      <div className="edit-admin-modal">
        <h5>Edit Admin</h5>
        <form onSubmit={handleSubmit}>
          <div className="edit-admin-form-group">
            <label>Admin ID</label>
            <input
              type="text"
              value={editedAdmin.adminID} 
              disabled
            />
          </div>
          <div className="edit-admin-form-group">
            <label>New Password (Optional)</label>
            <input
              type="password" 
              name="password"
              placeholder="Leave blank to keep current password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              // The 'required' attribute has been removed
            />
          </div>
          <div className='edit-admin-form-group'>
            <label>Confirm New Password</label>
            <input
              type="password" 
              name="confirmpassword"
              placeholder="Confirm new password"
              value={confirmpassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              // The 'required' attribute has been removed
            />
          </div>
          
          <div className="edit-admin-form-group">
            <label>Roles</label>
            <div className="edit-admin-roles-checkbox-group">
              {availableRoles.map(role => (
                <div key={role} className="edit-admin-role-checkbox">
                  <input
                    type="checkbox"
                    id={`role-${role}`}
                    checked={editedAdmin.roles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                  />
                  <label className='edit-admin-checkbox-labels' htmlFor={`role-${role}`}>{role}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="edit-admin-modal-actions">
            <button type="button" className="edit-admin-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="edit-admin-save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdmin;