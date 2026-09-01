import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<h1>Landing Page</h1>}
                />

                <Route
                    path="/login"
                    element={<h1>Login Page</h1>}
                />

                <Route
                    path="/register"
                    element={<h1>Register Page</h1>}
                />

                <Route
                    path="/dashboard"
                    element={<h1>Dashboard Page</h1>}
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