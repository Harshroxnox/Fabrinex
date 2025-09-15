import { Routes, Route } from "react-router-dom"
import Admin from "./pages/Admin/Admin"
import "./App.css"
import Login from "./pages/Login/Login"
import Navbar from "./components/Navbar/Navbar"
import {LoginProvider} from './contexts/LoginContext';
import { ProductProvider } from "./contexts/ProductContext"
import ProtectedRoute from "./ProtectedRoute"
const App = () => {
  return (
<LoginProvider>
  <ProductProvider>
    <Navbar/>
    <Routes >
      <Route path="/" element={<Login />}/>
      <Route path="/admin" element= {
        <ProtectedRoute>
          <Admin/>
        </ProtectedRoute>
      }
      />
    </Routes>
  </ProductProvider>

</LoginProvider>
  )
}

export default App
