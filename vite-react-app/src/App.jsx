import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Admin from "./pages/Admin"
import "./App.css"

const App = () => {

  return (
    <Routes >
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App
