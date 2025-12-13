import './Admin.css';
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Admin = () => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="admin-container no-scrollbar">
      {/* Sidebar Toggle Button */}
      <button 
        className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? <ChevronRight size={16} color='white' /> : <ChevronLeft size={16} color = 'white' />}
      </button>

      <div className="admin-box">
        {/* Sidebar */}
        <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      

          {/* Menu Items */}
          <Link
            to="/dashboard"
            className={`sidebar-item ${isActive('/dashboard') ? "active-btn" : ""}`}
          >
            Dashboard
          </Link>

          <Link to="/orders" className={`sidebar-item ${isActive('/orders') ? "active-btn" : ""}`}>
            Orders
          </Link>
          
          <Link to="/products" className={`sidebar-item ${isActive('/products') ? "active-btn" : ""}`}>
            Products
          </Link>
          <Link to="/alterations" className={`sidebar-item ${isActive('/alterations') ? "active-btn" : ""}`}>
            Alterations
          </Link>
          
          <Link to="/returns" className={`sidebar-item ${isActive('/returns') ? "active-btn" : ""}`}>
            Returns
          </Link>
          
          <Link to="/customers" className={`sidebar-item ${isActive('/customers') ? "active-btn" : ""}`}>
            Customers
          </Link>
          
          <Link to="/sales-persons" className={`sidebar-item ${isActive('/sales-persons') ? "active-btn" : ""}`}>
            Sales Persons
          </Link>
          
          <Link to="/loyalty-cards" className={`sidebar-item ${isActive('/loyalty-cards') ? "active-btn" : ""}`}>
            Loyalty Cards
          </Link>
          
          <Link to="/bills" className={`sidebar-item ${isActive('/bills') ? "active-btn" : ""}`}>
            Bills
          </Link>
          
          <Link to="/purchases" className={`sidebar-item ${isActive('/purchases') ? "active-btn" : ""}`}>
            Purchases
          </Link>
          
          <Link to="/messaging" className={`sidebar-item ${isActive('/messaging') ? "active-btn" : ""}`}>
            Messaging
          </Link>
          
          <Link to="/promotions" className={`sidebar-item ${isActive('/promotions') ? "active-btn" : ""}`}>
            Promotions
          </Link>
          
          <Link to="/web" className={`sidebar-item ${isActive('/web') ? "active-btn" : ""}`}>
            Web
          </Link>
          
          <Link to="/analytics" className={`sidebar-item ${isActive('/analytics') ? "active-btn" : ""}`}>
            Analytics
          </Link>

          {/* Settings Dropdown */}
          <div className="settings-section">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`sidebar-item ${isActive('/settings') ? "active-btn" : ""}`}
            >
              Settings ▾
            </button>
            {settingsOpen && (
              <div className="settings-dropdown">
                <Link
                  to="/settings/admin-roles"
                  className={`sidebar-item ${isActive('/settings/admin-roles') ? "active-btn" : ""}`}
                  onClick={() => setSettingsOpen(false)}
                >
                  Admin Roles
                </Link>
                <Link
                  to="/settings/integrations"
                  className={`sidebar-item ${isActive('/settings/integrations') ? "active-btn" : ""}`}
                  onClick={() => setSettingsOpen(false)}
                >
                  Integrations
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`admin-main no-scrollbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;