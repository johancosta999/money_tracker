import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

import FilterSelect from "../components/FilterSelect";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { formatFullDate, formatDateTime, getEditedAt } from "../utils/transactionDetails";
import { getPlannerOptions, matchesPlanner, matchesSearch, getLatestPlannerId } from "../utils/transactionFilters";
import SearchInput from "../components/SearchInput";
import { exportCsv, datedFilename, csvDate } from "../utils/exportCsv";

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

  const [plannerFilter, setPlannerFilter] = useState("all");

  const [search, setSearch] = useState("");

  // { transactionId, ...props for TransactionDetailsModal }
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Planners are only used to pick the default filter; the list works without them
        const [{ data }, plans] = await Promise.all([
          api.get("/bank/bank-transactions"),
          api.get("/plan").catch(() => ({ data: [] })),
        ]);

        const list = Array.isArray(data) ? data : data.transactions || [];
        setTransactions(list);

        // Start on the newest planner's transactions; "All planners" is still in the filter
        setPlannerFilter(getLatestPlannerId(list, Array.isArray(plans.data) ? plans.data : []));
      } catch (error) {
        setError(getErrorMessage(error, "Couldn't load bank transactions"));
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  const visibleTransactions = transactions.filter(
    (transaction) =>
      (typeFilter === "all" || transaction.type?.toLowerCase() === typeFilter) &&
      matchesPlanner(transaction, plannerFilter) &&
      matchesSearch(transaction, search),
  );

  const handleDelete = async () => {
    const id = selectedDetails.transactionId;
    await api.delete(`/bank/delete-transaction/${id}`);
    setTransactions((current) => current.filter((item) => item._id !== id));
    setSelectedDetails(null);
  };

  // Same wording as the list ("Own money", "To someone else"...)
  const getSourceLabel = (transaction) => {
    const type = transaction.type?.toLowerCase();
    if (type === "deposit") return transaction.external ? "From someone else" : "Own money";
    if (type === "transfer") return transaction.external ? "To someone else" : "To own account";
    return "Cash in hand";
  };

  const handleExport = () =>
    exportCsv(datedFilename("bank-transactions"), [
      { label: "Date", value: (t) => csvDate(t.date || t.createdAt) },
      { label: "Type", value: (t) => t.type },
      { label: "Category", value: (t) => t.category || "" },
      { label: "Money", value: getSourceLabel },
      { label: "Affects balance", value: (t) => (t.external && t.type !== "Withdraw" ? "Yes" : "No") },
      { label: "Amount", value: (t) => t.amount },
      { label: "Planner", value: (t) => t.plannerId?.name || "" },
      { label: "Description", value: (t) => t.description },
    ], visibleTransactions);

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
            <SearchInput
              id="bankSearch"
              value={search}
              onChange={setSearch}
              placeholder="Description, category..."
            />
            <FilterSelect
              id="bankTypeFilter"
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={BANK_TYPE_OPTIONS}
            />
            <FilterSelect
              id="bankPlannerFilter"
              label="Planner"
              value={plannerFilter}
              onChange={setPlannerFilter}
              options={getPlannerOptions(transactions, true)}
            />
            <button
              type="button"
              className="dashboard-action filter-export"
              onClick={handleExport}
              disabled={visibleTransactions.length === 0}
            >
              ⬇ Export CSV
            </button>
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
          <div className="filter-empty">No bank transactions match these filters.</div>
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
                  transactionId: transaction._id,
                  eyebrow: `BANK ${transactionLabel.toUpperCase()}`,
                  title: transaction.description || "Bank Transaction",
                  amount: `${amountSign}${formatCurrency(transaction.amount)}`,
                  amountClass: transactionClass,
                  rows: [
                    { label: "Type", value: transactionLabel },
                    { label: "Category", value: transaction.category || "No category" },
                    { label: "Money", value: sourceLabel },
                    { label: "Affects balance", value: affectsBalance ? "Yes" : "No" },
                    { label: "Planner", value: transaction.plannerId?.name || "No planner" },
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
                        {transaction.category && `${transaction.category} • `}
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
          eyebrow={selectedDetails.eyebrow}
          title={selectedDetails.title}
          amount={selectedDetails.amount}
          amountClass={selectedDetails.amountClass}
          rows={selectedDetails.rows}
          onClose={() => setSelectedDetails(null)}
          onEdit={() => navigate(`/bank-transactions/${selectedDetails.transactionId}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default BankTransactions;
