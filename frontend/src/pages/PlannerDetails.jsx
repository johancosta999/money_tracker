import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./PlannerDetails.css";

function PlannerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [planner, setPlanner] = useState(null);
    const [weeklySummary, setWeeklySummary] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [remainingBudget, setRemainingBudget] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingWeek, setEditingWeek] = useState(null);
    const [weekBudget, setWeekBudget] = useState("");
    const [savingWeek, setSavingWeek] = useState(false);

    const token = localStorage.getItem("token");

    // =============================================
    // FETCH PLANNER SUMMARY
    // =============================================

    const fetchPlannerSummary = async (ignore) => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/plan/${id}/summary`,
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
                    data.message || "Couldn't load planner"
                );
            }

            // Ignore stale responses (e.g. id changed before this resolved)
            if (ignore?.current) {
                return;
            }

            setPlanner(data.planner);
            setWeeklySummary(data.weeklySummary || []);
            setTotalSpent(data.totalSpent || 0);
            setRemainingBudget(data.remainingBudget || 0);

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

        // fetchPlannerSummary awaits before calling any setState, so this
        // does not synchronously set state during the effect - it's the
        // documented "fetch data on mount/param change" pattern.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPlannerSummary(ignore);

        return () => {
            ignore.current = true;
        };
    }, [id]);

    // =============================================
    // START EDITING WEEK BUDGET
    // =============================================

    const handleEditWeek = (week) => {
        setEditingWeek(week.weekNumber);
        setWeekBudget(week.budget);
        setError("");
    };

    // =============================================
    // SAVE WEEKLY BUDGET
    // =============================================

    const handleSaveWeekBudget = async (week) => {
        if (weekBudget === "" || Number(weekBudget) < 0) {
            setError("Please enter a valid weekly budget.");
            return;
        }

        const weekId = week?.id || week?._id;

        if (!weekId) {
            setError("This week could not be updated because its id is missing.");
            return;
        }

        setSavingWeek(true);
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/plan/${id}/weeks/${weekId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        budget: Number(weekBudget)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Couldn't update weekly budget"
                );
            }

            setEditingWeek(null);
            setWeekBudget("");

            // Refresh the summary
            await fetchPlannerSummary();

        } catch (error) {
            setError(error.message);
        } finally {
            setSavingWeek(false);
        }
    };

    // =============================================
    // FORMAT DATE
    // =============================================

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // =============================================
    // LOADING
    // =============================================

    if (loading) {
        return (
            <div className="planner-details-loading">
                Loading planner...
            </div>
        );
    }

    // =============================================
    // PAGE
    // =============================================

    return (
        <div className="planner-details-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <header className="planner-details-header">

                <Link
                    to="/planner"
                    className="planner-back-link"
                >
                    ← Back to Planners
                </Link>

                {planner && (
                    <>
                        <p className="planner-details-label">
                            MONTHLY PLANNER
                        </p>

                        <h1>{planner.name}</h1>

                        <p className="planner-period">
                            {formatDate(planner.startDate)}
                            {" — "}
                            {formatDate(planner.endDate)}
                        </p>
                    </>
                )}

            </header>

            {/* =====================================
                ERROR
            ===================================== */}

            {error && (
                <div className="planner-details-error">
                    {error}
                </div>
            )}

            {/* =====================================
                OVERVIEW
            ===================================== */}

            {planner && (
                <section className="planner-overview">

                    <div className="overview-card">
                        <p>Total Budget</p>
                        <h2>
                            Rs. {Number(planner.totalBudget).toLocaleString()}
                        </h2>
                    </div>

                    <div className="overview-card">
                        <p>Total Spent</p>
                        <h2>
                            Rs. {Number(totalSpent).toLocaleString()}
                        </h2>
                    </div>

                    <div
                        className={
                            remainingBudget < 0
                                ? "overview-card danger"
                                : "overview-card"
                        }
                    >
                        <p>Remaining</p>
                        <h2>
                            Rs. {Number(remainingBudget).toLocaleString()}
                        </h2>
                    </div>

                </section>
            )}

            {/* =====================================
                WEEKS
            ===================================== */}

            <section className="weeks-section">

                <div className="section-heading">
                    <p>WEEKLY BREAKDOWN</p>
                    <h2>Your 4 Weeks</h2>
                </div>

                <div className="weeks-grid">

                    {weeklySummary.map((week) => {

                        const isOverBudget =
                            week.remaining < 0;

                        const progress =
                            week.budget > 0
                                ? Math.min(
                                    (week.spent / week.budget) * 100,
                                    100
                                )
                                : 0;

                        return (
                            <div
                                className={
                                    isOverBudget
                                        ? "week-card over-budget"
                                        : "week-card"
                                }
                                key={week.weekNumber}
                            >

                                {/* WEEK HEADER */}

                                <div className="week-card-header">

                                    <div>
                                        <p className="week-number">
                                            WEEK {week.weekNumber}
                                        </p>

                                        <h3>
                                            {formatDate(
                                                week.startDate
                                            )}
                                            {" — "}
                                            {formatDate(
                                                week.endDate
                                            )}
                                        </h3>
                                    </div>

                                    <div
                                        className={
                                            isOverBudget
                                                ? "week-status danger-status"
                                                : "week-status"
                                        }
                                    >
                                        {isOverBudget
                                            ? "Over Budget"
                                            : "Within Budget"}
                                    </div>

                                </div>

                                {/* BUDGET */}

                                <div className="week-budget-area">

                                    <div>
                                        <p>Weekly Budget</p>

                                        {editingWeek ===
                                        week.weekNumber ? (
                                            <div className="budget-edit">

                                                <div className="budget-input">
                                                    <span>Rs.</span>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={weekBudget}
                                                        onChange={(e) =>
                                                            setWeekBudget(
                                                                e.target.value
                                                            )
                                                        }
                                                        autoFocus
                                                    />
                                                </div>

                                                <div className="budget-actions">

                                                    <button
                                                        onClick={() =>
                                                            handleSaveWeekBudget(
                                                                week
                                                            )
                                                        }
                                                        disabled={
                                                            savingWeek
                                                        }
                                                    >
                                                        {savingWeek
                                                            ? "Saving..."
                                                            : "Save"}
                                                    </button>

                                                    <button
                                                        className="cancel-budget"
                                                        onClick={() => {
                                                            setEditingWeek(
                                                                null
                                                            );
                                                            setWeekBudget(
                                                                ""
                                                            );
                                                        }}
                                                        disabled={
                                                            savingWeek
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </div>
                                        ) : (
                                            <div className="budget-display">

                                                <h4>
                                                    Rs.{" "}
                                                    {Number(
                                                        week.budget
                                                    ).toLocaleString()}
                                                </h4>

                                                <button
                                                    onClick={() =>
                                                        handleEditWeek(
                                                            week
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                            </div>
                                        )}

                                    </div>

                                </div>

                                {/* SPENDING */}

                                <div className="week-spending">

                                    <div className="spending-row">
                                        <span>Spent</span>

                                        <strong>
                                            Rs.{" "}
                                            {Number(
                                                week.spent
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                    <div className="spending-row">
                                        <span>
                                            Net Balance
                                        </span>

                                        <strong
                                            className={
                                                isOverBudget
                                                    ? "negative"
                                                    : "positive"
                                            }
                                        >
                                            Rs.{" "}
                                            {Number(
                                                week.remaining
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                </div>

                                {/* PROGRESS */}

                                <div className="week-progress">

                                    <div className="progress-label">
                                        <span>
                                            Budget Used
                                        </span>

                                        <span>
                                            {Math.round(progress)}%
                                        </span>
                                    </div>

                                    <div className="progress-bar">
                                        <div
                                            className={
                                                isOverBudget
                                                    ? "progress-fill danger-fill"
                                                    : "progress-fill"
                                            }
                                            style={{
                                                width: `${progress}%`
                                            }}
                                        />
                                    </div>

                                </div>

                                {/* STATUS */}

                                <div
                                    className={
                                        isOverBudget
                                            ? "week-result danger-result"
                                            : "week-result"
                                    }
                                >
                                    {isOverBudget
                                        ? `You overspent by Rs. ${Math.abs(
                                            week.remaining
                                        ).toLocaleString()}`
                                        : `Rs. ${Number(
                                            week.remaining
                                        ).toLocaleString()} remaining`}
                                </div>

                                {/* ADD TRANSACTION */}

                                <Link
                                    to="/transactions/add"
                                    className="week-add-transaction"
                                >
                                    + Add Transaction
                                </Link>

                            </div>
                        );
                    })}

                </div>

            </section>

        </div>
    );
}

export default PlannerDetails
