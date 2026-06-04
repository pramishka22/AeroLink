import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod";

function Login({ setToken }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@aerolink.com");
  const [password, setPassword] = useState("Admin123");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
  
    try {
      const res = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });
  
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
  
      const payload = JSON.parse(
        atob(res.data.token.split(".")[1])
      );
  
      localStorage.setItem("userEmail", payload.email);
      localStorage.setItem("userRole", payload.role);
  
      setMessage("Login successful");
  
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
  
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-gradient"></div>
      <div className="auth-glow"></div>
      <div className="auth-grid"></div>
      
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L2 9L16 16L30 9L16 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 16L16 23L30 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 23L16 30L30 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>AeroLink</span>
          </div>
        </div>

        <div className="auth-card-login">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to access your airline operations dashboard</p>
          </div>

          <form onSubmit={login}>
            <div className="input-group">
              <label>Email address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@aerolink.com" 
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H19C20.1 8 21 8.9 21 10V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V10C3 8.9 3.9 8 5 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 8V6C8 3.79 9.79 2 12 2C14.21 2 16 3.79 16 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password" 
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <span className="button-loader"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.includes("successful") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="auth-footer">
            <p>New to AeroLink? <Link to="/register">Create an account</Link></p>
            <div className="auth-demo">
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;