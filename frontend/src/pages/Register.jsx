import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Auth.css";

function Register() {

    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        userName,
                        email,
                        password,
                        age: Number(age)
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Registration failed"
                );

            }


            // Registration successful
            // Send user to login page

            navigate("/login");


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
                        Create your account
                    </h1>

                    <p>
                        Start taking control of your money today.
                    </p>

                </div>


                {/* Error */}

                {error && (

                    <div className="auth-error">
                        {error}
                    </div>

                )}


                {/* Register Form */}

                <form onSubmit={handleRegister}>

                    <div className="input-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={userName}
                            onChange={(e) =>
                                setUserName(e.target.value)
                            }
                            required
                        />

                    </div>


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
                            Age
                        </label>

                        <input
                            type="number"
                            placeholder="Enter your age"
                            value={age}
                            onChange={(e) =>
                                setAge(e.target.value)
                            }
                            min="1"
                            required
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Create a password"
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
                            ? "Creating Account..."
                            : "Create Account"
                        }

                    </button>

                </form>


                {/* Login */}

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Login
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

export default Register;