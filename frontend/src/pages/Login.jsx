import { useState } from "react"
import useAuth  from "../context/useAuth.js";
import { useNavigate } from "react-router-dom";
import api from "../services/api"

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault();
    setError("");

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
      )
    }
  }


  return (
    <div>
      <h1>Money Tracker</h1>

      <h2>Login</h2>

      <form onSubmit={ handleLogin } >
        <div>
          <label>Email</label>
          <input 
            type="email"
            value={ email }
            onChange={ (e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input 
            type="password"
            value={ password }
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p>{error}</p>
        )}

        <button type="submit">
          Login
        </button>

      </form>
    </div>
  )
}

export default Login
