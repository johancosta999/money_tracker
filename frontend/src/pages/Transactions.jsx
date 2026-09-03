import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

function Transactions() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Couldn't load transactions");
                }

                setTransactions(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                setError(fetchError.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [navigate]);

    const formatCurrency = (value) =>
        `Rs. ${Number(value || 0).toLocaleString()}`;

    const formatDate = (value) =>
        new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <p className="dashboard-greeting">TRANSACTIONS</p>
                    <h1>Your Activity</h1>
                </div>

                <div className="dashboard-header-actions">
                    <Link to="/dashboard" className="dashboard-action">
                        ← Dashboard
                    </Link>
                </div>
            </header>

            {error && <div className="dashboard-error">{error}</div>}

            <section className="add-transaction-section">
                <Link to="/transactions/add" className="add-transaction-button">
                    <span className="add-transaction-icon">+</span>
                    <div>
                        <strong>Add Transaction</strong>
                        <p>Record your next income or spending</p>
                    </div>
                </Link>
            </section>

            <section className="dashboard-section">
                <div className="section-heading">
                    <p>RECENT ACTIVITY</p>
                    <h2>Transactions</h2>
                </div>

                {loading ? (
                    <div className="planner-loading">Loading your transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="planner-empty-state">
                        <div className="empty-planner-icon">+</div>
                        <h3>No transactions yet</h3>
                        <p>Your spending and income will show up here.</p>
                    </div>
                ) : (
                    <div className="recent-transactions">
                        {transactions.map((transaction) => (
                            <div className="recent-transaction" key={transaction._id}>
                                <div className="transaction-left">
                                    <div className="transaction-icon">
                                        {transaction.type === "income" ? "↑" : "↓"}
                                    </div>

                                    <div>
                                        <h3>{transaction.title}</h3>
                                        <p>
                                            {transaction.category} • {formatDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <strong className={transaction.type === "income" ? "income" : "expense"}>
                                        {transaction.type === "income" ? "+" : "-"}
                                        {formatCurrency(transaction.amount)}
                                    </strong>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Transactions;
