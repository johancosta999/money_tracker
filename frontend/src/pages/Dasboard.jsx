import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    const handleLogout = () => {

        // Remove authentication data
        localStorage.removeItem("token");

        // Return to login
        navigate("/login");
    };


    return (
        <div className="dashboard-page">

            {/* =========================
                Header
            ========================= */}

            <header className="dashboard-header">

                <div>

                    <p className="dashboard-greeting">
                        WELCOME BACK
                    </p>

                    <h1>
                        Good evening 👋
                    </h1>

                    <p className="dashboard-subtitle">
                        Here's how your money is looking.
                    </p>

                </div>


                <div className="dashboard-header-actions">

                    <button
                        className="dashboard-action"
                        onClick={() => alert("Settings coming soon")}
                    >
                        ⚙ Settings
                    </button>

                    <button
                        className="dashboard-action logout-action"
                        onClick={handleLogout}
                    >
                        ↪ Logout
                    </button>

                </div>

            </header>


            {/* =========================
                Main Action
            ========================= */}

            <section className="transaction-priority">

                <div className="transaction-priority-text">

                    <span className="priority-label">
                        KEEP YOUR FINANCES UPDATED
                    </span>

                    <h2>
                        Add a transaction
                    </h2>

                    <p>
                        Record your income or spending and keep
                        your budget on track.
                    </p>

                </div>


                <Link
                    to="/transactions/add"
                    className="add-transaction-btn"
                >
                    + Add Transaction
                </Link>

            </section>


            {/* =========================
                Balance
            ========================= */}

            <section className="balance-card">

                <div>

                    <p>
                        CURRENT BALANCE
                    </p>

                    <h2>
                        Rs. 85,450
                    </h2>

                    <span className="balance-label">
                        AVAILABLE BALANCE
                    </span>

                </div>


                <div className="balance-decoration">
                    ₨
                </div>

            </section>


            {/* =========================
                Summary
            ========================= */}

            <section className="summary-grid">

                <div className="summary-card">

                    <div className="summary-icon income-icon">
                        ↑
                    </div>

                    <div>

                        <p>
                            TOTAL INCOME
                        </p>

                        <h3>
                            Rs. 120,000
                        </h3>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon expense-icon">
                        ↓
                    </div>

                    <div>

                        <p>
                            TOTAL EXPENSES
                        </p>

                        <h3>
                            Rs. 34,550
                        </h3>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        =
                    </div>

                    <div>

                        <p>
                            NET BALANCE
                        </p>

                        <h3>
                            Rs. 85,450
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
                        Quick actions
                    </h2>

                </div>


                <div className="quick-actions">

                    <Link
                        to="/transactions"
                        className="quick-action-card"
                    >

                        <div className="quick-action-icon">
                            ₨
                        </div>

                        <div>

                            <h3>
                                Transactions
                            </h3>

                            <p>
                                View and manage your transactions.
                            </p>

                        </div>

                    </Link>


                    <Link
                        to="/planner"
                        className="quick-action-card"
                    >

                        <div className="quick-action-icon">
                            ✓
                        </div>

                        <div>

                            <h3>
                                Money Planner
                            </h3>

                            <p>
                                Plan your monthly spending.
                            </p>

                        </div>

                    </Link>


                    <Link
                        to="/transactions/add"
                        className="quick-action-card"
                    >

                        <div className="quick-action-icon">
                            +
                        </div>

                        <div>

                            <h3>
                                Add Transaction
                            </h3>

                            <p>
                                Quickly record new spending.
                            </p>

                        </div>

                    </Link>

                </div>

            </section>


            {/* =========================
                Recent Transactions
            ========================= */}

            <section className="dashboard-section">

                <div className="section-heading recent-heading">

                    <div>

                        <p>
                            ACTIVITY
                        </p>

                        <h2>
                            Recent transactions
                        </h2>

                    </div>

                    <Link to="/transactions">
                        View all →
                    </Link>

                </div>


                <div className="recent-transactions">

                    {/* Transaction 1 */}

                    <div className="recent-transaction">

                        <div className="transaction-left">

                            <div className="transaction-icon">
                                🍔
                            </div>

                            <div>

                                <h3>
                                    Food
                                </h3>

                                <p>
                                    Today · Food
                                </p>

                            </div>

                        </div>

                        <strong className="expense">
                            - Rs. 1,200
                        </strong>

                    </div>


                    {/* Transaction 2 */}

                    <div className="recent-transaction">

                        <div className="transaction-left">

                            <div className="transaction-icon">
                                📚
                            </div>

                            <div>

                                <h3>
                                    Books
                                </h3>

                                <p>
                                    Yesterday · Books
                                </p>

                            </div>

                        </div>

                        <strong className="expense">
                            - Rs. 2,500
                        </strong>

                    </div>


                    {/* Transaction 3 */}

                    <div className="recent-transaction">

                        <div className="transaction-left">

                            <div className="transaction-icon">
                                💼
                            </div>

                            <div>

                                <h3>
                                    Salary
                                </h3>

                                <p>
                                    Aug 28 · Income
                                </p>

                            </div>

                        </div>

                        <strong className="income">
                            + Rs. 120,000
                        </strong>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;