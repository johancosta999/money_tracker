import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import FilterSelect from "../components/FilterSelect";
import { SORT_OPTIONS, getCategoryOptions, getPlannerOptions, filterAndSortTransactions } from "../utils/transactionFilters";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { getTransactionDetails } from "../utils/transactionDetails";
import SearchInput from "../components/SearchInput";
import { exportCsv, datedFilename, csvDate } from "../utils/exportCsv";
import "./dashboard.css";

function Transactions() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [category, setCategory] = useState("all");
    const [planner, setPlanner] = useState("all");
    const [sort, setSort] = useState("newest");
    const [search, setSearch] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data } = await api.get("/transactions");

                setTransactions(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                setError(getErrorMessage(fetchError, "Couldn't load transactions"));
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [navigate]);

    const visibleTransactions = filterAndSortTransactions(transactions, { category, planner, sort, search });

    const handleDelete = async () => {
        await api.delete(`/transactions/${selectedTransaction._id}`);
        setTransactions((current) => current.filter((item) => item._id !== selectedTransaction._id));
        setSelectedTransaction(null);
    };

    const handleExport = () =>
        exportCsv(datedFilename("transactions"), [
            { label: "Date", value: (t) => csvDate(t.date) },
            { label: "Type", value: (t) => (t.type === "income" ? "Income" : "Expense") },
            { label: "Title", value: (t) => t.title },
            { label: "Category", value: (t) => t.category },
            { label: "Amount", value: (t) => t.amount },
            { label: "Planner", value: (t) => t.plannerId?.name || "" },
            { label: "Description", value: (t) => t.description }
        ], visibleTransactions);

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
                    <Link to="/transactions/add" className="dashboard-action">
                        + Add
                    </Link>
                </div>

            </header>

            {error && <div className="dashboard-error">{error}</div>}

            <section className="dashboard-section">
                <div className="section-heading">
                    <p>RECENT ACTIVITY</p>
                    <h2>Transactions</h2>
                </div>

                {transactions.length > 0 && (
                    <div className="filter-bar">
                        <SearchInput id="transactionSearch" value={search} onChange={setSearch} />
                        <FilterSelect
                            id="categoryFilter"
                            label="Category"
                            value={category}
                            onChange={setCategory}
                            options={getCategoryOptions(transactions)}
                        />
                        <FilterSelect
                            id="plannerFilter"
                            label="Planner"
                            value={planner}
                            onChange={setPlanner}
                            options={getPlannerOptions(transactions)}
                        />
                        <FilterSelect
                            id="sortOrder"
                            label="Sort by"
                            value={sort}
                            onChange={setSort}
                            options={SORT_OPTIONS}
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
                    <div className="planner-loading">Loading your transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="planner-empty-state">
                        <div className="empty-planner-icon">+</div>
                        <h3>No transactions yet</h3>
                        <p>Your spending and income will show up here.</p>
                    </div>
                ) : visibleTransactions.length === 0 ? (
                    <div className="filter-empty">No transactions match these filters.</div>
                ) : (
                    <div className="recent-transactions">
                        {visibleTransactions.map((transaction) => (
                            <div
                                className="recent-transaction clickable-transaction"
                                key={transaction._id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelectedTransaction(transaction)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        setSelectedTransaction(transaction);
                                    }
                                }}
                            >
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

            {selectedTransaction && (
                <TransactionDetailsModal
                    {...getTransactionDetails(selectedTransaction)}
                    onClose={() => setSelectedTransaction(null)}
                    onEdit={() => navigate(`/transactions/${selectedTransaction._id}/edit`)}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}

export default Transactions;
