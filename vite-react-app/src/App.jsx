import { Routes, Route } from "react-router-dom"
import Admin from "./pages/Admin/Admin"
import "./App.css"
import Login from "./pages/Login/Login"
// import UserRolesPage from "./pages/UserRoles/UserRoles"
import Navbar from "./components/Navbar/Navbar"
import {LoginProvider} from './contexts/LoginContext';
import Register from "./pages/Register"
import { ProductProvider } from "./contexts/ProductContext"
import TextEditor from "./Editor/TextEditor"
const App = () => {
  return (
<LoginProvider>
  <ProductProvider>

    <Navbar/>
    <Routes >
      <Route path="/" element={<Login />}/>
      <Route path="/admin" element={<Admin />} />
      <Route path="/ad" element={<TextEditor/>} />
      <Route path="/register" element={<Register/>}/>
    </Routes>
    {/* <Register/> */}
  </ProductProvider>

</LoginProvider>
  )
}

export default App
