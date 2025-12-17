import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import QuickAddModal from "../components/QuickAddModal.jsx";
import { fetchLatestMetricDay } from "../api/metricsApi.js";
import { fetchSummary } from "../api/trendsApi.js";
import {
  TrendingUp,
  TrendingDown,
  Moon,
  Heart,
  Activity,
  Zap,
  Save,
  Edit,
} from "lucide-react";

function CircularProgress({ value, size = 200, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Color based on readiness
  let color = "#ef4444"; // red
  if (value >= 70) color = "#4a7c59"; // green
  else if (value >= 50) color = "#f59e0b"; // yellow

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  color = "#4a7c59",
}) {
  return (
    <div
      style={{
        padding: "1.5rem",
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Background icon decoration */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          opacity: 0.05,
        }}
      >
        <Icon size={120} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={20} color={color} />
          </div>
          {trend && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              {trend === "up" ? (
                <TrendingUp size={16} color="#4a7c59" />
              ) : (
                <TrendingDown size={16} color="#ef4444" />
              )}
              <span
                style={{
                  fontSize: "12px",
                  color: trend === "up" ? "#4a7c59" : "#ef4444",
                  fontWeight: "600",
                }}
              >
                {trend === "up" ? "+5%" : "-3%"}
              </span>
            </div>
          )}
        </div>

        <p
          style={{
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#9ca3af",
            margin: 0,
            marginBottom: "0.5rem",
          }}
        >
          {label}
        </p>
        <div
          style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}
        >
          <span
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#111827",
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{ fontSize: "16px", color: "#9ca3af", fontWeight: "600" }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [latest, setLatest] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [latestDay, weeklySummary] = await Promise.all([
          fetchLatestMetricDay(),
          fetchSummary(7),
        ]);

        if (cancelled) return;

        setLatest(latestDay);
        setSummary(weeklySummary);
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Determine readiness zone
  const readinessZone =
    latest?.readiness >= 80
      ? "green"
      : latest?.readiness >= 60
      ? "yellow"
      : "red";
  const zoneColors = {
    green: { bg: "#f0f9f4", border: "#4a7c59", text: "#2d5016" },
    yellow: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    red: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b" },
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "800",
              margin: 0,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back{user?.name ? `, ${user.name}` : ""}.
          </h1>

          {/* Quick Add Button */}
          <button
            onClick={() => setShowQuickAdd(true)}
            style={{
              padding: "0.875rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(74, 124, 89, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(74, 124, 89, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(74, 124, 89, 0.3)";
            }}
          >
            {latest ? <Edit size={18} /> : <Save size={18} />}
            {latest ? "Edit Today" : "Log Today"}
          </button>
        </div>
        <p style={{ fontSize: "18px", color: "#6b7280", margin: 0 }}>
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <ErrorMessage message={error} />

      {latest ? (
        <>
          {/* Hero Section - Readiness with Circular Progress */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            {/* Readiness Circle */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "2.5rem",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Zone indicator background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, ${zoneColors[readinessZone]?.bg} 0%, #ffffff 100%)`,
                  opacity: 0.5,
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  Today's Readiness
                </p>

                <div style={{ position: "relative", display: "inline-block" }}>
                  <CircularProgress
                    value={latest.readiness}
                    size={200}
                    strokeWidth={16}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "56px",
                        fontWeight: "800",
                        color:
                          latest.readiness >= 70
                            ? "#4a7c59"
                            : latest.readiness >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                        lineHeight: 1,
                      }}
                    >
                      {latest.readiness}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#9ca3af",
                        fontWeight: "600",
                        marginTop: "0.25rem",
                      }}
                    >
                      / 100
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "0.75rem 1.5rem",
                    background: zoneColors[readinessZone]?.bg,
                    border: `2px solid ${zoneColors[readinessZone]?.border}`,
                    borderRadius: "999px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: zoneColors[readinessZone]?.text,
                    }}
                  >
                    {readinessZone} Zone
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              <MetricCard
                icon={Moon}
                label="Sleep"
                value={latest.sleepHours ?? "—"}
                unit={latest.sleepHours != null ? "h" : ""}
                trend="up"
                color="#8b5cf6"
              />
              <MetricCard
                icon={Heart}
                label="Resting HR"
                value={latest.rhr ?? "—"}
                unit={latest.rhr != null ? "bpm" : ""}
                trend="down"
                color="#ef4444"
              />
              <MetricCard
                icon={Activity}
                label="HRV"
                value={latest.hrv ?? "—"}
                unit={latest.hrv != null ? "ms" : ""}
                trend="up"
                color="#3b82f6"
              />
              <MetricCard
                icon={Zap}
                label="Strain"
                value={latest.strain ?? "—"}
                unit=""
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Notes */}
          {latest.notes && (
            <div
              style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                borderLeft: "4px solid #4a7c59",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#9ca3af",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                Today's Notes
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "#374151",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {latest.notes}
              </p>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="📊"
          title="No Data Yet"
          description="Start tracking your recovery by logging your first day of metrics. Track sleep, HRV, heart rate, and strain to get your readiness score."
          actionText="Log Today's Metrics"
          actionPath="/metrics"
        />
      )}

      {/* 7-Day Summary */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2.5rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            Last 7 Days
          </h2>
          <p style={{ fontSize: "15px", color: "#9ca3af", margin: 0 }}>
            Your weekly performance summary
          </p>
        </div>

        {!summary || !summary.hasData ? (
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            No data in the last 7 days. Log some metrics to see insights.
          </p>
        ) : (
          <>
            {/* Averages with Progress Bars */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  background: "#f9fafb",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#9ca3af",
                      margin: 0,
                    }}
                  >
                    Avg Readiness
                  </p>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#4a7c59",
                    }}
                  >
                    {summary.averages.readiness}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${summary.averages.readiness}%`,
                      background:
                        "linear-gradient(90deg, #4a7c59 0%, #6b9e78 100%)",
                      borderRadius: "999px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "1.5rem",
                  background: "#f9fafb",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#9ca3af",
                      margin: 0,
                    }}
                  >
                    Avg Sleep
                  </p>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#8b5cf6",
                    }}
                  >
                    {summary.averages.sleepHours}h
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(summary.averages.sleepHours / 10) * 100}%`,
                      background:
                        "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)",
                      borderRadius: "999px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "1.5rem",
                  background: "#f9fafb",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#9ca3af",
                      margin: 0,
                    }}
                  >
                    Avg HRV
                  </p>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#3b82f6",
                    }}
                  >
                    {summary.averages.hrv}ms
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(summary.averages.hrv / 150) * 100}%`,
                      background:
                        "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
                      borderRadius: "999px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "1.5rem",
                  background: "#f9fafb",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#9ca3af",
                      margin: 0,
                    }}
                  >
                    Avg Strain
                  </p>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#f59e0b",
                    }}
                  >
                    {summary.averages.strain}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(summary.averages.strain / 21) * 100}%`,
                      background:
                        "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
                      borderRadius: "999px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Streaks with Emojis */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  background:
                    "linear-gradient(135deg, #ede9fe 0%, #ffffff 100%)",
                  borderRadius: "12px",
                  border: "2px solid #8b5cf6",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "0.5rem" }}>
                  🔥
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  Sleep Streak
                </p>
                <p
                  style={{
                    fontSize: "32px",
                    fontWeight: "800",
                    color: "#8b5cf6",
                    margin: 0,
                  }}
                >
                  {summary.sleepStreak7hPlus}
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#9ca3af",
                    }}
                  >
                    {" "}
                    day{summary.sleepStreak7hPlus === 1 ? "" : "s"}
                  </span>
                </p>
              </div>

              <div
                style={{
                  padding: "1.5rem",
                  background:
                    "linear-gradient(135deg, #d1fae5 0%, #ffffff 100%)",
                  borderRadius: "12px",
                  border: "2px solid #4a7c59",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "0.5rem" }}>
                  💚
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  Green Zone Streak
                </p>
                <p
                  style={{
                    fontSize: "32px",
                    fontWeight: "800",
                    color: "#4a7c59",
                    margin: 0,
                  }}
                >
                  {summary.greenStreak}
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#9ca3af",
                    }}
                  >
                    {" "}
                    day{summary.greenStreak === 1 ? "" : "s"}
                  </span>
                </p>
              </div>
            </div>

            {/* Recommendation Banner */}
            <div
              style={{
                padding: "1.5rem 2rem",
                background: "linear-gradient(135deg, #f0f4f1 0%, #ffffff 100%)",
                borderRadius: "12px",
                border: "2px solid #4a7c59",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#4a7c59",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                💡
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  Recommendation
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#374151",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {summary.recommendation}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={async () => {
          // Reload dashboard data after successful save
          try {
            const [latestDay, weeklySummary] = await Promise.all([
              fetchLatestMetricDay(),
              fetchSummary(7),
            ]);
            setLatest(latestDay);
            setSummary(weeklySummary);
          } catch (e) {
            // Ignore errors on refresh
          }
        }}
      />
    </div>
  );
}

export default DashboardPage;
