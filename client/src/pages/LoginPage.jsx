import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    isAuthenticated,
    loading: authLoading,
    error: authError,
  } = useAuth();

  const [email, setEmail] = useState("tyler@dev.com"); // default for faster testing
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // If already logged in, send to dashboard
  if (isAuthenticated && !authLoading) {
    navigate("/dashboard");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    const result = await login(email, password);

    setSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setLocalError(result.error || "Login failed");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          borderRadius: "8px",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem" }}>Log in</h1>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          Sign in to your Fitness Recovery Tracker.
        </p>

        {authLoading && !isAuthenticated ? (
          <Loader />
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              style={{ display: "block", marginBottom: "0.5rem", fontSize: 14 }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                marginBottom: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: 14,
              }}
              required
            />

            <label
              style={{ display: "block", marginBottom: "0.5rem", fontSize: 14 }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                marginBottom: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: 14,
              }}
              required
            />

            <ErrorMessage message={localError || authError} />

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: "4px",
                border: "none",
                fontSize: 15,
                fontWeight: 600,
                cursor: submitting ? "default" : "pointer",
                background: submitting ? "#999" : "#111827",
                color: "#fff",
                marginTop: "0.5rem",
              }}
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
