// client/src/pages/TrendsPage.jsx
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

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function TrendsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [range, setRange] = useState("7d"); // "7d" | "28d"
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]); // raw daily data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load trends whenever range or auth state changes
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
      <div style={{ padding: "1.5rem" }}>
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
    <div style={{ padding: "1.5rem", maxWidth: "960px" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Trends</h1>
      <p style={{ marginBottom: "1rem", color: "#555", fontSize: 14 }}>
        See how your readiness, sleep, HRV, and strain evolve over time.
      </p>

      <ErrorMessage message={error} />

      {/* Range toggle */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => setRange("7d")}
          style={{
            padding: "0.4rem 0.75rem",
            borderRadius: "999px",
            border: range === "7d" ? "1px solid #111827" : "1px solid #d1d5db",
            background: range === "7d" ? "#111827" : "#fff",
            color: range === "7d" ? "#fff" : "#111827",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={() => setRange("28d")}
          style={{
            padding: "0.4rem 0.75rem",
            borderRadius: "999px",
            border: range === "28d" ? "1px solid #111827" : "1px solid #d1d5db",
            background: range === "28d" ? "#111827" : "#fff",
            color: range === "28d" ? "#fff" : "#111827",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Last 28 days
        </button>
      </div>

      {/* Top summary cards */}
      {summary && summary.hasData ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.75rem",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Avg readiness</p>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              {summary.averages.readiness}/100
            </p>
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.75rem",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Avg sleep</p>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              {summary.averages.sleepHours}h
            </p>
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.75rem",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Avg HRV</p>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              {summary.averages.hrv} ms
            </p>
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.75rem",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Avg strain</p>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              {summary.averages.strain}
            </p>
          </div>
        </div>
      ) : (
        <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
          No data in this period. Log some metrics to see trends.
        </p>
      )}

      {/* Zones + streaks + recommendation */}
      {summary && summary.hasData && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.75rem 0.9rem",
              background: "#fff",
            }}
          >
            <h2 style={{ fontSize: 14, marginBottom: "0.5rem" }}>
              Readiness zones
            </h2>
            <div style={{ fontSize: 13 }}>
              <p>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  Green:
                </span>{" "}
                {summary.zones?.green ?? 0} day
                {summary.zones?.green === 1 ? "" : "s"}
              </p>
              <p>
                <span style={{ color: "#ca8a04", fontWeight: 600 }}>
                  Yellow:
                </span>{" "}
                {summary.zones?.yellow ?? 0} day
                {summary.zones?.yellow === 1 ? "" : "s"}
              </p>
              <p>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>Red:</span>{" "}
                {summary.zones?.red ?? 0} day
                {summary.zones?.red === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.75rem 0.9rem",
              background: "#fff",
            }}
          >
            <h2 style={{ fontSize: 14, marginBottom: "0.5rem" }}>
              Streaks & guidance
            </h2>
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
              <p>
                <strong>7h+ sleep streak:</strong> {summary.sleepStreak7hPlus}{" "}
                day
                {summary.sleepStreak7hPlus === 1 ? "" : "s"}
              </p>
              <p>
                <strong>Green readiness streak:</strong> {summary.greenStreak}{" "}
                day
                {summary.greenStreak === 1 ? "" : "s"}
              </p>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "#374151",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "0.5rem",
                marginTop: "0.25rem",
              }}
            >
              {summary.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Daily table */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "0.75rem 0.9rem",
          background: "#fff",
        }}
      >
        <h2 style={{ fontSize: 14, marginBottom: "0.5rem" }}>
          Daily breakdown ({range === "7d" ? "last 7 days" : "last 28 days"})
        </h2>
        {!hasData ? (
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            No data available for this period.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "0.4rem 0.25rem" }}>Date</th>
                  <th style={{ padding: "0.4rem 0.25rem" }}>Ready</th>
                  <th style={{ padding: "0.4rem 0.25rem" }}>Sleep (h)</th>
                  <th style={{ padding: "0.4rem 0.25rem" }}>RHR</th>
                  <th style={{ padding: "0.4rem 0.25rem" }}>HRV</th>
                  <th style={{ padding: "0.4rem 0.25rem" }}>Strain</th>
                </tr>
              </thead>
              <tbody>
                {series.map((d) => (
                  <tr
                    key={d.date}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <td style={{ padding: "0.35rem 0.25rem" }}>
                      {formatDate(d.date)}
                    </td>
                    <td style={{ padding: "0.35rem 0.25rem" }}>
                      {d.readiness}
                    </td>
                    <td style={{ padding: "0.35rem 0.25rem" }}>
                      {d.sleepHours}
                    </td>
                    <td style={{ padding: "0.35rem 0.25rem" }}>{d.rhr}</td>
                    <td style={{ padding: "0.35rem 0.25rem" }}>{d.hrv}</td>
                    <td style={{ padding: "0.35rem 0.25rem" }}>{d.strain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default TrendsPage;
