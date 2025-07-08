import React, { useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LoginContext } from '../../contexts/LoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {logout} = useContext(LoginContext);

  // Don't render navbar on login page
  if (location.pathname === '/') {
    return null;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const admin = localStorage.getItem('admin');
  if (admin ===null) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        NOOR
      </div>

      <div className={styles.navbarUser}>
        <button 
          className={styles.userButton}
          onClick={toggleDropdown}
        >
          <span>{admin}</span>
          <ChevronDown 
            className={`${styles.chevron} ${isDropdownOpen ? styles.rotated : ''}`}
            size={16}
          />
        </button>

        {isDropdownOpen && (
          <div className={styles.dropdown}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
