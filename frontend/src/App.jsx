import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Planner from "./pages/Planner";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets"

import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import PlanDetails from "./pages/planDetails";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* Public routes */}
                <Route 
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* Protected routes */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <Transactions />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/planner"
                    element={
                        <ProtectedRoute>
                            <Planner />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/categories"
                    element={
                        <ProtectedRoute>
                            <Categories />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/budgets"
                    element={
                        <ProtectedRoute>
                            <Budgets />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/planner/:id"
                    element={
                        <ProtectedRoute>
                            <PlanDetails />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;