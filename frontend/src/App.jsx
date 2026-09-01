import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dasboard";
import AddTransaction from "./pages/AddTransaction";
import Planner from "./pages/Planner";
import PlannerDetails from "./pages/PlannerDetails";
import Transactions from "./pages/Transactions";

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
                    element={<Transactions />}
                />

                <Route
                    path="/planner"
                    element={<Planner />}
                />

                <Route
                    path="/planner/:id"
                    element={<PlannerDetails />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;