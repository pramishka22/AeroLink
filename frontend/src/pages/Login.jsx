import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@aerolink.com");
  const [password, setPassword] = useState("Admin123");
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);

      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      localStorage.setItem("userEmail", payload.email);
      localStorage.setItem("userRole", payload.role);
      
      setMessage("Login successful");
      window.location.href = "/#/dashboard";
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>AeroLink</h1>
        <p>Login to airline operations dashboard</p>

        <form onSubmit={login}>
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            required
          />
          <input 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required
          />
          <button type="submit">Login</button>
        </form>

        {message && <p className="message">{message}</p>}
        <p>New user? <Link to="/register">Create account</Link></p>
      </div>
    </div>
  );
}

export default Login;