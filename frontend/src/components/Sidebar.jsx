import { NavLink } from "react-router-dom";

function Sidebar() {

    return (
        <aside className="sidebar">

            <h2>💰 MoneyTracker</h2>

            <nav>

                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/transactions">
                    Transactions
                </NavLink>

                <NavLink to="/planner">
                    Weekly Planner
                </NavLink>

                <NavLink to="/categories">
                    Categories
                </NavLink>

                <NavLink to="/budgets">
                    Budgets
                </NavLink>

            </nav>

        </aside>
    );
}

export default Sidebar;