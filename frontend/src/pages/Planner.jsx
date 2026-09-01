import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Planner() {

    const [planners, setPlanners] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    // Planner form
    const [name, setName] = useState("");
    const [type, setType] = useState("monthly");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [totalBudget, setTotalBudget] = useState("");

    const defaultCategories = [
        "Food",
        "Transport",
        "Bills",
        "Shopping",
        "Education",
        "Entertainment",
        "Health"
    ];

    const [categories, setCategories] = useState(defaultCategories);

    const [newCategory, setNewCategory] = useState("");

    const [saving, setSaving] = useState(false);


    // =========================
    // Load planners
    // =========================

    useEffect(() => {

        const fetchPlanners = async () => {

            try {

                const response = await api.get("/plan");

                setPlanners(response.data);

            } catch (error) {

                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Couldn't load planners"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchPlanners();

    }, []);


    // =========================
    // Calculate end date
    // =========================

    const handleStartDateChange = (value) => {

        setStartDate(value);

        if (!value) {
            setEndDate("");
            return;
        }

        const date = new Date(value);

        date.setDate(date.getDate() + 30);

        const formattedDate =
            date.toISOString().split("T")[0];

        setEndDate(formattedDate);

    };


    // =========================
    // Add category
    // =========================

    const handleAddCategory = () => {

        const trimmedCategory = newCategory.trim();

        if (!trimmedCategory) {
            return;
        }

        if (
            categories.some(
                category =>
                    category.toLowerCase() ===
                    trimmedCategory.toLowerCase()
            )
        ) {
            return;
        }

        setCategories([
            ...categories,
            trimmedCategory
        ]);

        setNewCategory("");

    };


    // =========================
    // Remove category
    // =========================

    const handleRemoveCategory = (categoryToRemove) => {

        setCategories(
            categories.filter(
                category =>
                    category !== categoryToRemove
            )
        );

    };


    // =========================
    // Reset form
    // =========================

    const resetForm = () => {

        setName("");
        setType("monthly");
        setStartDate("");
        setEndDate("");
        setTotalBudget("");
        setCategories(defaultCategories);
        setNewCategory("");

    };


    // =========================
    // Create planner
    // =========================

    const handleCreatePlanner = async (e) => {

        e.preventDefault();

        setError("");
        setSaving(true);

        try {

            await api.post("/plan", {

                name,

                type,

                startDate,

                endDate,

                totalBudget: Number(totalBudget),

                categories

            });

            // Reload planners
            const response = await api.get("/plan");

            setPlanners(response.data);

            resetForm();

            setShowForm(false);

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Couldn't create planner"
            );

        } finally {

            setSaving(false);

        }

    };


    if (loading) {

        return (

            <div className="planner-page">

                <div className="dashboard-loading">
                    Loading planners...
                </div>

            </div>

        );

    }


    return (

        <div className="planner-page">


            {/* =========================
                Header
            ========================= */}

            <div className="planner-header">

                <div>

                    <Link
                        to="/dashboard"
                        className="back-button"
                    >
                        ← Dashboard
                    </Link>

                    <p className="dashboard-greeting">
                        Financial planning
                    </p>

                    <h1>
                        My Planners
                    </h1>

                    <p>
                        Plan your money before you spend it.
                    </p>

                </div>


                <button
                    onClick={() =>
                        setShowForm(!showForm)
                    }
                >
                    {showForm
                        ? "Close"
                        : "+ New Planner"
                    }
                </button>

            </div>


            {/* =========================
                Error
            ========================= */}

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>

            )}


            {/* =========================
                Create Planner
            ========================= */}

            {showForm && (

                <section className="planner-form">

                    <h2>
                        Create New Planner
                    </h2>

                    <p>
                        Set up your monthly spending plan.
                    </p>


                    <form
                        onSubmit={handleCreatePlanner}
                    >


                        {/* Planner name */}

                        <div>

                            <label>
                                Planner Name
                            </label>

                            <input
                                type="text"
                                placeholder="Salary Manager"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* Planner type */}

                        <div>

                            <label>
                                Planner Type
                            </label>

                            <div className="planner-type-options">

                                <button
                                    type="button"
                                    className="planner-type active"
                                    onClick={() =>
                                        setType("monthly")
                                    }
                                >
                                    Monthly
                                </button>


                                <button
                                    type="button"
                                    className="planner-type"
                                    disabled
                                >
                                    Weekly
                                </button>


                                <button
                                    type="button"
                                    className="planner-type"
                                    disabled
                                >
                                    Yearly
                                </button>

                            </div>

                        </div>


                        {/* Dates */}

                        <div className="date-row">


                            <div>

                                <label>
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        handleStartDateChange(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <label>
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    value={endDate}
                                    readOnly
                                />

                                <small>
                                    Automatically calculated
                                    as 30 days.
                                </small>

                            </div>


                        </div>


                        {/* Total budget */}

                        <div>

                            <label>
                                Total Budget
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="20000"
                                value={totalBudget}
                                onChange={(e) =>
                                    setTotalBudget(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        {/* Categories */}

                        <div>

                            <h3>
                                Categories
                            </h3>

                            <p>
                                Choose the categories you want
                                to track.
                            </p>


                            <div className="category-list">

                                {categories.map(
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
                                            >
                                                ×
                                            </button>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* New category */}

                            <div className="add-category">

                                <input
                                    type="text"
                                    placeholder="Add custom category"
                                    value={newCategory}
                                    onChange={(e) =>
                                        setNewCategory(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {

                                        if (
                                            e.key === "Enter"
                                        ) {

                                            e.preventDefault();

                                            handleAddCategory();

                                        }

                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleAddCategory
                                    }
                                >
                                    + Add
                                </button>

                            </div>

                        </div>


                        {/* Save */}

                        <button
                            type="submit"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Planner"
                            }

                        </button>

                    </form>

                </section>

            )}


            {/* =========================
                Planner list
            ========================= */}

            {!showForm && (

                <section className="plans-container">

                    {planners.length === 0 ? (

                        <div className="empty-planner">

                            <h2>
                                No planners yet
                            </h2>

                            <p>
                                Create your first monthly
                                spending planner.
                            </p>

                            <button
                                onClick={() =>
                                    setShowForm(true)
                                }
                            >
                                + Create Planner
                            </button>

                        </div>

                    ) : (

                        planners.map((planner) => (

                            <div
                                className="week-card"
                                key={planner._id}
                            >

                                <div className="week-card-header">

                                    <div>

                                        <span>
                                            MONTHLY PLANNER
                                        </span>

                                        <h2>
                                            {planner.name}
                                        </h2>

                                        <p>
                                            {new Date(
                                                planner.startDate
                                            ).toLocaleDateString()}
                                            {" — "}
                                            {new Date(
                                                planner.endDate
                                            ).toLocaleDateString()}
                                        </p>

                                    </div>


                                    <div className="budget">

                                        <small>
                                            Total Budget
                                        </small>

                                        <strong>
                                            Rs.{" "}
                                            {planner.totalBudget?.toLocaleString()}
                                        </strong>

                                    </div>

                                </div>


                                {/* Categories */}

                                <div className="category-grid">

                                    {planner.categories?.map(
                                        (category) => (

                                            <div
                                                className="category-card"
                                                key={category}
                                            >

                                                <span>
                                                    {category}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>


                                {/* Weeks */}

                                <div className="planner-weeks">

                                    {planner.weeks?.map(
                                        (week) => (

                                            <div
                                                className="category-card"
                                                key={week._id}
                                            >

                                                <small>
                                                    WEEK{" "}
                                                    {week.weekNumber}
                                                </small>

                                                <strong>
                                                    Rs.{" "}
                                                    {week.budget?.toLocaleString()}
                                                </strong>

                                                <span>

                                                    {new Date(
                                                        week.startDate
                                                    ).toLocaleDateString()}

                                                    {" — "}

                                                    {new Date(
                                                        week.endDate
                                                    ).toLocaleDateString()}

                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>


                                <Link
                                    to={`/planner/${planner._id}`}
                                    className="dashboard-action"
                                >
                                    Open Planner →
                                </Link>

                            </div>

                        ))

                    )}

                </section>

            )}

        </div>

    );

}

export default Planner;
