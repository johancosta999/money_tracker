import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import "./dashboard.css";

function Dashboard() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchDashboard = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/dashboard/summary`,
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message || "Couldn't load dashboard"
                    );

                }


                setSummary({
                    totalIncome: data.totalIncome,
                    totalExpense: data.totalExpense,
                    balance: data.balance
                });


            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);

            }
        };

        fetchDashboard();

    }, [navigate]);


    // Logout
    const handleLogout = () => {
        logout();
        navigate("/login");

    };


    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading your dashboard...
            </div>
        );

    }


    return (

        <div className="dashboard-page">

            {/* =========================
                Header
            ========================= */}

            <header className="dashboard-header">

                <div>

                    <p className="dashboard-greeting">
                        Welcome back{user?.userName
                            ? `, ${user.userName}`
                            : ""}
                    </p>

                    <h1>
                        Your Dashboard
                    </h1>

                </div>


                <div className="dashboard-header-actions">

                    <button
                        className="dashboard-action"
                        onClick={() => {
                            navigate("/profile");
                        }}
                    >
                        ⚙ Profile
                    </button>

                    <button
                        className="dashboard-action"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* =========================
                Error
            ========================= */}

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>

            )}


            {/* =========================
                Add Transaction
            ========================= */}

            <section className="add-transaction-section">

                <div className="dashboard-priority-actions">
                    <Link
                        to="/transactions/add"
                        className="add-transaction-button"
                    >

                        <span className="add-transaction-icon">
                            +
                        </span>

                        <div>

                            <strong>
                                Add Transaction
                            </strong>

                            <p>
                                Record your income or spending
                            </p>

                        </div>
                    </Link>

                    <Link
                        to="/planner"
                        className="add-transaction-button planner-button"
                    >
                        <span className="add-transaction-icon">
                            📅
                        </span>

                        <div>
                            <strong>
                                View Your Planners
                            </strong>

                            <p>
                                Plan and manage your budget
                            </p>
                        </div>
                    </Link>
                </div>

            </section>


            {/* =========================
                Balance
            ========================= */}

            <section className="balance-card">

                <div>

                    <p>
                        Current Balance
                    </p>

                    <h2>
                        Rs. {summary.balance.toLocaleString()}
                    </h2>

                    <span className="balance-label">
                        INCOME − EXPENSES
                    </span>

                </div>

            </section>


            {/* =========================
                Summary
            ========================= */}

            <section className="summary-grid">

                <div className="summary-card">

                    <div className="summary-icon">
                        ↑
                    </div>

                    <div>

                        <p>
                            Total Income
                        </p>

                        <h3>
                            Rs. {summary.totalIncome.toLocaleString()}
                        </h3>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        ↓
                    </div>

                    <div>

                        <p>
                            Total Expenses
                        </p>

                        <h3>
                            Rs. {summary.totalExpense.toLocaleString()}
                        </h3>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        =
                    </div>

                    <div>

                        <p>
                            Net Balance
                        </p>

                        <h3>
                            Rs. {summary.balance.toLocaleString()}
                        </h3>

                    </div>

                </div>

            </section>


            {/* =========================
                Quick Actions
            ========================= */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <p>
                        MANAGE YOUR MONEY
                    </p>

                    <h2>
                        Quick Actions
                    </h2>

                </div>


                <div className="quick-actions">

                    <Link
                        to="/transactions/all"
                        className="quick-action-card"
                    >

                        <div className="quick-action-icon">
                            💳
                        </div>

                        <div>

                            <h3>
                                All transactions
                            </h3>

                            <p>
                                View all of your incomes and expenses.
                            </p>

                        </div>

                    </Link>

                </div>

            </section>

        </div>

    );
}

export default Dashboard;