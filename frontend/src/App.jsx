import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dasboard";
import AddTransaction from "./pages/AddTransaction";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<LandingPage />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/transactions/add"
                    element={<AddTransaction />}
                />

                <Route
                    path="/transactions"
                    element={<h1>Transactions Page</h1>}
                />

                <Route
                    path="/planner"
                    element={<h1>Planner Page</h1>}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;