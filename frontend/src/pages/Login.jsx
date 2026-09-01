import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Auth.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Login failed"
                );

            }


            // Save JWT
            localStorage.setItem(
                "token",
                data.token
            );


            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // Go to dashboard
            navigate("/dashboard");


        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card">

                {/* Brand */}

                <div className="auth-brand">

                    <div className="brand-icon">
                        💰
                    </div>

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Login to continue managing your money.
                    </p>

                </div>


                {/* Error */}

                {error && (

                    <div className="auth-error">
                        {error}
                    </div>

                )}


                {/* Login Form */}

                <form onSubmit={handleLogin}>

                    <div className="input-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>


                {/* Register */}

                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Register
                    </Link>

                </div>


                {/* Back Home */}

                <Link
                    to="/"
                    className="back-home"
                >
                    ← Back to home
                </Link>

            </div>

        </div>
    );
}

export default Login;