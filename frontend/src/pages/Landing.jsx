import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="landing-page">

            <nav className="landing-navbar">

                <h2>💰 MoneyTracker</h2>

                <div className="landing-nav-buttons">
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>

                    <Link to="/register" className="register-btn">
                        Register
                    </Link>
                </div>

            </nav>


            <main className="landing-content">

                <div className="hero-text">

                    <p className="hero-label">
                        TAKE CONTROL OF YOUR MONEY
                    </p>

                    <h1>
                        Your money.
                        <br />
                        Your plan.
                        <br />
                        Your future.
                    </h1>

                    <p className="hero-description">
                        Track your spending, plan your weekly budget,
                        and understand where your money is going —
                        all in one place.
                    </p>

                    <div className="hero-buttons">

                        <Link to="/register" className="primary-btn">
                            Get Started
                        </Link>

                        <Link to="/login" className="secondary-btn">
                            I already have an account
                        </Link>

                    </div>

                </div>


                <div className="hero-card">

                    <div className="card-header">
                        <span>Monthly Balance</span>
                        <span>•••</span>
                    </div>

                    <h2>Rs. 85,450</h2>

                    <div className="card-stats">

                        <div>
                            <span>Income</span>
                            <strong>Rs. 120,000</strong>
                        </div>

                        <div>
                            <span>Expenses</span>
                            <strong>Rs. 34,550</strong>
                        </div>

                    </div>

                    <div className="fake-chart">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                </div>

            </main>

        </div>
    );
}

export default Landing;