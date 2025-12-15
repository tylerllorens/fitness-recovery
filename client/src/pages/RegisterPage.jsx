import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect to dashboard
  if (isAuthenticated && !authLoading) {
    navigate("/dashboard");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success - redirect to login
      navigate("/login", {
        state: { message: "Account created! Please log in." },
      });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Loader />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "2.5rem",
          borderRadius: "16px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              margin: 0,
              marginBottom: "0.5rem",
              fontSize: "32px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            Create Account
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "15px" }}>
            Start tracking your recovery today
          </p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #4a7c59";
                e.target.style.boxShadow = "0 0 0 3px rgba(74, 124, 89, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #4a7c59";
                e.target.style.boxShadow = "0 0 0 3px rgba(74, 124, 89, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #4a7c59";
                e.target.style.boxShadow = "0 0 0 3px rgba(74, 124, 89, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "0.25rem",
              }}
            >
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #4a7c59";
                e.target.style.boxShadow = "0 0 0 3px rgba(74, 124, 89, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.875rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "15px",
              fontWeight: "700",
              cursor: submitting ? "not-allowed" : "pointer",
              background: submitting
                ? "#9ca3af"
                : "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
              color: "#ffffff",
              transition: "all 0.2s ease",
              opacity: submitting ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.transform = "scale(1.02)";
                e.target.style.boxShadow = "0 8px 20px rgba(74, 124, 89, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Link to Login */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#4a7c59",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
