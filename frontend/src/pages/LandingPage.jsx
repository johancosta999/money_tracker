import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
    return (
        <div className="landing-page">

            {/* =========================
                Navbar
            ========================= */}

            <nav className="landing-navbar">

                <h2>
                    <span className="logo-money"></span>
                    MoneyTracker
                </h2>

                <div className="landing-nav-buttons">

                    <Link to="/login" className="login-btn">
                        Login
                    </Link>

                    <Link to="/register" className="register-btn">
                        Register
                    </Link>

                </div>

            </nav>


            {/* =========================
                Hero
            ========================= */}

            <main className="landing-content">

                <div className="hero-text">

                    <h1>
                        Your money.
                        <br />
                        Your plan.
                        <br />
                        <span>Your future.</span>
                    </h1>

                    <p className="hero-description">
                        Track your spending, plan your weekly budget,
                        and understand where your money is going —
                        all in one place.
                    </p>

                    <div className="hero-buttons">

                        <Link to="/register" className="primary-btn">
                            Get Started
                            <span>→</span>
                        </Link>

                        <Link to="/login" className="secondary-btn">
                            I already have an account
                        </Link>

                    </div>

                </div>


                {/* =========================
                    Finance Preview Card
                ========================= */}

                <div className="hero-card">

                    <div className="card-header">

                        <span>Monthly Balance</span>

                        <span className="card-menu">
                            •••
                        </span>

                    </div>

                    <h2>
                        Rs. 85,450
                    </h2>

                    <div className="card-stats">

                        <div>
                            <span>Income</span>
                            <strong className="income">Rs. 120,000</strong>
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

                    <div className="chart-labels">
                        <span>W1</span>
                        <span>W2</span>
                        <span>W3</span>
                        <span>W4</span>
                    </div>

                </div>

            </main>


            {/* =========================
                How It Works
            ========================= */}

            <section className="section">

                <div className="section-heading">
                    <h2>Three steps to your first budget</h2>
                    <p>
                        No spreadsheets, no setup calls. Most people
                        are tracking their first week within a few minutes.
                    </p>
                </div>

                <div className="steps-grid">

                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Add your accounts</h3>
                        <p>Log your income and where your money already goes each month.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Set weekly limits</h3>
                        <p>Give each category a rupee limit so nothing sneaks past you.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Watch it add up</h3>
                        <p>See balances and trends update as the week moves along.</p>
                    </div>

                </div>

            </section>


            {/* =========================
                Features
            ========================= */}

            <section className="section">

                <div className="section-heading">
                    <h2>Built around how you actually spend</h2>
                    <p>
                        Weekly instead of monthly, because that's when
                        habits actually show up.
                    </p>
                </div>

                <div className="features-grid">

                    <div className="feature-card large">

                        <div>
                            <h3>Weekly budgets</h3>
                            <p>
                                Break spending into weeks instead of months, so a bad
                                Tuesday doesn't hide in a "fine" month.
                            </p>
                        </div>

                        <div className="fake-chart small">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>

                    </div>

                    <div className="feature-card">
                        <h3>Category tracking</h3>
                        <p>See exactly what's eating your salary — food, transport, subscriptions.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Savings goals</h3>
                        <p>Set a target and a deadline, and watch the gap close.</p>
                    </div>

                </div>

            </section>


            {/* =========================
                CTA Band
            ========================= */}

            <section className="section">

                <div className="cta-band">

                    <h2>Ready to see where your money actually goes?</h2>

                    <Link to="/register" className="primary-btn">
                        Get Started
                        <span>→</span>
                    </Link>

                </div>

            </section>


            {/* =========================
                Footer
            ========================= */}

            <footer className="landing-footer">

                <div className="footer-top">

                    <div className="footer-brand">
                        <h2>
                            <span className="logo-money"></span>
                            MoneyTracker
                        </h2>
                        <p>Budgeting for real weeks and real rupees.</p>
                    </div>

                    <div className="footer-links">

                        <div className="footer-col">
                            <h4>Product</h4>
                            <a href="#">Features</a>
                            <a href="#">How it works</a>
                        </div>

                        <div className="footer-col">
                            <h4>Account</h4>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </div>

                    </div>

                </div>

                <div className="footer-bottom">

                    <span className="footer-credit">
                        Project by <span>Johan Costa</span>
                    </span>

                    <span>
                        © {new Date().getFullYear()} MoneyTracker. All rights reserved.
                    </span>

                </div>

            </footer>

        </div>
    );
}

export default LandingPage;
