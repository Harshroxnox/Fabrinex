import React, { useContext, useState } from 'react';
import './EditAdmin.css';
import { LoginContext } from '../../contexts/LoginContext';

const EditAdmin = ({ admin, onClose, onSave }) => {
  const [editedAdmin, setEditedAdmin] = useState({ 
      ...admin,
      roles: Array.isArray(admin.roles) ? [...admin.roles] : [admin.role || 'Content Admin']
  });
  const {updateAdmin}= useContext(LoginContext);
  const [password,setPassword]= useState('');
  const [confirmpassword,setConfirmPassword]= useState('');
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
        ? prev.roles.filter(r => r !== role) // Remove role if already selected
        : [...prev.roles, role]; // Add role if not selected
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if(editedAdmin.roles.length === 0){
    alert('Please select at least one role');
    return;
  }
  console.log(password);
  console.log(confirmpassword);
  if(password!==confirmpassword){
    alert('Passwords do not match');
    return;
  }
  const updatedFormData = {
    password,
    roles: editedAdmin.roles
  };
  console.log("Submitted form data:", updatedFormData);
  await updateAdmin(admin.adminID, updatedFormData);
  onSave(editedAdmin);//if you intend to submit editedAdmin separately
};
return(
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
            <label>Password</label>
            <input
              type="password" 
              name="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className='edit-admin-form-group'>
            <label>Confirm Password</label>
            <input
              type="password" 
              name="password"
              value={confirmpassword} 
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
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