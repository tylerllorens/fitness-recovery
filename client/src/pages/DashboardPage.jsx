import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { fetchLatestMetricDay } from "../api/metricsApi.js";
import { fetchSummary } from "../api/trendsApi.js";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [latest, setLatest] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to /login if not authed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load dashboard data once authenticated
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
      <div style={{ padding: "1.5rem" }}>
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Just in case the redirect hasn't hit yet
    return null;
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "960px" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>
        Welcome back{user?.name ? `, ${user.name}` : ""}.
      </h1>
      <p style={{ marginBottom: "1.5rem", color: "#555" }}>
        Here’s a snapshot of your recovery and training balance.
      </p>

      <ErrorMessage message={error} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
          alignItems: "stretch",
        }}
      >
        {/* Today card */}
        <section
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <h2 style={{ marginBottom: "0.25rem", fontSize: "1.1rem" }}>
            Today&apos;s readiness
          </h2>
          <p
            style={{ marginBottom: "0.75rem", color: "#6b7280", fontSize: 14 }}
          >
            {latest ? formatDate(latest.date) : "No data for today yet."}
          </p>

          {latest ? (
            <>
              <p
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  marginBottom: "0.25rem",
                }}
              >
                {latest.readiness}
                <span style={{ fontSize: "1rem", color: "#6b7280" }}>/100</span>
              </p>
              <p style={{ marginBottom: "0.75rem", color: "#4b5563" }}>
                Sleep: <strong>{latest.sleepHours}h</strong> · RHR:{" "}
                <strong>{latest.rhr} bpm</strong> · HRV:{" "}
                <strong>{latest.hrv} ms</strong> · Strain:{" "}
                <strong>{latest.strain}</strong>
              </p>
              {latest.notes && (
                <p style={{ fontSize: 14, color: "#4b5563" }}>
                  <span style={{ fontWeight: 600 }}>Notes:</span> {latest.notes}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: "#6b7280" }}>
              Log sleep, heart rate, HRV, and strain to see today&apos;s
              readiness.
            </p>
          )}
        </section>

        {/* Weekly summary card */}
        <section
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <h2 style={{ marginBottom: "0.25rem", fontSize: "1.1rem" }}>
            Last 7 days
          </h2>
          <p
            style={{ marginBottom: "0.75rem", color: "#6b7280", fontSize: 14 }}
          >
            Averages and trends over your recent training.
          </p>

          {!summary || !summary.hasData ? (
            <p style={{ color: "#6b7280" }}>
              No data in the last 7 days. Log some metrics to see insights.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>
                    Avg readiness
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>
                    {summary.averages.readiness}/100
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>Avg sleep</p>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>
                    {summary.averages.sleepHours}h
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>Avg HRV</p>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>
                    {summary.averages.hrv} ms
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>Avg strain</p>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>
                    {summary.averages.strain}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                  fontSize: 13,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#9ca3af" }}>Best day</p>
                  <p style={{ fontWeight: 600 }}>
                    {formatDate(summary.bestDay.date)}
                  </p>
                  <p>{summary.bestDay.readiness}/100</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#9ca3af" }}>Worst day</p>
                  <p style={{ fontWeight: 600 }}>
                    {formatDate(summary.worstDay.date)}
                  </p>
                  <p>{summary.worstDay.readiness}/100</p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                  fontSize: 13,
                }}
              >
                <div>
                  <p style={{ color: "#9ca3af" }}>7h+ sleep streak</p>
                  <p style={{ fontWeight: 600 }}>
                    {summary.sleepStreak7hPlus} day
                    {summary.sleepStreak7hPlus === 1 ? "" : "s"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#9ca3af" }}>Green readiness streak</p>
                  <p style={{ fontWeight: 600 }}>
                    {summary.greenStreak} day
                    {summary.greenStreak === 1 ? "" : "s"}
                  </p>
                </div>
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
