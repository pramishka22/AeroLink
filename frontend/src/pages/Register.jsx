import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger"
  });

  const [message, setMessage] = useState("");

  const register = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/auth/register`, form);
      setMessage("Account created successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Register as passenger, staff, or admin</p>

        <form onSubmit={register}>
          <input 
            type="text"
            placeholder="Full name" 
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input 
            type="email"
            placeholder="Email" 
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input 
            type="password"
            placeholder="Password" 
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="passenger">Passenger</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">Register</button>
        </form>

        {message && <p className="message">{message}</p>}
        <p>Already have account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;