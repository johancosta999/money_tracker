import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function PlanDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        let ignore = false;

        const fetchPlan = async () => {

            try {

                const response = await api.get(
                    `/plan/${id}/summary`
                );

                if (!ignore) {
                    setPlan(response.data);
                }

            } catch (error) {

                console.log(error);

                if (!ignore) {
                    setError(
                        error.response?.data?.message ||
                        "Couldn't load plan"
                    );
                }

            } finally {

                if (!ignore) {
                    setLoading(false);
                }

            }
        };

        fetchPlan();

        return () => {
            ignore = true;
        };

    }, [id]);


    if (loading) {
        return (
            <div className="plan-details-page">
                <h2>Loading plan...</h2>
            </div>
        );
    }


    if (error) {
        return (
            <div className="plan-details-page">

                <button onClick={() => navigate("/planner")}>
                    ← Back to Planner
                </button>

                <p className="error">
                    {error}
                </p>

            </div>
        );
    }


    if (!plan) {
        return null;
    }


    return (

        <div className="plan-details-page">

            {/* HEADER */}

            <div className="plan-details-header">

                <div>

                    <button
                        className="back-button"
                        onClick={() => navigate("/planner")}
                    >
                        ← Back to Planner
                    </button>

                    <span className="plan-label">
                        WEEKLY PLAN
                    </span>

                    <h1>
                        {new Date(
                            plan.weekStart
                        ).toLocaleDateString()}
                        {" — "}
                        {new Date(
                            plan.weekEnd
                        ).toLocaleDateString()}
                    </h1>

                    <p>
                        Here's how your spending compares
                        with your weekly plan.
                    </p>

                </div>

            </div>


            {/* SUMMARY CARDS */}

            <div className="summary-grid">

                <div className="summary-card">

                    <span>
                        WEEKLY BUDGET
                    </span>

                    <strong>
                        Rs. {plan.planned}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        ACTUAL SPENDING
                    </span>

                    <strong>
                        Rs. {plan.actual}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        REMAINING
                    </span>

                    <strong
                        className={
                            plan.remaining < 0
                                ? "negative"
                                : ""
                        }
                    >
                        Rs. {plan.remaining}
                    </strong>

                </div>

            </div>


            {/* PROGRESS */}

            <div className="progress-section">

                <div className="progress-header">

                    <div>
                        <span>
                            BUDGET USED
                        </span>

                        <h2>
                            {plan.percentageUsed}%
                        </h2>
                    </div>

                    <span>
                        Rs. {plan.actual} / Rs. {plan.planned}
                    </span>

                </div>


                <div className="progress-track">

                    <div
                        className={
                            plan.percentageUsed > 100
                                ? "progress-fill over-budget"
                                : "progress-fill"
                        }
                        style={{
                            width: `${Math.min(
                                plan.percentageUsed,
                                100
                            )}%`
                        }}
                    />

                </div>

            </div>


            {/* CATEGORY BREAKDOWN */}

            <div className="category-section">

                <div className="section-header">

                    <div>
                        <span>
                            BREAKDOWN
                        </span>

                        <h2>
                            Category Spending
                        </h2>
                    </div>

                </div>


                <div className="plan-category-list">

                    {plan.categories.map(
                        (category, index) => {

                            const percentage =
                                category.planned > 0
                                    ? (
                                        category.actual /
                                        category.planned
                                    ) * 100
                                    : 0;

                            return (

                                <div
                                    className="plan-category"
                                    key={index}
                                >

                                    <div className="category-info">

                                        <div>

                                            <strong>
                                                {category.category}
                                            </strong>

                                            <small>
                                                Rs.{" "}
                                                {category.actual}
                                                {" / "}
                                                {category.planned}
                                            </small>

                                        </div>

                                        <div className="category-remaining">

                                            <small>
                                                Remaining
                                            </small>

                                            <strong
                                                className={
                                                    category.remaining < 0
                                                        ? "negative"
                                                        : ""
                                                }
                                            >
                                                Rs.{" "}
                                                {category.remaining}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="category-progress">

                                        <div
                                            className={
                                                percentage > 100
                                                    ? "category-progress-fill over-budget"
                                                    : "category-progress-fill"
                                            }
                                            style={{
                                                width: `${Math.min(
                                                    percentage,
                                                    100
                                                )}%`
                                            }}
                                        />

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>

        </div>

    );
}

export default PlanDetails;