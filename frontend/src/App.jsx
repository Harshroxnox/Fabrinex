import { Routes, Route } from "react-router-dom"
import Admin from "./pages/Admin/Admin"
import "./App.css"
import Login from "./pages/Login/Login"
import Navbar from "./components/Navbar/Navbar"
import {LoginProvider} from './contexts/LoginContext';
import ProtectedRoute from "./ProtectedRoute"
import { Toaster } from "react-hot-toast"
const App = () => {
  return (
<LoginProvider>
    <Toaster position="top-right" />
    <Navbar/>
      <Routes >
        <Route path="/login" element={<Login />}/>
        <Route path="/" element= {
          <ProtectedRoute>
            <Admin/>
          </ProtectedRoute>
        }
        />
      </Routes>
</LoginProvider>
  )
}

export default App
