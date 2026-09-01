import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Planner.css";

function Planner() {
    const navigate = useNavigate();

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

    const [plans, setPlans] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        type: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        totalBudget: "",
        categories: defaultCategories
    });

    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // GET PLANNERS
    // =====================================================

    const fetchPlans = async (ignore) => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/plan",
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
                    data.message || "Couldn't load planners"
                );
            }

            // Ignore stale responses if the effect re-ran / unmounted
            if (ignore?.current) {
                return;
            }

            setPlans(data);
        } catch (error) {
            if (ignore?.current) {
                return;
            }
            setError(error.message);
        } finally {
            if (!ignore?.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const ignore = { current: false };

        // fetchPlans awaits before calling any setState, so this does not
        // synchronously set state during the effect - it's the documented
        // "fetch data on mount" pattern from the React docs.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPlans(ignore);

        return () => {
            ignore.current = true;
        };
    }, []);

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================================
    // ADD CATEGORY
    // =====================================================

    const handleAddCategory = () => {
        const category = newCategory.trim();

        if (!category) {
            return;
        }

        const alreadyExists = formData.categories.some(
            (item) => item.toLowerCase() === category.toLowerCase()
        );

        if (alreadyExists) {
            setError("This category already exists.");
            return;
        }

        setFormData((previous) => ({
            ...previous,
            categories: [...previous.categories, category]
        }));

        setNewCategory("");
        setError("");
    };

    // =====================================================
    // REMOVE CATEGORY
    // =====================================================

    const handleRemoveCategory = (categoryToRemove) => {
        setFormData((previous) => ({
            ...previous,
            categories: previous.categories.filter(
                (category) => category !== categoryToRemove
            )
        }));
    };

    // =====================================================
    // CREATE PLANNER
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError("Please enter a planner name.");
            return;
        }

        if (!formData.startDate) {
            setError("Please select a start date.");
            return;
        }

        if (
            !formData.totalBudget ||
            Number(formData.totalBudget) < 0
        ) {
            setError("Please enter a valid total budget.");
            return;
        }

        if (formData.categories.length === 0) {
            setError("Please add at least one category.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/plan",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        type: "monthly",
                        startDate: formData.startDate,
                        totalBudget: Number(formData.totalBudget),
                        categories: formData.categories
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Couldn't create planner"
                );
            }

            setSuccess("Planner created successfully!");

            // Add newly created planner to the list
            setPlans((previous) => [
                data.planner,
                ...previous
            ]);

            // Reset form
            setFormData({
                name: "",
                type: "monthly",
                startDate: new Date()
                    .toISOString()
                    .split("T")[0],
                totalBudget: "",
                categories: defaultCategories
            });

            setNewCategory("");

            // Close form after short delay
            setTimeout(() => {
                setShowCreateForm(false);
                setSuccess("");
            }, 1000);

        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="planner-loading">
                Loading your planners...
            </div>
        );
    }

    return (
        <div className="planner-page">

            {/* =========================================
                TOP
            ========================================= */}

            <header className="planner-header">

                <div>
                    <Link
                        to="/dashboard"
                        className="planner-back-link"
                    >
                        ← Back to Dashboard
                    </Link>

                    <p className="planner-label">
                        MONEY TRACKER
                    </p>

                    <h1>Planner</h1>

                    <p className="planner-subtitle">
                        Plan your spending and stay in control.
                    </p>
                </div>

                <button
                    className="add-plan-button"
                    onClick={() => {
                        setShowCreateForm(!showCreateForm);
                        setError("");
                        setSuccess("");
                    }}
                >
                    <span>+</span>
                    Add New Plan
                </button>

            </header>

            {/* =========================================
                ERROR
            ========================================= */}

            {error && (
                <div className="planner-message error-message">
                    {error}
                </div>
            )}

            {/* =========================================
                SUCCESS
            ========================================= */}

            {success && (
                <div className="planner-message success-message">
                    {success}
                </div>
            )}

            {/* =========================================
                CREATE PLANNER
            ========================================= */}

            {showCreateForm && (
                <section className="create-planner-card">

                    <div className="create-planner-heading">
                        <div>
                            <p className="planner-label">
                                NEW PLAN
                            </p>

                            <h2>Create Planner</h2>

                            <p>
                                Set up your monthly spending plan.
                            </p>
                        </div>
                    </div>

                    <form
                        className="planner-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Planner Name */}

                        <div className="planner-input-group">

                            <label htmlFor="name">
                                Planner Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="e.g. Salary Manager"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={saving}
                            />

                        </div>

                        {/* Planner Type */}

                        <div className="planner-input-group">

                            <label>
                                Planner Type
                            </label>

                            <div className="planner-type-selector">

                                <button
                                    type="button"
                                    className="planner-type-button active"
                                >
                                    ✓ Monthly
                                </button>

                                <button
                                    type="button"
                                    className="planner-type-button disabled"
                                    disabled
                                >
                                    Weekly
                                </button>

                                <button
                                    type="button"
                                    className="planner-type-button disabled"
                                    disabled
                                >
                                    Yearly
                                </button>

                            </div>

                        </div>

                        {/* Start Date */}

                        <div className="planner-form-row">

                            <div className="planner-input-group">

                                <label htmlFor="startDate">
                                    Start Date
                                </label>

                                <input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>

                            {/* End Date */}

                            <div className="planner-input-group">

                                <label>
                                    End Date
                                </label>

                                <div className="calculated-date">
                                    {formData.startDate
                                        ? formatDate(
                                            new Date(
                                                new Date(
                                                    formData.startDate
                                                ).setDate(
                                                    new Date(
                                                        formData.startDate
                                                    ).getDate() + 30
                                                )
                                            )
                                        )
                                        : "Select a start date"
                                    }
                                </div>

                                <span className="input-hint">
                                    Automatically calculated as 30 days.
                                </span>

                            </div>

                        </div>

                        {/* Total Budget */}

                        <div className="planner-input-group">

                            <label htmlFor="totalBudget">
                                Total Budget
                            </label>

                            <div className="planner-amount-input">

                                <span>LKR</span>

                                <input
                                    id="totalBudget"
                                    name="totalBudget"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="20,000"
                                    value={formData.totalBudget}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>

                        </div>

                        {/* Categories */}

                        <div className="planner-input-group">

                            <label>
                                Categories
                            </label>

                            <div className="category-list">

                                {formData.categories.map(
                                    (category) => (
                                        <div
                                            className="category-tag"
                                            key={category}
                                        >
                                            <span>
                                                {category}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveCategory(
                                                        category
                                                    )
                                                }
                                                disabled={saving}
                                                aria-label={`Remove ${category}`}
                                            >
                                                ×
                                            </button>

                                        </div>
                                    )
                                )}

                            </div>

                            <div className="add-category-row">

                                <input
                                    type="text"
                                    placeholder="Add new category..."
                                    value={newCategory}
                                    onChange={(e) =>
                                        setNewCategory(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }
                                    }}
                                    disabled={saving}
                                />

                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    disabled={saving}
                                >
                                    + Add
                                </button>

                            </div>

                            <span className="input-hint">
                                Remove default categories or add your own.
                            </span>

                        </div>

                        {/* Save */}

                        <button
                            type="submit"
                            className="save-planner-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving Planner..."
                                : "Save Planner"
                            }
                        </button>

                    </form>

                </section>
            )}

            {/* =========================================
                PLANNER LIST
            ========================================= */}

            <section className="planner-list-section">

                <div className="planner-section-heading">

                    <div>
                        <p className="planner-label">
                            YOUR PLANS
                        </p>

                        <h2>
                            {plans.length > 0
                                ? "Your Planners"
                                : "No Planners Yet"
                            }
                        </h2>
                    </div>

                </div>

                {plans.length === 0 ? (

                    <div className="planner-empty-state">

                        <div className="empty-planner-icon">
                            +
                        </div>

                        <h3>
                            Create your first planner
                        </h3>

                        <p>
                            Set a budget, choose your categories,
                            and start tracking your spending.
                        </p>

                        <button
                            className="empty-create-button"
                            onClick={() => {
                                setShowCreateForm(true);
                                setError("");
                            }}
                        >
                            Create Planner
                        </button>

                    </div>

                ) : (

                    <div className="planner-list">

                        {plans.map((plan) => (

                            <div
                                className="planner-card"
                                key={plan._id}
                                onClick={() =>
                                    navigate(
                                        `/planner/${plan._id}`
                                    )
                                }
                            >

                                <div className="planner-card-top">

                                    <div>
                                        <p className="planner-card-type">
                                            MONTHLY PLAN
                                        </p>

                                        <h3>
                                            {plan.name}
                                        </h3>
                                    </div>

                                    <span className="planner-status">
                                        {plan.status || "active"}
                                    </span>

                                </div>

                                <div className="planner-card-dates">
                                    <span>
                                        {formatDate(plan.startDate)}
                                    </span>

                                    <span>→</span>

                                    <span>
                                        {formatDate(plan.endDate)}
                                    </span>
                                </div>

                                <div className="planner-card-budget">

                                    <div>
                                        <span>
                                            Total Budget
                                        </span>

                                        <strong>
                                            Rs.{" "}
                                            {Number(
                                                plan.totalBudget
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                    <span className="planner-card-arrow">
                                        →
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default Planner;
