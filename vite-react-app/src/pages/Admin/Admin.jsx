import React, { useState } from 'react';
import Home from '../../components/Home/Home';
// import OrdersCrea from '../Orders';
// import ProductsPage from '../Products/Products.jsx';
// import CustomersPage from '../../pages/Customers/Customers.jsx';
import MessagingSection from '../Messages/Messages.jsx';
import WebPage from '../Web/Web.jsx';
import PromotionsPage from '../Promotions/Promotions.jsx';
import Settings from '../Settings/Settings';
import './Admin.css';
// import UserRolesPage from '../UserRoles/UserRoles.jsx';
import IntegrationsPage from '../Integrations/Integrations.jsx';
import OrderCreationCRM from '../Orders/Orders.jsx';
import AdminRoles from '../AdminRoles/AdminRoles.jsx';
import CustomerPage from '../Customers/CustomerPage.jsx';
import ProductsList from '../Products/ProductsList.jsx';
import SalesPersons from '../Salespersons/Salespersons.jsx';
import LoyaltyCards from '../LoyaltyCards/LoyaltyCards.jsx';
// import ProductsPage from '../Products/ProductsPage.jsx';
// import MainContainer from '../Products/MainContainer.jsx';

const Admin = () => {
  const [activeBtn, setActiveBtn] = useState("Dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const renderMain = () => {
    if (activeBtn === "Dashboard") return <Home />;
    if (activeBtn === "Orders") return <OrderCreationCRM />;
    if (activeBtn === "Products") return <ProductsList />;
    if (activeBtn === "Customers") return <CustomerPage/>;
    if (activeBtn === "SalesPersons") return <SalesPersons/>;
    if (activeBtn === "LoyaltyCards") return <LoyaltyCards/>;

    if (activeBtn === "Messaging") return <MessagingSection />;
    if (activeBtn === "Web") return <WebPage />;
    if (activeBtn === "Promotions") return <PromotionsPage />;
    if (activeBtn === "Settings/AdminRoles") return <AdminRoles />;
    if (activeBtn === "Settings/Integrations") return <IntegrationsPage/>;
    if (activeBtn === "Settings") return <Settings />;

    return (
      <>
        <p>{`Currently you have selected ${activeBtn}`}</p>
        <p>This section will keep on changing depending upon what is selected from side panel</p>
      </>
    );
  };

  return (
    <div className="admin-container">
      <div className="admin-box">
        <div className="admin-sidebar">
          <button
            onClick={() => setActiveBtn("Dashboard")}
            className={`home-btn ${activeBtn === "Dashboard" ? "active-btn" : ""}`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveBtn("Orders")}
            className={activeBtn === "Orders" ? "active-btn" : ""}
          >
            Orders
          </button>

          <button
            onClick={() => setActiveBtn("Products")}
            className={activeBtn === "Products" ? "active-btn" : ""}
          >
            Products
          </button>

          <button
            onClick={() => setActiveBtn("Customers")}
            className={activeBtn === "Customers" ? "active-btn" : ""}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveBtn("SalesPersons")}
            className={activeBtn === "SalesPersons" ? "active-btn" : ""}
          >
            SalesPersons
          </button>
          <button
            onClick={() => setActiveBtn("LoyaltyCards")}
            className={activeBtn === "LoyaltyCards" ? "active-btn" : ""}
          >
            Loyalty Cards
          </button>
          <button
            onClick={() => setActiveBtn("Messaging")}
            className={activeBtn === "Messaging" ? "active-btn" : ""}
          >
            Messaging
          </button>

          <button
            onClick={() => setActiveBtn("Promotions")}
            className={activeBtn === "Promotions" ? "active-btn" : ""}
          >
            Promotions
          </button>

          <button
            onClick={() => setActiveBtn("Web")}
            className={activeBtn === "Web" ? "active-btn" : ""}
          >
            Web
          </button>

          <button
            onClick={() => setActiveBtn("Analytics")}
            className={activeBtn === "Analytics" ? "active-btn" : ""}
          >
            Analytics
          </button>

          {/* Settings dropdown */}
          <div>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={activeBtn.startsWith("Settings") ? "active-btn" : ""}
            >
              Settings ▾
            </button>

            {settingsOpen && (
              <div style={{ marginLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <button
                  onClick={() => {
                    setActiveBtn("Settings/AdminRoles");
                    setSettingsOpen(false);
                  }}
                  className={activeBtn === "Settings/AdminRoles" ? "active-btn" : ""}
                >
                  Admin Roles
                </button>
                <button
                  onClick={() => {
                    setActiveBtn("Settings/Integrations");
                    setSettingsOpen(false);
                  }}
                  className={activeBtn === "Settings/Integrations" ? "active-btn" : ""}
                >
                  Integrations
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="admin-main">
          {renderMain()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
