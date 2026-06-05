import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod";

function OAuthCallback({ setToken }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing OAuth 2.0 login...");

  useEffect(() => {
    const completeOAuthLogin = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          setMessage("OAuth authorization code not found.");
          return;
        }

        const res = await axios.post(`${API}/auth/oauth/callback`, { code });

        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);

        const payload = JSON.parse(atob(res.data.token.split(".")[1]));

        localStorage.setItem("userEmail", payload.email);
        localStorage.setItem("userRole", payload.role);

        setMessage("OAuth login successful");

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      } catch (error) {
        setMessage(error.response?.data?.message || "OAuth login failed");
      }
    };

    completeOAuthLogin();
  }, [navigate, setToken]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card-login">
          <div className="auth-header">
            <h1>OAuth 2.0 Login</h1>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OAuthCallback;