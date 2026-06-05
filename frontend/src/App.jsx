import { useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OAuthCallback from "./pages/OAuthCallback";
import "./App.css";

function SwaggerPage() {
  return (
    <iframe
      src="/swagger-ui/index.html"
      title="AeroLink Swagger API Documentation"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        background: "#fff",
      }}
    />
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />

        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setToken={setToken} />
            )
          }
        />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            token ? (
              <Dashboard setToken={setToken} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/swagger"
          element={
            token ? (
              <SwaggerPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/oauth-callback"
          element={<OAuthCallback setToken={setToken} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;