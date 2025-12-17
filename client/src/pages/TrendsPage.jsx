import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import {
  fetchSummary,
  fetchTrends7d,
  fetchTrends28d,
} from "../api/trendsApi.js";
import ReadinessChart from "../components/ReadinessChart.jsx";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function QuickStat({ label, value, unit }) {
  return (
    <div>
      <p
        style={{
          fontSize: "11px",
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
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
        <span
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "600" }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function TrendsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [range, setRange] = useState("28d");
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const days = range === "7d" ? 7 : 28;

        const [summaryRes, seriesRes] = await Promise.all([
          fetchSummary(days),
          range === "7d" ? fetchTrends7d() : fetchTrends28d(),
        ]);

        if (cancelled) return;

        setSummary(summaryRes);
        setSeries(seriesRes);
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Failed to load trends");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, range]);

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

  const hasData =
    summary?.hasData && Array.isArray(series) && series.length > 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "800",
            margin: 0,
            marginBottom: "0.5rem",
            color: "#111827",
            letterSpacing: "-0.02em",
          }}
        >
          Trends
        </h1>
        <p style={{ fontSize: "18px", color: "#6b7280", margin: 0 }}>
          Track your recovery patterns over time
        </p>
      </div>

      <ErrorMessage message={error} />

      {/* Range Toggle - Always Visible */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            background: "#f9fafb",
            borderRadius: "10px",
            padding: "0.25rem",
            border: "1px solid #e5e7eb",
          }}
        >
          <button
            type="button"
            onClick={() => setRange("7d")}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: range === "7d" ? "#111827" : "transparent",
              color: range === "7d" ? "#ffffff" : "#6b7280",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            1 Week
          </button>
          <button
            type="button"
            onClick={() => setRange("28d")}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: range === "28d" ? "#111827" : "transparent",
              color: range === "28d" ? "#ffffff" : "#6b7280",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            1 Month
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon="📈"
          title="No Trend Data Available"
          description="You need at least a few days of data to see meaningful trends. Start by logging your daily metrics and come back here to see your recovery patterns over time."
          actionText="Go to Metrics"
          actionPath="/metrics"
        />
      ) : (
        <>
          {/* Main Chart Section */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #e5e7eb",
              marginBottom: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Chart Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#111827",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  Readiness Over Time
                </h2>
                <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
                  Your recovery trend for the selected period
                </p>
              </div>
            </div>

            {/* Chart */}
            <div style={{ marginTop: "1rem" }}>
              <ReadinessChart
                data={series}
                title={
                  range === "7d"
                    ? "Readiness (Last Week)"
                    : "Readiness (Last Month)"
                }
              />
            </div>

            {/* Quick Stats Below Chart */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "2rem",
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <QuickStat
                label="Avg Readiness"
                value={summary.averages.readiness}
                unit="/100"
              />
              <QuickStat
                label="Avg Sleep"
                value={summary.averages.sleepHours}
                unit="h"
              />
              <QuickStat
                label="Avg HRV"
                value={summary.averages.hrv}
                unit="ms"
              />
              <QuickStat label="Avg Strain" value={summary.averages.strain} />
            </div>
          </div>

          {/* Highlights Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {/* Best & Worst Days */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#f0f4f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Award size={20} color="#4a7c59" />
                </div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Performance
                </h2>
              </div>

              <div
                style={{
                  padding: "1.25rem",
                  background:
                    "linear-gradient(135deg, #d1fae5 0%, #f0f9f4 100%)",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  BEST DAY
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  {formatDate(summary.bestDay.date)}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "32px",
                      fontWeight: "800",
                      color: "#4a7c59",
                      lineHeight: 1,
                    }}
                  >
                    {summary.bestDay.readiness}
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#9ca3af",
                    }}
                  >
                    /100
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: "1.25rem",
                  background: "#f9fafb",
                  borderRadius: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  WORST DAY
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  {formatDate(summary.worstDay.date)}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "32px",
                      fontWeight: "800",
                      color: "#111827",
                      lineHeight: 1,
                    }}
                  >
                    {summary.worstDay.readiness}
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#9ca3af",
                    }}
                  >
                    /100
                  </span>
                </div>
              </div>
            </div>

            {/* Zones */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#f0f4f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Target size={20} color="#4a7c59" />
                </div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Zone Distribution
                </h2>
              </div>

              {/* Zone Bars */}
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#065f46",
                    }}
                  >
                    🟢 Green Zone
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#065f46",
                    }}
                  >
                    {summary.zones?.green ?? 0}
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
                      width: `${
                        ((summary.zones?.green ?? 0) /
                          (range === "7d" ? 7 : 28)) *
                        100
                      }%`,
                      background:
                        "linear-gradient(90deg, #4a7c59 0%, #6b9e78 100%)",
                      borderRadius: "999px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#92400e",
                    }}
                  >
                    🟡 Yellow Zone
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#92400e",
                    }}
                  >
                    {summary.zones?.yellow ?? 0}
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
                      width: `${
                        ((summary.zones?.yellow ?? 0) /
                          (range === "7d" ? 7 : 28)) *
                        100
                      }%`,
                      background:
                        "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
                      borderRadius: "999px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#991b1b",
                    }}
                  >
                    🔴 Red Zone
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#991b1b",
                    }}
                  >
                    {summary.zones?.red ?? 0}
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
                      width: `${
                        ((summary.zones?.red ?? 0) /
                          (range === "7d" ? 7 : 28)) *
                        100
                      }%`,
                      background:
                        "linear-gradient(90deg, #ef4444 0%, #f87171 100%)",
                      borderRadius: "999px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Streaks */}
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
                padding: "2rem",
                background: "linear-gradient(135deg, #ede9fe 0%, #ffffff 100%)",
                borderRadius: "16px",
                border: "2px solid #8b5cf6",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  fontSize: "120px",
                  opacity: 0.1,
                }}
              >
                🔥
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "40px", marginBottom: "0.5rem" }}>
                  🔥
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "0.75rem",
                  }}
                >
                  7H+ SLEEP STREAK
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "56px",
                      fontWeight: "800",
                      color: "#8b5cf6",
                      lineHeight: 1,
                    }}
                  >
                    {summary.sleepStreak7hPlus}
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#9ca3af",
                    }}
                  >
                    day{summary.sleepStreak7hPlus === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "2rem",
                background: "linear-gradient(135deg, #d1fae5 0%, #ffffff 100%)",
                borderRadius: "16px",
                border: "2px solid #4a7c59",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  fontSize: "120px",
                  opacity: 0.1,
                }}
              >
                💚
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "40px", marginBottom: "0.5rem" }}>
                  💚
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: "0.75rem",
                  }}
                >
                  GREEN ZONE STREAK
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "56px",
                      fontWeight: "800",
                      color: "#4a7c59",
                      lineHeight: 1,
                    }}
                  >
                    {summary.greenStreak}
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#9ca3af",
                    }}
                  >
                    day{summary.greenStreak === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div
            style={{
              padding: "2rem",
              background: "linear-gradient(135deg, #f0f4f1 0%, #ffffff 100%)",
              borderRadius: "16px",
              border: "2px solid #4a7c59",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
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
                    marginBottom: "0.5rem",
                  }}
                >
                  Recommendation
                </p>
                <p
                  style={{
                    fontSize: "17px",
                    color: "#374151",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {summary.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#111827",
                margin: 0,
                marginBottom: "1.5rem",
              }}
            >
              Daily Breakdown
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #e5e7eb",
                      textAlign: "left",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#9ca3af",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#9ca3af",
                      }}
                    >
                      Readiness
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#9ca3af",
                      }}
                    >
                      Sleep
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#9ca3af",
                      }}
                    >
                      RHR
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#9ca3af",
                      }}
                    >
                      HRV
                    </th>
                    <th
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#9ca3af",
                      }}
                    >
                      Strain
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((d, index) => (
                    <tr
                      key={d.date}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        background: index % 2 === 0 ? "#ffffff" : "#fafafa",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f0f4f1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          index % 2 === 0 ? "#ffffff" : "#fafafa";
                      }}
                    >
                      <td
                        style={{
                          padding: "1rem",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {formatDate(d.date)}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "15px",
                            color:
                              d.readiness >= 70
                                ? "#4a7c59"
                                : d.readiness >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {d.readiness}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>
                        {d.sleepHours}h
                      </td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>
                        {d.rhr}
                      </td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>
                        {d.hrv}
                      </td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>
                        {d.strain}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TrendsPage;
