import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Planner from "./pages/Planner";
import PlannerDetails from "./pages/PlannerDetails";
import Transactions from "./pages/Transactions";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuth from "./context/useAuth";
import AllTransactions from "./pages/AllTransactions";

function PublicRoute({ children }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Checking authentication...</div>;
    }

    return user ? <Navigate to="/dashboard" replace /> : children;
}

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<PublicRoute><LandingPage /></PublicRoute>}
                />

                <Route
                    path="/login"
                    element={<PublicRoute><Login /></PublicRoute>}
                />

                <Route
                    path="/register"
                    element={<PublicRoute><Register /></PublicRoute>}
                />

                <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                />

                <Route
                    path="/transactions/add"
                    element={<ProtectedRoute><AddTransaction /></ProtectedRoute>}
                />

                <Route
                    path="/transactions"
                    element={<ProtectedRoute><Transactions /></ProtectedRoute>}
                />

                <Route
                    path="/planner"
                    element={<ProtectedRoute><Planner /></ProtectedRoute>}
                />

                <Route
                    path="/planner/:id"
                    element={<ProtectedRoute><PlannerDetails /></ProtectedRoute>}
                />

                <Route
                    path="/transactions/:id"
                    element={<ProtectedRoute><AllTransactions /></ProtectedRoute>}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;