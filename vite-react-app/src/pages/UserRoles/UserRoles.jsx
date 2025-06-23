import React, { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const UserRolesPage = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'addUser' or 'addRole'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initial roles data
  const [roles] = useState([
    { id: 1, name: 'Super Admin', permissions: ['All'] },
    { id: 2, name: 'Admin', permissions: ['User Management', 'Content Management'] },
    { id: 3, name: 'Editor', permissions: ['Content Management'] },
    { id: 4, name: 'Viewer', permissions: ['Read Only'] }
  ]);

  // Initial users data
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '+1-555-0123', roleId: 1 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1-555-0124', roleId: 2 },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', phone: '+1-555-0125', roleId: 3 },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', phone: '+1-555-0126', roleId: 4 }
  ]);

  const [availableRoles, setAvailableRoles] = useState(roles);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', roleId: '' });
  const [newRole, setNewRole] = useState({ name: '', permissions: '' });

  // Get role name by ID
  const getRoleName = (roleId) => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoleName(user.roleId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new user
  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.phone && newUser.roleId) {
      const user = {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        roleId: parseInt(newUser.roleId)
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', phone: '', roleId: '' });
      setCurrentView('list');
    }
  };

  // Add new role
  const handleAddRole = () => {
    if (newRole.name && newRole.permissions) {
      const role = {
        id: Date.now(),
        name: newRole.name,
        permissions: newRole.permissions.split(',').map(p => p.trim())
      };
      setAvailableRoles([...availableRoles, role]);
      setNewRole({ name: '', permissions: '' });
      setCurrentView('list');
    }
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Delete role
  const handleDeleteRole = (roleId) => {
    const usersWithRole = users.filter(user => user.roleId === roleId);
    if (usersWithRole.length > 0) {
      alert(`Cannot delete role. ${usersWithRole.length} user(s) are assigned to this role.`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this role?')) {
      setAvailableRoles(availableRoles.filter(role => role.id !== roleId));
    }
  };

  const styles = `
    .roles-container {
      min-height: 100vh;
      background-color: #f9fafb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      border: 0.01rem solid black;
      border-radius: 2rem;
      box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
      width: 84vw;
    }

    .roles-main {
      display: flex;
      flex-direction: column;
      padding-right: 3.5rem;
      gap: 1rem;
      min-width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .roles-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .roles-title {
      font-size: 2rem;
      text-decoration: none;
      font-weight: 400;
      margin: 0;
      color: black;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .add-user-btn, .add-role-btn {
      background-color: #111827;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      border: none;
      font-size: 1rem;
      font-weight: 300;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .add-user-btn:hover, .add-role-btn:hover {
      background-color: #1f2937;
    }

    .search-filters-card {
      border: 0.01rem solid #a2a2a2;
      padding: 2rem;
      border-radius: 2rem;
      background-color: #FDFDFD;
      margin-bottom: 24px;
    }

    .search-container {
      position: relative;
      margin-bottom: 0;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 65%;
      transform: translateY(-50%);
      color: #9ca3af;
      width: 20px;
      height: 20px;
    }

    .search-input {
      width: 100%;
      padding-left: 40px;
      padding-right: 16px;
      padding-top: 8px;
      padding-bottom: 8px;
      border: 0.01rem solid #a2a2a2;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      background-color: #FDFDFD;
      outline: none;
    }

    .search-input:focus {
      border-color: #6ba1a9;
      box-shadow: 0 0 0 2px rgba(107, 161, 169, 0.1);
    }

    .table-container {
      border: 0.01rem solid #a2a2a2;
      padding: 2rem;
      border-radius: 2rem;
      background-color: #FDFDFD;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .table-header {
      margin-bottom: 20px;
    }

    .table-title {
      font-size: 1.5rem;
      text-decoration: none;
      font-weight: 400;
      margin: 0;
      color: #6ba1a9;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 0.8rem;
      font-size: 1rem;
      width: 100%;
    }

    .table-thead {
      background-color: #FDFDFD;
    }

    .table-th {
      font-weight: 500;
      padding: 0.6rem 3rem;
      text-align: left;
      border-bottom: 0.1rem solid #a2a2a2;
      font-size: 1rem;
    }

    .table-tbody {
      background-color: #FDFDFD;
    }

    .table-tr {
      transition: background-color 0.2s;
    }

    .table-tr:hover {
      background-color: #f9fafb;
    }

    .table-td {
      padding: 0.6rem 3rem;
      text-align: left;
      font-size: 1rem;
    }

    .last-row-td {
      padding: 0.6rem 3rem;
      text-align: left;
      font-size: 1rem;
    }

    .user-name {
      color: #6ba1a9;
      font-weight: 300;
    }

    .user-email {
      color: #2c2c2c;
      font-weight: 300;
    }

    .user-phone {
      color: #2c2c2c;
      font-weight: 300;
    }

    .role-badge {
      background-color: #6ba1a9;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 300;
      display: inline-block;
    }

    .role-name {
      color: #6ba1a9;
      font-weight: 300;
    }

    .role-permissions {
      color: #2c2c2c;
      font-weight: 300;
    }

    .user-count {
      color: #2c2c2c;
      font-weight: 600;
    }

    .actions-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-btn {
      color: #6ba1a9;
      cursor: pointer;
      text-decoration: none;
      font-weight: 300;
      font-size: 1rem;
      background: none;
      border: none;
    }

    .action-btn:hover {
      color: #1d4ed8;
    }

    .delete-btn {
      color: #dc2626;
    }

    .delete-btn:hover {
      color: #b91c1c;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      font-size: 1rem;
      font-weight: 300;
    }

    .breadcrumb-link {
      color: #6ba1a9;
      text-decoration: none;
      cursor: pointer;
      background: none;
      border: none;
      font-size: 1rem;
      font-weight: 300;
    }

    .breadcrumb-link:hover {
      color: #1d4ed8;
    }

    .breadcrumb-separator {
      color: #a2a2a2;
    }

    .breadcrumb-current {
      color: #2c2c2c;
    }

    .form-container {
      border: 0.01rem solid #a2a2a2;
      padding: 2rem;
      border-radius: 2rem;
      background-color: #FDFDFD;
    }

    .form-header {
      margin-bottom: 24px;
    }

    .form-title {
      font-size: 2rem;
      text-decoration: none;
      font-weight: 400;
      margin: 0 0 8px 0;
      color: #6ba1a9;
    }

    .form-description {
      color: #2c2c2c;
      font-weight: 300;
      font-size: 1rem;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      display: block;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      margin-bottom: 8px;
    }

    .field-input {
      width: 100%;
      padding: 8px 16px;
      border: 0.01rem solid #a2a2a2;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      background-color: #FDFDFD;
      outline: none;
    }

    .field-input:focus {
      border-color: #6ba1a9;
      box-shadow: 0 0 0 2px rgba(107, 161, 169, 0.1);
    }

    .field-row {
      display: flex;
      gap: 24px;
    }

    .field-row .field-group {
      flex: 1;
    }

    .filter-wrapper {
      position: relative;
    }

    .filter-select {
      appearance: none;
      background-color: #FDFDFD;
      border: 0.01rem solid #a2a2a2;
      border-radius: 8px;
      padding: 8px 32px 8px 16px;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      cursor: pointer;
      outline: none;
      min-width: 120px;
      width: 100%;
    }

    .filter-select:focus {
      border-color: #6ba1a9;
      box-shadow: 0 0 0 2px rgba(107, 161, 169, 0.1);
    }

    .chevron-icon {
      position: absolute;
      right: 8px;
      top: 70%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #9ca3af;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 0.01rem solid #a2a2a2;
    }

    .cancel-btn {
      padding: 8px 24px;
      border: 0.01rem solid #a2a2a2;
      color: #2c2c2c;
      border-radius: 8px;
      font-weight: 300;
      background-color: #FDFDFD;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .cancel-btn:hover {
      background-color: #f9fafb;
    }

    .save-btn {
      background-color: #6ba1a9;
      color: white;
      padding: 8px 24px;
      border-radius: 8px;
      font-weight: 300;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .save-btn:hover {
      background-color: #5a8a92;
    }

    @media (max-width: 768px) {
      .roles-main {
        padding-right: 1rem;
      }

      .header-actions {
        flex-direction: column;
        gap: 8px;
      }

      .field-row {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `;

  // Main List View
  if (currentView === 'list') {
    return (
      <div className="roles-container">
        <style>{styles}</style>
        <div className="roles-main">
          {/* Header */}
          <div className="roles-header">
            <h1 className="roles-title">User Roles Management</h1>
            <div className="header-actions">
              <button onClick={() => setCurrentView('addUser')} className="add-user-btn">
                Add User
              </button>
              <button onClick={() => setCurrentView('addRole')} className="add-role-btn">
                Add Role
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="search-filters-card">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search users and roles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <div className="table-header">
              <h2 className="table-title">Users</h2>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead className="table-thead">
                  <tr>
                    <th className="table-th">Name</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Phone</th>
                    <th className="table-th">Role</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-tbody">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="table-tr">
                      <td className={index === filteredUsers.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="user-name">{user.name}</span>
                      </td>
                      <td className={index === filteredUsers.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="user-email">{user.email}</span>
                      </td>
                      <td className={index === filteredUsers.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="user-phone">{user.phone}</span>
                      </td>
                      <td className={index === filteredUsers.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="role-badge">
                          {getRoleName(user.roleId)}
                        </span>
                      </td>
                      <td className={index === filteredUsers.length - 1 ? 'last-row-td' : 'table-td'}>
                        <div className="actions-container">
                          <button onClick={() => handleDeleteUser(user.id)} className="action-btn delete-btn">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roles Table */}
          <div className="table-container">
            <div className="table-header">
              <h2 className="table-title">Available Roles</h2>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead className="table-thead">
                  <tr>
                    <th className="table-th">Role Name</th>
                    <th className="table-th">Permissions</th>
                    <th className="table-th">Users Count</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-tbody">
                  {availableRoles.map((role, index) => (
                    <tr key={role.id} className="table-tr">
                      <td className={index === availableRoles.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="role-name">{role.name}</span>
                      </td>
                      <td className={index === availableRoles.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="role-permissions">{role.permissions.join(', ')}</span>
                      </td>
                      <td className={index === availableRoles.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="user-count">
                          {users.filter(user => user.roleId === role.id).length}
                        </span>
                      </td>
                      <td className={index === availableRoles.length - 1 ? 'last-row-td' : 'table-td'}>
                        <div className="actions-container">
                          <button onClick={() => handleDeleteRole(role.id)} className="action-btn delete-btn">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add User Form
  if (currentView === 'addUser') {
    return (
      <div className="roles-container">
        <style>{styles}</style>
        <div className="roles-main">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <button onClick={() => setCurrentView('list')} className="breadcrumb-link">
              User Roles Management
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Add User</span>
          </div>

          {/* Form */}
          <div className="form-container">
            <div className="form-header">
              <h1 className="form-title">Add User</h1>
              <p className="form-description">
                Add a new user to the system and assign them a role.
              </p>
            </div>

            <div className="form-fields">
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="field-input"
                  placeholder="Enter user's full name"
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="field-input"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="field-input"
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Assign Role</label>
                <div className="filter-wrapper">
                  <select
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">Select a role</option>
                    {availableRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button onClick={() => setCurrentView('list')} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleAddUser} className="save-btn">
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add Role Form
  return (
    <div className="roles-container">
      <style>{styles}</style>
      <div className="roles-main">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => setCurrentView('list')} className="breadcrumb-link">
            User Roles Management
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Add Role</span>
        </div>

        {/* Form */}
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">Add Role</h1>
            <p className="form-description">
              Create a new role with specific permissions for users.
            </p>
          </div>

          <div className="form-fields">
            <div className="field-group">
              <label className="field-label">Role Name</label>
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                className="field-input"
                placeholder="Enter role name"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Permissions</label>
              <input
                type="text"
                value={newRole.permissions}
                onChange={(e) => setNewRole({...newRole, permissions: e.target.value})}
                className="field-input"
                placeholder="Enter permissions separated by commas (e.g., User Management, Content Management)"
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={() => setCurrentView('list')} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleAddRole} className="save-btn">
              Add Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRolesPage;