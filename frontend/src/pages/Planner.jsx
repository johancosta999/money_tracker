import { useEffect, useState } from "react";
import api from "../services/api";

function Planner() {

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [weekStart, setWeekStart] = useState("");
    const [weekEnd, setWeekEnd] = useState("");
    const [totalBudget, setTotalBudget] = useState("");

    const [categories, setCategories] = useState([
        {
            category: "Food",
            plannedAmount: ""
        }
    ]);

    const [error, setError] = useState("");


    // Used for manual reloads (e.g. after creating a plan)
    const loadPlans = async () => {
        try {
            const response = await api.get("/plan");
            setPlans(response.data);
        } catch (error) {
            console.log(error);
            setError(
                error.response?.data?.message ||
                "Couldn't load plans"
            );
        } finally {
            setLoading(false);
        }
    };


    // Initial load — kept self-contained with an "ignore" guard
    // so we don't setState if the effect re-runs/unmounts first
    useEffect(() => {
        let ignore = false;

        const fetchPlans = async () => {
            try {
                const response = await api.get("/plan");
                if (!ignore) {
                    setPlans(response.data);
                }
            } catch (error) {
                console.log(error);
                if (!ignore) {
                    setError(
                        error.response?.data?.message ||
                        "Couldn't load plans"
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchPlans();

        return () => {
            ignore = true;
        };
    }, []);


    const addCategory = () => {

        setCategories([
            ...categories,
            {
                category: "",
                plannedAmount: ""
            }
        ]);

    };

    const updateCategory = (index, field, value) => {

        const updatedCategories = [...categories];

        updatedCategories[index][field] = value;

        setCategories(updatedCategories);

    };

    const removeCategory = (index) => {

        const updatedCategories = categories.filter(
            (_, i) => i !== index
        );

        setCategories(updatedCategories);

    };

    const createPlan = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await api.post("/plan", {

                weekStart,
                weekEnd,
                totalBudget: Number(totalBudget),

                categories: categories.map(item => ({
                    category: item.category,
                    plannedAmount: Number(item.plannedAmount)
                }))

            });

            setShowForm(false);

            setWeekStart("");
            setWeekEnd("");
            setTotalBudget("");

            setCategories([
                {
                    category: "Food",
                    plannedAmount: ""
                }
            ]);

            loadPlans();

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Couldn't create plan"
            );

        }

    };

    if (loading) {
        return <h2>Loading planner...</h2>;
    }

    return (

        <div className="planner-page">

            <div className="planner-header">

                <div>
                    <h1>Weekly Planner</h1>

                    <p>
                        Plan your money before you spend it.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                >
                    + New Plan
                </button>

            </div>


            {error && (
                <p className="error">
                    {error}
                </p>
            )}


            {showForm && (

                <div className="planner-form">

                    <h2>Create Weekly Plan</h2>

                    <form onSubmit={createPlan}>

                        <div className="date-row">

                            <div>
                                <label>
                                    Week Start
                                </label>

                                <input
                                    type="date"
                                    value={weekStart}
                                    onChange={(e) =>
                                        setWeekStart(e.target.value)
                                    }
                                    required
                                />
                            </div>


                            <div>
                                <label>
                                    Week End
                                </label>

                                <input
                                    type="date"
                                    value={weekEnd}
                                    onChange={(e) =>
                                        setWeekEnd(e.target.value)
                                    }
                                    required
                                />
                            </div>

                        </div>


                        <div>

                            <label>
                                Total Weekly Budget
                            </label>

                            <input
                                type="number"
                                placeholder="10000"
                                value={totalBudget}
                                onChange={(e) =>
                                    setTotalBudget(e.target.value)
                                }
                                required
                            />

                        </div>


                        <h3>Category Plans</h3>


                        {categories.map((item, index) => (

                            <div
                                className="category-row"
                                key={index}
                            >

                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={item.category}
                                    onChange={(e) =>
                                        updateCategory(
                                            index,
                                            "category",
                                            e.target.value
                                        )
                                    }
                                    required
                                />


                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={item.plannedAmount}
                                    onChange={(e) =>
                                        updateCategory(
                                            index,
                                            "plannedAmount",
                                            e.target.value
                                        )
                                    }
                                    required
                                />


                                {categories.length > 1 && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeCategory(index)
                                        }
                                    >
                                        ×
                                    </button>

                                )}

                            </div>

                        ))}


                        <button
                            type="button"
                            onClick={addCategory}
                        >
                            + Add Category
                        </button>


                        <button type="submit">
                            Create Plan
                        </button>

                    </form>

                </div>

            )}


            <div className="plans-container">

                {plans.length === 0 ? (

                    <div className="empty-planner">

                        <h2>No plans yet</h2>

                        <p>
                            Create your first weekly spending plan.
                        </p>

                    </div>

                ) : (

                    plans.map((plan) => (

                        <div
                            className="week-card"
                            key={plan._id}
                        >

                            <div className="week-card-header">

                                <div>

                                    <span>
                                        WEEKLY PLAN
                                    </span>

                                    <h2>
                                        {new Date(
                                            plan.weekStart
                                        ).toLocaleDateString()}
                                        {" — "}
                                        {new Date(
                                            plan.weekEnd
                                        ).toLocaleDateString()}
                                    </h2>

                                </div>

                                <div className="budget">

                                    <small>
                                        Weekly Budget
                                    </small>

                                    <strong>
                                        Rs. {plan.totalBudget}
                                    </strong>

                                </div>

                            </div>


                            <div className="category-grid">

                                {plan.categories.map(
                                    (category, index) => (

                                        <div
                                            className="category-card"
                                            key={index}
                                        >

                                            <span>
                                                {category.category}
                                            </span>

                                            <strong>
                                                Rs.{" "}
                                                {
                                                    category.plannedAmount
                                                }
                                            </strong>

                                            <small>
                                                planned
                                            </small>

                                        </div>

                                    )
                                )}

                            </div>


                            <button
                                onClick={() =>
                                    window.location.href =
                                    `/planner/${plan._id}`
                                }
                            >
                                View Plan →
                            </button>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}

export default Planner;