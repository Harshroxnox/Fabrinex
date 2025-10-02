import React, { useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LoginContext } from "../../contexts/LoginContext";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(LoginContext);

  if (location.pathname === "/") {
    return null;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  const admin = localStorage.getItem("admin");
  const rolesString = localStorage.getItem("role") || "";
  const roles = rolesString.split(",").filter(Boolean);

  if (admin === null) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">NOOR</div>

      <div className="navbar-user">
        <button className="navbar-user-button" onClick={toggleDropdown}>
          <span>{admin}</span>
          <ChevronDown
            className={`navbar-chevron ${isDropdownOpen ? "navbar-rotated" : ""}`}
            size={16}
          />
        </button>

        {isDropdownOpen && (
          <div className="navbar-dropdown">
            {roles.length > 0 && (
              <div className="navbar-roles">
                Roles : {roles.map((role, index) => (
                  <span key={index} className="navbar-role-badge">
                    {role}
                  </span>
                ))}
              </div>
            )}
      
            <button className="navbar-logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
