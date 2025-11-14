import React, { useContext, useState } from 'react';
import './AddAdmin.css';
import { LoginContext } from '../../contexts/LoginContext';

const AddAdmin = ({ onClose, onSave }) => {
  const { register } = useContext(LoginContext);

  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['admin']
  });

  const availableRoles = [
    'superadmin',
    'admin',
    'web-editor',
    'inventory-manager',
    'marketing'
  ];

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setNewAdmin(prev => {
      if (checked) {
        return { ...prev, roles: [...prev.roles, value] };
      } else {
        return { ...prev, roles: prev.roles.filter(role => role !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    if(newAdmin.password!==newAdmin.confirmPassword){
      alert("Passwords do not match");
      setIsSubmitting(false);
      return ;
    }
    const adminToSave = {
      email: newAdmin.email,
      password: newAdmin.password,
      roles: newAdmin.roles
    };

    try {
      const result = await register(adminToSave);

      if (result?.error || result?.success === false) {
        setErrors({ api: result.message || 'Failed to create admin' });
        return;
      }

      onSave(adminToSave);
    } catch (err) {
      console.error('Register error:', err);
      setErrors({ api: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-admin-modal-overlay">
      <div className="add-admin-add-modal">
        <h5>Add New Admin</h5>

        <form onSubmit={handleSubmit}>
          {errors.api && (
            <div className="add-admin-error-message" style={{ marginBottom: '10px' }}>
              {errors.api}
            </div>
          )}

          <div className="add-admin-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={newAdmin.email}
              onChange={handleChange}
            />
          </div>

          <div className="add-admin-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={newAdmin.password}
              onChange={handleChange}
            />
          </div>

          <div className="add-admin-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={newAdmin.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="add-admin-form-group">
            <label>Roles</label>
            <div className="add-admin-roles-checkbox-group">
              {availableRoles.map(role => (
                <div key={role} className="add-admin-role-checkbox">
                  <input
                    type="checkbox"
                    id={`role-${role}`}
                    value={role}
                    checked={newAdmin.roles.includes(role)}
                    onChange={handleRoleChange}
                  />
                  <label htmlFor={`role-${role}`}>{role}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="add-admin-modal-actions">
            <button type="button" className="add-admin-cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="add-admin-save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
