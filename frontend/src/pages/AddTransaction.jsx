import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AddTransaction.css";

const defaultCategories = [
    "Education",
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Sanitoring",
    "Sports",
    "Debt",
    "Others"
];

function AddTransaction() {
    const navigate = useNavigate();

    const [plannerOptions, setPlannerOptions] = useState([]);
    const [selectedPlannerId, setSelectedPlannerId] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "expense",
        category: defaultCategories[0],
        date: new Date().toISOString().split("T")[0],
        description: ""
    });

    const selectedPlanner = plannerOptions.find((planner) => planner._id === selectedPlannerId)
        || plannerOptions[0]
        || null;

    const availableCategories = selectedPlanner?.categories?.length
        ? selectedPlanner.categories
        : defaultCategories;

    const [loading, setLoading] = useState(false);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchPlans = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/plan`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Couldn't load planners");
                }

                const sortedPlans = [...data].sort(
                    (a, b) => new Date(b.startDate) - new Date(a.startDate)
                );

                setPlannerOptions(sortedPlans);

                if (sortedPlans.length > 0) {
                    const newestPlanner = sortedPlans[0];
                    setSelectedPlannerId(newestPlanner._id);

                    const categories = newestPlanner.categories?.length
                        ? newestPlanner.categories
                        : defaultCategories;

                    setFormData((previous) => ({
                        ...previous,
                        category: categories.includes(previous.category)
                            ? previous.category
                            : categories[0] || defaultCategories[0]
                    }));
                }
            } catch (fetchError) {
                setError(fetchError.message);
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchPlans();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleTypeChange = (type) => {
        setFormData((previous) => ({
            ...previous,
            type
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.title.trim()) {
            setError("Please enter a transaction title.");
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter a description.");
            return;
        }

        if (!selectedPlannerId) {
            setError("Create a planner before adding a transaction.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/transactions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: formData.title.trim(),
                        amount: Number(formData.amount),
                        type: formData.type,
                        category: formData.category,
                        date: formData.date,
                        description: formData.description.trim(),
                        plannerId: selectedPlannerId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Couldn't create transaction");
            }

            setSuccess("Transaction added successfully!");

            setTimeout(() => {
                navigate("/transactions");
            }, 800);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-transaction-page">
            <div className="add-transaction-card">
                <div className="add-transaction-header">
                    <Link to="/dashboard" className="back-link">
                        ← Dashboard
                    </Link>

                    <div className="transaction-title">
                        <div className="transaction-title-icon">+</div>

                        <div>
                            <p className="transaction-label">MONEY TRACKER</p>
                            <h1>Add Transaction</h1>
                            <p>Record your income or expense.</p>
                        </div>
                    </div>
                </div>

                {error && <div className="transaction-message error-message">{error}</div>}
                {success && <div className="transaction-message success-message">{success}</div>}

                {!loadingPlans && plannerOptions.length === 0 && (
                    <div className="transaction-message error-message">
                        You need to create a planner before adding transactions.
                    </div>
                )}

                <form className="transaction-form" onSubmit={handleSubmit}>
                    {plannerOptions.length > 0 && (
                        <div className="input-group">
                            <label htmlFor="plannerId">Planner</label>
                            <select
                                id="plannerId"
                                value={selectedPlannerId}
                                onChange={(e) => setSelectedPlannerId(e.target.value)}
                                disabled={loading}
                            >
                                {plannerOptions.map((planner) => (
                                    <option key={planner._id} value={planner._id}>
                                        {planner.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="title">Transaction Title</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g. Grocery shopping"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={loading || plannerOptions.length === 0}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="amount">Amount</label>
                        <div className="amount-input">
                            <span>LKR</span>
                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                disabled={loading || plannerOptions.length === 0}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Transaction Type</label>
                        <div className="type-selector">
                            <button
                                type="button"
                                className={
                                    formData.type === "expense"
                                        ? "type-button active expense-type"
                                        : "type-button"
                                }
                                onClick={() => handleTypeChange("expense")}
                                disabled={loading || plannerOptions.length === 0}
                            >
                                <span>↓</span>
                                Expense
                            </button>

                            <button
                                type="button"
                                className={
                                    formData.type === "income"
                                        ? "type-button active income-type"
                                        : "type-button"
                                }
                                onClick={() => handleTypeChange("income")}
                                disabled={loading || plannerOptions.length === 0}
                            >
                                <span>↑</span>
                                Income
                            </button>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={loading || plannerOptions.length === 0}
                            >
                                {availableCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                disabled={loading || plannerOptions.length === 0}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Add some details about this transaction..."
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={loading || plannerOptions.length === 0}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-transaction"
                        disabled={loading || plannerOptions.length === 0}
                    >
                        {loading ? "Adding Transaction..." : "Add Transaction"}
                    </button>
                </form>

                <Link to="/dashboard" className="cancel-link">
                    Cancel
                </Link>
            </div>
        </div>
    );
}

export default AddTransaction;
