import React, { useState, useEffect, useContext } from 'react';
import './AdminRoles.css';
import DeleteAdmin from './DeleteAdmin';
import EditAdmin from './EditAdmin';
import AddAdmin from './AddAdmin';
import { Search } from 'lucide-react';
import { LoginContext } from '../../contexts/LoginContext';
import { DeleteButton, EditButton } from '../../ui/Button';

const AdminRoles = () => {

const {getAllAdmins}=useContext(LoginContext);

  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockAdmins = await getAllAdmins();
        setAdmins(mockAdmins.admins);
      } catch (error) {
        console.error('Error fetching admins:', error);
        setAdmins([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);
  const handleDelete = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const confirmDelete = (adminID) => {
    setAdmins(admins.filter(admin => admin.adminID !== adminID));
    setShowDeleteModal(false);
  };
// this needs a change
  const saveEditedAdmin = (updatedAdmin) => {
    setAdmins(admins.map(admin => 
      admin.adminID === updatedAdmin.adminID ? updatedAdmin : admin
    ));
    setShowEditModal(false);
  };//// 

  const addNewAdmin = (newAdmin) => {
    setAdmins([...admins, { ...newAdmin, adminID: admins.length + 1 }]);
    setShowAddModal(false);
  };

  const renderRoles = (roles) => {
    return (
      <div className="roles-container">
        {roles.map((role, index) => (
          <span key={index} className="role-pill">
            {role}
          </span>
        ))}
      </div>
    );
  };
  const filteredAdmins = admins && admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.email.toLowerCase().includes(searchLower) ||
      admin.roles.some(role => role.toLowerCase().includes(searchLower))
    );
  });
  return (
    <div className="admin-roles-container">
      <h5>Admin Roles Management</h5>
      
      {isLoading && admins.length==0 ? (
        <div className="loading-indicator">Loading admins...</div>
      ) : (
        <>
          <div className="admin-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search size={22} className="search-icon" />
            </div>
            
            <button className="add-admin-btn" onClick={handleAdd}>
              + Add Admin
            </button>
          </div>
          
          <div className="admins-table">
            <table>
              <thead>
                <tr>
                  <th>Admin ID</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map(admin => (
                    <tr key={admin.adminID}>
                      <td>{admin.adminID}</td>
                      <td>{admin.email}</td>
                      <td>{renderRoles(admin.roles)}</td>
                      <td className="actions">
                        <EditButton onClick={()=> handleEdit(admin)}/>
                        <DeleteButton onClick={()=> handleDelete(admin)}/>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-results">
                      {searchTerm ? 'No matching admins found' : 'No admins available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {showDeleteModal && (
        <DeleteAdmin
          admin={selectedAdmin}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
      
      {showEditModal && (
        <EditAdmin
          admin={selectedAdmin}
          onClose={() => setShowEditModal(false)}
          onSave={saveEditedAdmin}
        />
      )}
      
      {showAddModal && (
        <AddAdmin
          onClose={() => setShowAddModal(false)}
          onSave={addNewAdmin}
        />
      )}
    </div>
  );
};

export default AdminRoles;