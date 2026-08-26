import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import api from "../services/api";

function Dashboard() {

    const { user } = useAuth();

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const getDashboardSummary = async () => {

            try {

                const response = await api.get("/dashboard/summary");

                setSummary(response.data);

            } catch (error) {

                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Couldn't load dashboard"
                );

            } finally {
                setLoading(false);
            }
        };

        getDashboardSummary();

    }, []);


    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    Loading dashboard...
                </div>
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
                        Welcome back
                    </p>

                    <h1>
                        {user?.userName || "User"}
                    </h1>
                </div>

                <div className="dashboard-header-actions">

                    <Link
                        to="/transactions"
                        className="dashboard-action"
                    >
                        Transactions
                    </Link>

                    <Link
                        to="/planner"
                        className="dashboard-action"
                    >
                        Planner
                    </Link>

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
                Balance
            ========================= */}

            <section className="balance-card">

                <div>
                    <p>Current Balance</p>

                    <h2>
                        Rs. {summary.balance.toLocaleString()}
                    </h2>
                </div>

                <div className="balance-label">
                    MONEY TRACKER
                </div>

            </section>


            {/* =========================
                Summary Cards
            ========================= */}

            <section className="summary-grid">

                {/* Income */}

                <div className="summary-card">

                    <div className="summary-icon">
                        ↑
                    </div>

                    <div>
                        <p>Total Income</p>

                        <h3>
                            Rs. {summary.totalIncome.toLocaleString()}
                        </h3>
                    </div>

                </div>


                {/* Expenses */}

                <div className="summary-card">

                    <div className="summary-icon">
                        ↓
                    </div>

                    <div>
                        <p>Total Expenses</p>

                        <h3>
                            Rs. {summary.totalExpense.toLocaleString()}
                        </h3>
                    </div>

                </div>


                {/* Balance */}

                <div className="summary-card">

                    <div className="summary-icon">
                        =
                    </div>

                    <div>
                        <p>Net Balance</p>

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

                    <div>
                        <p>Quick actions</p>

                        <h2>
                            Manage your money
                        </h2>
                    </div>

                </div>


                <div className="quick-actions">

                    <Link
                        to="/transactions"
                        className="quick-action-card"
                    >

                        <span className="quick-action-icon">
                            +
                        </span>

                        <div>
                            <h3>Add Transaction</h3>

                            <p>
                                Record income or expenses
                            </p>
                        </div>

                    </Link>


                    <Link
                        to="/planner"
                        className="quick-action-card"
                    >

                        <span className="quick-action-icon">
                            ◷
                        </span>

                        <div>
                            <h3>Weekly Planner</h3>

                            <p>
                                Plan your spending
                            </p>
                        </div>

                    </Link>


                    <Link
                        to="/categories"
                        className="quick-action-card"
                    >

                        <span className="quick-action-icon">
                            #
                        </span>

                        <div>
                            <h3>Categories</h3>

                            <p>
                                Manage your categories
                            </p>
                        </div>

                    </Link>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;