import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

import "./auth.css";

// Step 2 of resetting a password: opened from the emailed link (?token=...).
function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("The two passwords don't match");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", { token, password });
            setPassword("");
            setConfirmPassword("");
            setDone(true);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Couldn't reset your password. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-icon">🔒</div>
                    <h1>Choose a new password</h1>
                    <p>Use at least 8 characters.</p>
                </div>

                {!token ? (
                    <div className="auth-error" role="alert">
                        This reset link is incomplete. Please request a new one.
                    </div>
                ) : done ? (
                    <div className="auth-success" role="status">
                        Your password has been changed. You can log in now.
                    </div>
                ) : (
                    <>
                        {error && <div className="auth-error" role="alert">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="newPassword">New password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="new-password"
                                    minLength="8"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmNewPassword">Confirm new password</label>
                                <input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    autoComplete="new-password"
                                    minLength="8"
                                    required
                                />
                            </div>

                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? "Saving..." : "Save new password"}
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-footer">
                    {done ? (
                        <Link to="/login">Go to login</Link>
                    ) : (
                        <>
                            <span>Link expired?</span>
                            <Link to="/forgot-password">Send a new one</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
