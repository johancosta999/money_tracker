import { useAuth } from "../context/useAuth";

function Navbar() {

    const { user, logout } = useAuth();

    return (
        <header className="navbar">

            <div>
                <h2>Dashboard</h2>
            </div>

            <div className="navbar-right">

                <span>
                    Hi, {user?.userName} 👋
                </span>

                <button onClick={logout}>
                    Logout
                </button>

            </div>

        </header>
    );
}

export default Navbar;