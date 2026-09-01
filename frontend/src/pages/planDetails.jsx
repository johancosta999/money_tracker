import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function PlanDetails() {

    const { id } = useParams();

    const [planner, setPlanner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [weeklyBudgets, setWeeklyBudgets] = useState({});

    // =========================
    // Load planner
    // =========================

    useEffect(() => {

        const fetchPlanner = async () => {

            try {

                const response = await api.get(`/plan/${id}`);

                setPlanner(response.data);

                // Store existing weekly budgets
                const budgets = {};

                response.data.weeks?.forEach((week) => {
                    budgets[week.weekNumber] = week.budget || "";
                });

                setWeeklyBudgets(budgets);

            } catch (error) {

                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Couldn't load planner"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchPlanner();

    }, [id]);


    // =========================
    // Update weekly budget
    // =========================

    const handleBudgetChange = (weekNumber, value) => {

        setWeeklyBudgets({
            ...weeklyBudgets,
            [weekNumber]: value
        });

    };


    // =========================
    // Save weekly budget
    // =========================

    const saveWeeklyBudget = async (weekNumber) => {

        try {

            const budget = Number(
                weeklyBudgets[weekNumber]
            );

            if (budget < 0) {
                return;
            }

            await api.put(
                `/plan/${id}/week/${weekNumber}`,
                {
                    budget
                }
            );

            // Reload planner
            const response = await api.get(`/plan/${id}`);

            setPlanner(response.data);

            alert("Weekly budget updated!");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Couldn't update weekly budget"
            );

        }

    };


    // =========================
    // Loading
    // =========================

    if (loading) {

        return (

            <div className="planner-page">

                <div className="dashboard-loading">
                    Loading planner...
                </div>

            </div>

        );

    }


    // =========================
    // Error
    // =========================

    if (error || !planner) {

        return (

            <div className="planner-page">

                <Link
                    to="/planner"
                    className="back-button"
                >
                    ← Back to Planners
                </Link>

                <div className="dashboard-error">
                    {error || "Planner not found"}
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
                        to="/planner"
                        className="back-button"
                    >
                        ← Back to Planners
                    </Link>

                    <p className="dashboard-greeting">
                        MONTHLY PLANNER
                    </p>

                    <h1>
                        {planner.name}
                    </h1>

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


            {/* =========================
                Planner summary
            ========================= */}

            <section className="summary-grid">

                <div className="summary-card">

                    <div className="summary-icon">
                        ₹
                    </div>

                    <div>

                        <p>
                            Total Budget
                        </p>

                        <h3>
                            Rs.{" "}
                            {planner.totalBudget?.toLocaleString()}
                        </h3>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        4
                    </div>

                    <div>

                        <p>
                            Weeks
                        </p>

                        <h3>
                            {planner.weeks?.length || 0}
                        </h3>

                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        ●
                    </div>

                    <div>

                        <p>
                            Status
                        </p>

                        <h3>
                            {planner.status}
                        </h3>

                    </div>

                </div>

            </section>


            {/* =========================
                Categories
            ========================= */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>

                        <p>
                            Spending categories
                        </p>

                        <h2>
                            Your categories
                        </h2>

                    </div>

                </div>


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

            </section>


            {/* =========================
                Weekly Planner
            ========================= */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>

                        <p>
                            28-day spending plan
                        </p>

                        <h2>
                            Weekly Breakdown
                        </h2>

                    </div>

                </div>


                <div className="planner-weeks">

                    {planner.weeks?.map(
                        (week) => (

                            <div
                                className="week-card"
                                key={week._id}
                            >

                                {/* Week Header */}

                                <div className="week-card-header">

                                    <div>

                                        <span>
                                            WEEK {week.weekNumber}
                                        </span>

                                        <h2>

                                            {new Date(
                                                week.startDate
                                            ).toLocaleDateString()}

                                            {" — "}

                                            {new Date(
                                                week.endDate
                                            ).toLocaleDateString()}

                                        </h2>

                                    </div>


                                    <div className="budget">

                                        <small>
                                            Weekly Budget
                                        </small>

                                        <strong>
                                            Rs.{" "}
                                            {(week.budget || 0)
                                                .toLocaleString()}
                                        </strong>

                                    </div>

                                </div>


                                {/* Weekly Budget Input */}

                                <div className="planner-form">

                                    <label>
                                        Set Week {week.weekNumber} Budget
                                    </label>

                                    <div className="category-row">

                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="7500"
                                            value={
                                                weeklyBudgets[
                                                    week.weekNumber
                                                ] ?? ""
                                            }
                                            onChange={(e) =>
                                                handleBudgetChange(
                                                    week.weekNumber,
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                saveWeeklyBudget(
                                                    week.weekNumber
                                                )
                                            }
                                        >
                                            Save
                                        </button>

                                    </div>

                                </div>


                                {/* Weekly Spending */}

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

                                                <strong>
                                                    Rs. 0
                                                </strong>

                                                <small>
                                                    spent
                                                </small>

                                            </div>

                                        )
                                    )}

                                </div>


                                {/* Net Balance */}

                                <div className="balance-card">

                                    <div>

                                        <p>
                                            Week {week.weekNumber} Net Balance
                                        </p>

                                        <h2>
                                            Rs.{" "}
                                            {(week.budget || 0)
                                                .toLocaleString()}
                                        </h2>

                                    </div>

                                    <div className="balance-label">
                                        REMAINING
                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* =========================
                Transactions
            ========================= */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>

                        <p>
                            Keep your spending updated
                        </p>

                        <h2>
                            Transactions
                        </h2>

                    </div>

                </div>


                <div className="quick-actions">

                    <Link
                        to="/transactions"
                        className="quick-action-card"
                    >

                        <span className="quick-action-icon">
                            +
                        </span>

                        <div>

                            <h3>
                                Add Transaction
                            </h3>

                            <p>
                                Record income or expenses
                            </p>

                        </div>

                    </Link>

                </div>

            </section>

        </div>

    );

}

export default PlanDetails;
