import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Admin from "./pages/Admin/Admin"
import "./App.css"
import Invoice from "./components/Invoice"

const App = () => {

  return (

    <Routes >
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/invoice" element={<Invoice />} />

    </Routes>

  )
}

export default App
