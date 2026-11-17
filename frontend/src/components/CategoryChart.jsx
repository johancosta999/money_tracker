import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";
import FilterSelect from "./FilterSelect";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

// Dashboard card: how much was spent in each category, as horizontal bars.
// "All planners" follows the dashboard totals; picking a planner shows its whole spending.
function CategoryChart() {
    const [planners, setPlanners] = useState([]);
    const [plannerId, setPlannerId] = useState("all");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/plan")
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : [];
                setPlanners([...list].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
            })
            .catch(() => {}); // The chart still works for "All planners"
    }, []);

    useEffect(() => {
        let ignore = false;

        api.get("/dashboard/categories", {
            params: plannerId === "all" ? {} : { plannerId }
        })
            .then(({ data }) => {
                if (ignore) return;
                setRows(Array.isArray(data) ? data : []);
                setError("");
            })
            .catch((fetchError) => {
                if (!ignore) setError(getErrorMessage(fetchError, "Couldn't load spending by category"));
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [plannerId]);

    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const largest = rows[0]?.total || 0;

    return (
        <section className="dashboard-section category-chart">
            <div className="category-chart-heading">
                <div className="section-heading">
                    <p>WHERE YOUR MONEY GOES</p>
                    <h2>Spending by Category</h2>
                </div>

                <FilterSelect
                    id="chartPlanner"
                    label="Planner"
                    value={plannerId}
                    onChange={(value) => {
                        setLoading(true);
                        setPlannerId(value);
                    }}
                    options={[
                        { value: "all", label: "All planners" },
                        ...planners.map((planner) => ({ value: planner._id, label: planner.name }))
                    ]}
                />
            </div>

            {error ? (
                <div className="filter-empty">{error}</div>
            ) : loading ? (
                <div className="filter-empty">Loading...</div>
            ) : rows.length === 0 ? (
                <div className="filter-empty">No expenses yet. Your spending will show up here.</div>
            ) : (
                <ul className="category-bars" aria-label="Spending by category">
                    {rows.map((row) => {
                        const share = total ? Math.round((row.total / total) * 100) : 0;
                        // Bars are scaled to the biggest category so small ones stay visible
                        const width = largest ? Math.max(2, (row.total / largest) * 100) : 0;

                        return (
                            <li className="category-bar-row" key={row.category}>
                                <div className="category-bar-label">
                                    <span>{row.category}</span>
                                    <strong>
                                        {formatCurrency(row.total)}
                                        <small> · {share}%</small>
                                    </strong>
                                </div>

                                <div className="category-bar-track" aria-hidden="true">
                                    <div className="category-bar-fill" style={{ width: `${width}%` }} />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

export default CategoryChart;
