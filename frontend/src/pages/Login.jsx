import { useState } from "react"
import useAuth  from "../context/useAuth.js";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api"

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState("")

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault();
    setError("");
    setLoading(true)

    try{
      const response = await api.post("/auth/login", {
        email,
        password
      })

      console.log(response.data)

      login(
        response.data.user,
        response.data.token
      )

      navigate("/dashboard")

    }catch (error) {
      console.log(error)

      setError(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false)
    }
  }


  return (
        <div className="auth-page">

            <div className="auth-card">

                {/* Brand */}
                <div className="auth-brand">

                    <div className="brand-icon">
                        ₿
                    </div>

                    <h1>MoneyTracker</h1>

                    <p>Take control of your money.</p>

                </div>


                {/* Login Form */}
                <form onSubmit={handleLogin}>

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


                    <div className="input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* Submit */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>


                {/* Register */}
                <div className="auth-footer">

                    <span>Don't have an account?</span>

                    <Link to="/register">
                        Create one
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

export default Login
