import { useState } from "react"
import { useNavigate } from "react-router-dom";
import api from "../services/api"

function Register() {

  const [userName, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async(e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/register", {
        userName,
        email,
        password,
        age
      });

      console.log(response.data);

      setMessage("Account created successfully!")

      setTimeout(() => {
        navigate("/login")
      }, 1000)

    } catch (error) {
      console.log(error)

      setError(
        error.response?.data?.message || "Registration failed"
      );
    }
  }

  return (
    <div>
      
      <h1>Money Tracker</h1>

      <h2>Create Account</h2>

      <form onSubmit={ handleRegister } >

        <div>
          <label>Username</label> 

          <input
            type="text"
            value={userName}
            onChange={(e) => setuserName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Age </label>
          <input 
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        {error && (
          <p>{error}</p>
        )}

        {message && (
          <p>{message}</p>
        )}

        <button type="submit">Register</button>

      </form>

      <p>
        Already have an account?
        {" "}
        <button onClick={() => navigate("/login")}>Login</button>
      </p>

    </div>
  )
}

export default Register
