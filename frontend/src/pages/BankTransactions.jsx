import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./dashboard.css";

function BankTransactions() {
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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/bank/bank-transactions`,

          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Couldn't load bank transactions");
        }

        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
  };

  const formatDate = (value) => {
    return new Date(value).toLocaleDateString(
      "en-GB",

      {
        day: "2-digit",

        month: "short",

        year: "numeric",
      },
    );
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-greeting">BANK TRANSACTIONS</p>

          <h1>Your Bank Activity</h1>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/dashboard" className="dashboard-action">
            ← Dashboard
          </Link>

          <Link to="/bank/add" className="dashboard-action">
            + Add Bank Transaction
          </Link>
        </div>
      </header>
      

      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-section">
        <div className="section-heading">
          <p>RECENT ACTIVITY</p>

          <h2>Bank Transactions</h2>
        </div>

        {loading ? (
          <div className="planner-loading">Loading bank transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="planner-empty-state">
            <div className="empty-planner-icon">+</div>

            <h3>No transactions yet</h3>

            <p>Your bank transactions will appear here.</p>
          </div>
        ) : (
          <div className="recent-transactions">
            {transactions.map((transaction) => {
              const isDeposit = transaction.type?.toLowerCase() === "deposit";

              return (
                <div className="recent-transaction bank-transaction" key={transaction._id}>
                  <div className="transaction-left">
                    <div className={`transaction-icon ${isDeposit ? "income-icon" : "expense-icon"}`}>
                      {isDeposit ? "↑" : "↓"}
                    </div>

                    <div>
                      <h3>{transaction.description || "Bank Transaction"}</h3>
                      <p>
                        {isDeposit ? "Deposit" : "Withdraw"} • {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <strong className={isDeposit ? "income" : "expense"}>
                    {isDeposit ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default BankTransactions;
