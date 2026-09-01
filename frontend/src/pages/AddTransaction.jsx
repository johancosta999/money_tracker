import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AddTransaction.css";

function AddTransaction() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "expense",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        description: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const categories = [
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

        // Basic frontend validation
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

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/transactions",
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
                        description: formData.description.trim()

                        // plannerId is intentionally not sent.
                        // Your backend automatically finds
                        // the correct planner for the date.
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Couldn't create transaction"
                );
            }

            setSuccess("Transaction added successfully!");

            // Give the user a moment to see the success message
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-transaction-page">

            <div className="add-transaction-card">

                {/* Header */}
                <div className="add-transaction-header">

                    <Link
                        to="/dashboard"
                        className="back-link"
                    >
                        ← Dashboard
                    </Link>

                    <div className="transaction-title">
                        <div className="transaction-title-icon">
                            +
                        </div>

                        <div>
                            <p className="transaction-label">
                                MONEY TRACKER
                            </p>

                            <h1>Add Transaction</h1>

                            <p>
                                Record your income or expense.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Messages */}
                {error && (
                    <div className="transaction-message error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="transaction-message success-message">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form
                    className="transaction-form"
                    onSubmit={handleSubmit}
                >

                    {/* Title */}
                    <div className="input-group">
                        <label htmlFor="title">
                            Transaction Title
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g. Grocery shopping"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {/* Amount */}
                    <div className="input-group">
                        <label htmlFor="amount">
                            Amount
                        </label>

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
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Type */}
                    <div className="input-group">
                        <label>
                            Transaction Type
                        </label>

                        <div className="type-selector">

                            <button
                                type="button"
                                className={
                                    formData.type === "expense"
                                        ? "type-button active expense-type"
                                        : "type-button"
                                }
                                onClick={() =>
                                    handleTypeChange("expense")
                                }
                                disabled={loading}
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
                                onClick={() =>
                                    handleTypeChange("income")
                                }
                                disabled={loading}
                            >
                                <span>↑</span>
                                Income
                            </button>

                        </div>
                    </div>

                    {/* Category + Date */}
                    <div className="form-row">

                        <div className="input-group">
                            <label htmlFor="category">
                                Category
                            </label>

                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                {categories.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="date">
                                Date
                            </label>

                            <input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <div className="input-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            placeholder="Add some details about this transaction..."
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="submit-transaction"
                        disabled={loading}
                    >
                        {loading
                            ? "Adding Transaction..."
                            : "Add Transaction"}
                    </button>

                </form>

                {/* Cancel */}
                <Link
                    to="/dashboard"
                    className="cancel-link"
                >
                    Cancel
                </Link>

            </div>

        </div>
    );
}

export default AddTransaction;
