import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

import FilterSelect from "../components/FilterSelect";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { formatFullDate, formatDateTime, getEditedAt } from "../utils/transactionDetails";

import "./dashboard.css";

// Values match the bank transaction "type" (compared in lowercase)
const BANK_TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "deposit", label: "Deposits" },
  { value: "transfer", label: "Transfers" },
  { value: "withdraw", label: "Withdrawals" },
];

function BankTransactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get("/bank/bank-transactions");

        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      } catch (error) {
        setError(getErrorMessage(error, "Couldn't load bank transactions"));
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  const visibleTransactions =
    typeFilter === "all"
      ? transactions
      : transactions.filter(
          (transaction) => transaction.type?.toLowerCase() === typeFilter,
        );

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

          <Link to="/create/bank-transactions" className="dashboard-action">
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

        {transactions.length > 0 && (
          <div className="filter-bar">
            <FilterSelect
              id="bankTypeFilter"
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={BANK_TYPE_OPTIONS}
            />
          </div>
        )}

        {loading ? (
          <div className="planner-loading">Loading bank transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="planner-empty-state">
            <div className="empty-planner-icon">+</div>

            <h3>No transactions yet</h3>

            <p>Your bank transactions will appear here.</p>
          </div>
        ) : visibleTransactions.length === 0 ? (
          <div className="filter-empty">No bank transactions of this type.</div>
        ) : (
          <div className="recent-transactions">
            {visibleTransactions.map((transaction) => {
              const transactionType = transaction.type?.toLowerCase();
              const isDeposit = transactionType === "deposit";
              const isTransfer = transactionType === "transfer";
              const transactionLabel = isDeposit
                ? "Deposit"
                : isTransfer
                  ? "Transfer"
                  : "Withdraw";
              const transactionClass = isDeposit
                ? "income"
                : isTransfer
                  ? "transfer"
                  : "expense";
              const affectsBalance = !!transaction.external && (isDeposit || isTransfer);
              const sourceLabel = isDeposit
                ? transaction.external ? "From someone else" : "Own money"
                : isTransfer
                  ? transaction.external ? "To someone else" : "To own account"
                  : "Cash in hand";
              const amountSign = affectsBalance ? (isDeposit ? "+" : "−") : "";

              const openDetails = () =>
                setSelectedDetails({
                  eyebrow: `BANK ${transactionLabel.toUpperCase()}`,
                  title: transaction.description || "Bank Transaction",
                  amount: `${amountSign}${formatCurrency(transaction.amount)}`,
                  amountClass: transactionClass,
                  rows: [
                    { label: "Type", value: transactionLabel },
                    { label: "Money", value: sourceLabel },
                    { label: "Affects balance", value: affectsBalance ? "Yes" : "No" },
                    { label: "Date", value: formatFullDate(transaction.date || transaction.createdAt) },
                    { label: "Description", value: transaction.description },
                    { label: "Added on", value: formatDateTime(transaction.createdAt) },
                    { label: "Last edited", value: getEditedAt(transaction) },
                  ],
                });

              return (
                <div
                  className="recent-transaction bank-transaction clickable-transaction"
                  key={transaction._id}
                  role="button"
                  tabIndex={0}
                  onClick={openDetails}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openDetails();
                    }
                  }}
                >
                  <div className="transaction-left">
                    <div className={`transaction-icon ${isDeposit ? "income-icon" : isTransfer ? "transfer-icon" : "expense-icon"}`}>
                      {isDeposit ? "↑" : isTransfer ? "→" : "↓"}
                    </div>

                    <div>
                      <h3>{transaction.description || "Bank Transaction"}</h3>
                      <p>
                        {transactionLabel} • {sourceLabel} •{" "}
                        {formatDate(transaction.date || transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bank-amount">
                    <strong className={transactionClass}>
                      {amountSign}
                      {formatCurrency(transaction.amount)}
                    </strong>

                    {/* <span className={`balance-effect-tag ${affectsBalance ? "affects" : ""}`}>
                      {affectsBalance ? "Affects balance" : "No balance change"}
                    </span> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedDetails && (
        <TransactionDetailsModal
          {...selectedDetails}
          onClose={() => setSelectedDetails(null)}
        />
      )}
    </div>
  );
}

export default BankTransactions;
