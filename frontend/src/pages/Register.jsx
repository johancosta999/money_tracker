import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {

            const response = await api.post("/auth/register", {
                userName,
                email,
                password,
                age
            });

            console.log(response.data);

            setMessage("Account created successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message || "Registration failed"
            );

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
                        ₿
                    </div>

                    <h1>MoneyTracker</h1>

                    <p>Create your account.</p>

                </div>


                {/* Register Form */}

                <form onSubmit={handleRegister}>

                    {/* Username */}

                    <div className="input-group">

                        <label>Username</label>

                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />

                    </div>


                    {/* Email */}

                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>


                    {/* Password */}

                    <div className="input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                    </div>


                    {/* Age */}

                    <div className="input-group">

                        <label>Age</label>

                        <input
                            type="number"
                            placeholder="Enter your age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            min="1"
                            required
                        />

                    </div>


                    {/* Error */}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* Success */}

                    {message && (
                        <div className="auth-success">
                            {message}
                        </div>
                    )}


                    {/* Register Button */}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Account"
                        }
                    </button>

                </form>


                {/* Login */}

                <div className="auth-footer">

                    <span>Already have an account?</span>

                    <Link to="/login">
                        Login
                    </Link>

                </div>


                {/* Back */}

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