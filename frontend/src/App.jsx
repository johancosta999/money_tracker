import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Planner from "./pages/Planner"
import Transactions from "./pages/Transactions"
import Categories from "./pages/Categories"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App
