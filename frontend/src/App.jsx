import { Routes, Route } from "react-router-dom"
import Admin from "./pages/Admin/Admin"
import "./App.css"
import Login from "./pages/Login/Login"
import Navbar from "./components/Navbar/Navbar"
import { LoginProvider } from './contexts/LoginContext';
import ProtectedRoute from "./ProtectedRoute"
import { Toaster } from "react-hot-toast"
import Home from "./components/Dashboard/Home.jsx";
import OrderCreationCRM from "./pages/Orders/Orders.jsx"
import { OrderCreation } from "./pages/Orders/OrderCreation.jsx"
import ProductsList from "./pages/Products/ProductsList.jsx"
import DailyReturnsSection from "./pages/Returns/DailyReturnsSection.jsx"
import CustomerPage from "./pages/Customers/CustomerPage.jsx"
import SalesPersons from "./pages/Salespersons/Salespersons.jsx"
import LoyaltyCards from "./pages/LoyaltyCards/LoyaltyCards.jsx"
import BillManagement from "./pages/Bills/Bill.jsx"
import PurchaseList from "./pages/Purchases/PurchaseList.jsx"
import MessagingSection from "./pages/Messages/Messages.jsx"
import PromotionsPage from "./pages/Promotions/Promotions.jsx"
import WebPage from "./pages/Web/Web.jsx"
// import Analytics from "./pages/"
import AdminRoles from "./pages/AdminRoles/AdminRoles.jsx"
import IntegrationsPage from "./pages/Integrations/Integrations.jsx"
import Settings from "./pages/Settings/Settings.jsx"
import NotFound from "./NotFound.jsx"
import Alterations from "./pages/Alterations/Alterations.jsx"
import AlterationNotifier from "./pages/Alterations/AlterationNotifier.jsx"
const App = () => {
  return (
    <LoginProvider>
      <Toaster position="top-right" />
      <Navbar/>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={
          <ProtectedRoute>
            <Admin/>
            <AlterationNotifier/>
          </ProtectedRoute>
        }>
          {/* Nested routes for sidebar content */}
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="orders" element={<OrderCreationCRM />} />
          <Route path="orders/create" element={<OrderCreation />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="alterations" element={<Alterations/>} />
          <Route path="returns" element={<DailyReturnsSection />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="sales-persons" element={<SalesPersons />} />
          <Route path="loyalty-cards" element={<LoyaltyCards />} />
          <Route path="bills" element={<BillManagement />} />
          <Route path="purchases" element={<PurchaseList />} />
          <Route path="messaging" element={<MessagingSection />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="web" element={<WebPage />} />
          <Route path="settings/admin-roles" element={<AdminRoles />} />
          <Route path="settings/integrations" element={<IntegrationsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </LoginProvider>
  )
}

export default App