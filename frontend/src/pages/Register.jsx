import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod";

function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger"
  });

  const [message, setMessage] = useState("");

  const register = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!consentAccepted) {
      setMessage("You must accept the privacy policy and consent terms before registering.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API}/auth/register`, {
        ...form,
        consentAccepted: true,
        consentTimestamp: new Date().toISOString()
      });

      setMessage("Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L2 9L16 16L30 9L16 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 16L16 23L30 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 23L16 30L30 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>AeroLink</span>
          </div>
        </div>

        <div className="auth-card-login">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join AeroLink and manage airline operations</p>
          </div>

          <form onSubmit={register}>
            <div className="input-group">
              <label>Full name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="John Doe"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="name@example.com"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Create a strong password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Role</label>
              <div className="input-wrapper">
                <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="passenger">Passenger</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="consent-box">
              <label className="consent-label">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  required
                />
                <span>
                  I consent to AeroLink collecting and processing my personal data for
                  account creation, authentication, booking, check-in, baggage tracking,
                  and operational notifications.
                </span>
              </label>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? <span className="button-loader"></span> : "Create Account"}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.includes("successfully") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;