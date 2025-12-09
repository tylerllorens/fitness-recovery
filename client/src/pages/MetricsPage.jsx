import { useEffect, useMemo, useState } from "react";
import MetricsCalendar from "../components/MetricsCalendar.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import {
  fetchMetricDays,
  fetchMetricDayByDate,
  upsertMetricDay,
} from "../api/metricsApi.js";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// convert ISO date string to "YYYY-MM-DD" for <input type="date">
function isoToInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function MetricsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // form fields
  const [date, setDate] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [rhr, setRhr] = useState("");
  const [hrv, setHrv] = useState("");
  const [strain, setStrain] = useState("");
  const [notes, setNotes] = useState("");

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysWithData = useMemo(() => {
    return new Set(days.map((d) => isoToInput(d.date)));
  }, [days]);

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load recent metric days
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const items = await fetchMetricDays();
        if (cancelled) return;

        setDays(items);

        if (items.length > 0) {
          const mostRecent = items[0];
          setSelectedDay(mostRecent);

          // Prefill form with most recent day, but with today's date
          setDate(isoToInput(mostRecent.date));
          setSleepHours(String(mostRecent.sleepHours));
          setRhr(String(mostRecent.rhr));
          setHrv(String(mostRecent.hrv));
          setStrain(String(mostRecent.strain));
          setNotes(mostRecent.notes || "");
          setCurrentMonth(new Date(mostRecent.date));
        } else {
          // No existing days: preset date to today
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const dd = String(today.getDate()).padStart(2, "0");
          const todayStr = `${yyyy}-${mm}-${dd}`;
          setDate(todayStr);

          //start calendar on current month.
          setCurrentMonth(today);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Failed to load metrics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  function handleSelectDay(day) {
    setSelectedDay(day);
    setDate(isoToInput(day.date));
    setSleepHours(String(day.sleepHours));
    setRhr(String(day.rhr));
    setHrv(String(day.hrv));
    setStrain(String(day.strain));
    setNotes(day.notes || "");
  }

  async function handleSelectDateFromCalendar(dateKey) {
    // dateKey is "YYYY-MM-DD"
    setDate(dateKey);

    const [year, month, day] = dateKey.split("-");
    setCurrentMonth(new Date(Number(year), Number(month) - 1, Number(day)));

    // Check if already in the current 30-day list
    const existing = days.find((d) => isoToInput(d.date) === dateKey);
    if (existing) {
      handleSelectDay(existing);
      return;
    }

    // If not in the current 30-day list, try to fetch that specific day
    try {
      const fetched = await fetchMetricDayByDate(dateKey);
      if (fetched) {
        setDays((prev) => {
          const next = [fetched, ...prev];
          next.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          return next;
        });
        handleSelectDay(fetched);
      } else {
        // No data: clear selectedDay & reset fields
        setSelectedDay(null);
        setSleepHours("");
        setRhr("");
        setHrv("");
        setStrain("");
        setNotes("");
      }
    } catch (e) {
      // Assume no data for that day
      setSelectedDay(null);
      setSleepHours("");
      setRhr("");
      setHrv("");
      setStrain("");
      setNotes("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        date, // "YYYY-MM-DD"
        sleepHours: Number(sleepHours),
        rhr: Number(rhr),
        hrv: Number(hrv),
        strain: Number(strain),
        notes: notes.trim() || null,
      };

      const saved = await upsertMetricDay(payload);

      // Refresh list locally without re-fetching
      setDays((prev) => {
        const existingIndex = prev.findIndex(
          (d) => isoToInput(d.date) === date
        );
        if (existingIndex === -1) {
          // insert at top, assuming newest first
          return [saved, ...prev];
        } else {
          const copy = [...prev];
          copy[existingIndex] = saved;
          // sort by date descending
          copy.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          return copy;
        }
      });

      setSelectedDay(saved);
    } catch (e) {
      setError(e.message || "Failed to save metrics");
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <div
      style={{
        padding: "1.5rem",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 2fr)",
        gap: "1rem",
        alignItems: "flex-start",
      }}
    >
      {/* Left column: list + detail */}
      <section>
        <h1 style={{ marginBottom: "0.75rem" }}>Metrics</h1>
        <p style={{ marginBottom: "1rem", color: "#555", fontSize: 14 }}>
          Browse your recent recovery days and see how sleep, HRV, and strain
          impact readiness.
        </p>

        <ErrorMessage message={error} />

        {/* NEW: Calendar */}
        <div style={{ marginBottom: "1rem" }}>
          <MetricsCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDate={date} // "YYYY-MM-DD"
            onSelectDate={handleSelectDateFromCalendar}
            daysWithData={daysWithData}
          />
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fff",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.75rem",
              borderBottom: "1px solid #e5e7eb",
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Recent days
          </div>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {days.length === 0 ? (
              <p
                style={{
                  padding: "0.75rem",
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                No metrics logged yet. Use the form on the right to add your
                first day.
              </p>
            ) : (
              days.map((day) => {
                const isActive = selectedDay?.id === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.5rem 0.75rem",
                      border: "none",
                      borderBottom: "1px solid #e5e7eb",
                      background: isActive ? "#eef2ff" : "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{formatDate(day.date)}</span>
                      <span style={{ color: "#4b5563" }}>
                        {day.readiness}/100
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      Sleep: {day.sleepHours}h · RHR: {day.rhr} · HRV: {day.hrv}{" "}
                      · Strain: {day.strain}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selectedDay && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.75rem 0.9rem",
              background: "#fff",
            }}
          >
            <h2 style={{ fontSize: 15, marginBottom: "0.25rem" }}>
              Selected day
            </h2>
            <p
              style={{ fontSize: 14, color: "#4b5563", marginBottom: "0.5rem" }}
            >
              {formatDate(selectedDay.date)}
            </p>
            <p style={{ fontSize: 14, marginBottom: "0.25rem" }}>
              Readiness: <strong>{selectedDay.readiness}/100</strong>
            </p>
            {selectedDay.notes && (
              <p style={{ fontSize: 13, color: "#4b5563" }}>
                Notes: {selectedDay.notes}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Right column: form */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          background: "#fff",
        }}
      >
        <h2 style={{ marginBottom: "0.75rem", fontSize: 16 }}>
          Log / update a day
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontSize: 13,
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.4rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: 13,
                }}
              >
                Sleep hours
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: 13,
                }}
              >
                Resting HR (bpm)
              </label>
              <input
                type="number"
                min="20"
                max="120"
                value={rhr}
                onChange={(e) => setRhr(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: 13,
                }}
              >
                HRV (ms)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={hrv}
                onChange={(e) => setHrv(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: 13,
                }}
              >
                Strain (0–21)
              </label>
              <input
                type="number"
                min="0"
                max="21"
                step="0.1"
                value={strain}
                onChange={(e) => setStrain(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontSize: 13,
              }}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "0.4rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "4px",
              border: "none",
              background: saving ? "#9ca3af" : "#111827",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save day"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default MetricsPage;
