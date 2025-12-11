import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Activity,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Moon,
  Heart,
  X,
} from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("tyler@dev.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      setShowLoginModal(false);
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  }

  const features = [
    {
      icon: Activity,
      title: "Track Recovery",
      description:
        "Monitor your daily readiness score based on sleep, HRV, and heart rate data.",
      color: "#4a7c59",
    },
    {
      icon: TrendingUp,
      title: "Analyze Trends",
      description:
        "Visualize your recovery patterns over time with beautiful charts and insights.",
      color: "#3b82f6",
    },
    {
      icon: Calendar,
      title: "Log Metrics",
      description:
        "Easy-to-use calendar interface to track your daily health and fitness metrics.",
      color: "#8b5cf6",
    },
    {
      icon: Target,
      title: "Hit Your Goals",
      description:
        "Set targets and maintain streaks for better sleep and consistent recovery.",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Navbar */}
      <nav
        style={{
          padding: "1.25rem 3rem",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            RECOVERY
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "8px",
              border: "2px solid #111827",
              background: "#111827",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#111827";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#111827";
              e.currentTarget.style.color = "#ffffff";
            }}
          >
            LOG IN
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: "6rem 3rem",
          background:
            "linear-gradient(135deg, #f0f9f4 0%, #ffffff 50%, #f0f9f4 100%)",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
              marginBottom: "1.5rem",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Optimize Your
            <br />
            <span style={{ color: "#4a7c59" }}>Recovery</span>
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#6b7280",
              margin: "0 auto",
              marginBottom: "3rem",
              maxWidth: "700px",
              lineHeight: 1.6,
            }}
          >
            Track your sleep, heart rate, and strain to understand your body's
            readiness and train smarter.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              padding: "1.25rem 3rem",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 16px rgba(74, 124, 89, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(74, 124, 89, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(74, 124, 89, 0.3)";
            }}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Stats Preview */}
      <section style={{ padding: "4rem 3rem", background: "#ffffff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2rem",
            }}
          >
            <div
              style={{
                padding: "2rem",
                background: "linear-gradient(135deg, #d1fae5 0%, #f0f9f4 100%)",
                borderRadius: "16px",
                border: "2px solid #4a7c59",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 1rem",
                  borderRadius: "12px",
                  background: "#4a7c59",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart size={28} color="#ffffff" />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                Readiness
              </p>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#4a7c59",
                  margin: 0,
                }}
              >
                85/100
              </p>
            </div>

            <div
              style={{
                padding: "2rem",
                background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)",
                borderRadius: "16px",
                border: "2px solid #8b5cf6",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 1rem",
                  borderRadius: "12px",
                  background: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Moon size={28} color="#ffffff" />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                Sleep
              </p>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#8b5cf6",
                  margin: 0,
                }}
              >
                7.5h
              </p>
            </div>

            <div
              style={{
                padding: "2rem",
                background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
                borderRadius: "16px",
                border: "2px solid #3b82f6",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 1rem",
                  borderRadius: "12px",
                  background: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={28} color="#ffffff" />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                HRV
              </p>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#3b82f6",
                  margin: 0,
                }}
              >
                68ms
              </p>
            </div>

            <div
              style={{
                padding: "2rem",
                background: "linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)",
                borderRadius: "16px",
                border: "2px solid #f59e0b",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 1rem",
                  borderRadius: "12px",
                  background: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={28} color="#ffffff" />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                Strain
              </p>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#f59e0b",
                  margin: 0,
                }}
              >
                12.4
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "6rem 3rem",
          background: "#f9fafb",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "48px",
                fontWeight: "800",
                color: "#111827",
                margin: 0,
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
            >
              Everything You Need
            </h2>
            <p style={{ fontSize: "20px", color: "#6b7280", margin: 0 }}>
              Powerful tools to track, analyze, and optimize your recovery
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "2rem",
            }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  style={{
                    padding: "2.5rem",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: `${feature.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Icon size={28} color={feature.color} />
                  </div>
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#111827",
                      margin: 0,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#6b7280",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "6rem 3rem",
          background: "linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "48px",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to Optimize Your Training?
          </h2>
          <p
            style={{
              fontSize: "20px",
              color: "#6b7280",
              margin: 0,
              marginBottom: "3rem",
              lineHeight: 1.6,
            }}
          >
            Start tracking your recovery today and train with confidence.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              padding: "1.25rem 3rem",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 16px rgba(74, 124, 89, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(74, 124, 89, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(74, 124, 89, 0.3)";
            }}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 3rem",
          borderTop: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            © 2024 Recovery Tracker. Built for athletes, by athletes.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "2.5rem",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <X size={24} color="#6b7280" />
            </button>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2
                style={{
                  margin: 0,
                  marginBottom: "0.5rem",
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Welcome Back
              </h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "15px" }}>
                Sign in to your account
              </p>
            </div>

            <div>
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
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(74, 124, 89, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid #d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

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
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(74, 124, 89, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid #d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin(e);
                    }
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "0.75rem",
                    background: "#fee2e2",
                    border: "1px solid #ef4444",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "#991b1b", margin: 0 }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogin}
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
                  color: "white",
                  transition: "all 0.2s ease",
                  opacity: submitting ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.transform = "scale(1.02)";
                    e.target.style.boxShadow =
                      "0 8px 20px rgba(74, 124, 89, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {submitting ? "Logging in..." : "Log In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
