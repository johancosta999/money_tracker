import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

import "./auth.css";

// Step 1 of resetting a password: ask for the email and send a reset link.
// The server gives the same reply whether or not the email has an account.
function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
            setMessage(data.message);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Couldn't send the reset link. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-icon">🔑</div>
                    <h1>Forgot password?</h1>
                    <p>Enter your email and we'll send you a link to choose a new one.</p>
                </div>

                {error && <div className="auth-error" role="alert">{error}</div>}
                {message && <div className="auth-success" role="status">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="forgotEmail">Email</label>
                        <input
                            id="forgotEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                            autoFocus
                        />
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? "Sending..." : "Send reset link"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Remembered it?</span>
                    <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
