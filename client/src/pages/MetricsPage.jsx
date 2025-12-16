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
import { Calendar, Save } from "lucide-react";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

        const items = await fetchMetricDays();
        if (cancelled) return;

        setDays(items);

        if (items.length > 0) {
          const mostRecent = items[0];
          setSelectedDay(mostRecent);

          setDate(isoToInput(mostRecent.date));
          setSleepHours(
            mostRecent.sleepHours != null ? String(mostRecent.sleepHours) : ""
          );
          setRhr(mostRecent.rhr != null ? String(mostRecent.rhr) : "");
          setHrv(mostRecent.hrv != null ? String(mostRecent.hrv) : "");
          setStrain(mostRecent.strain != null ? String(mostRecent.strain) : "");
          setNotes(mostRecent.notes || "");
          setCurrentMonth(new Date(mostRecent.date));
        } else {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const dd = String(today.getDate()).padStart(2, "0");
          const todayStr = `${yyyy}-${mm}-${dd}`;
          setDate(todayStr);
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
    setSleepHours(day.sleepHours != null ? String(day.sleepHours) : "");
    setRhr(day.rhr != null ? String(day.rhr) : "");
    setHrv(day.hrv != null ? String(day.hrv) : "");
    setStrain(day.strain != null ? String(day.strain) : "");
    setNotes(day.notes || "");
  }

  async function handleSelectDateFromCalendar(dateKey) {
    setDate(dateKey);

    const [year, month, day] = dateKey.split("-");
    setCurrentMonth(new Date(Number(year), Number(month) - 1, Number(day)));

    const existing = days.find((d) => isoToInput(d.date) === dateKey);
    if (existing) {
      handleSelectDay(existing);
      return;
    }

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
        setSelectedDay(null);
        setSleepHours("");
        setRhr("");
        setHrv("");
        setStrain("");
        setNotes("");
      }
    } catch (e) {
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
        date,
        sleepHours: sleepHours !== "" ? Number(sleepHours) : null,
        rhr: rhr !== "" ? Number(rhr) : null,
        hrv: hrv !== "" ? Number(hrv) : null,
        strain: strain !== "" ? Number(strain) : null,
        notes: notes.trim() || null,
      };

      const saved = await upsertMetricDay(payload);

      setDays((prev) => {
        const existingIndex = prev.findIndex(
          (d) => isoToInput(d.date) === date
        );
        if (existingIndex === -1) {
          return [saved, ...prev];
        } else {
          const copy = [...prev];
          copy[existingIndex] = saved;
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
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
          Metrics
        </h1>
        <p style={{ fontSize: "18px", color: "#6b7280", margin: 0 }}>
          Log and track your daily recovery metrics
        </p>
      </div>

      <ErrorMessage message={error} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left Column - Calendar & List */}
        <div>
          {/* Calendar */}
          <div
            style={{
              background: "linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%)",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "2px solid #4a7c59",
              marginBottom: "1.5rem",
              boxShadow: "0 2px 8px rgba(74, 124, 89, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#4a7c59",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar size={20} color="#ffffff" />
                </div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Select Date
                </h2>
              </div>

              {/* Month/Year Selector */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(parseInt(e.target.value));
                    setCurrentMonth(newDate);
                  }}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111827",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="0">Jan</option>
                  <option value="1">Feb</option>
                  <option value="2">Mar</option>
                  <option value="3">Apr</option>
                  <option value="4">May</option>
                  <option value="5">Jun</option>
                  <option value="6">Jul</option>
                  <option value="7">Aug</option>
                  <option value="8">Sep</option>
                  <option value="9">Oct</option>
                  <option value="10">Nov</option>
                  <option value="11">Dec</option>
                </select>

                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => {
                    const newDate = new Date(currentMonth);
                    newDate.setFullYear(parseInt(e.target.value));
                    setCurrentMonth(newDate);
                  }}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111827",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <MetricsCalendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={date}
              onSelectDate={handleSelectDateFromCalendar}
              daysWithData={daysWithData}
            />
          </div>

          {/* Recent Days List */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
                background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Recent Entries ({days.length})
              </h3>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {days.length === 0 ? (
                <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "48px",
                      marginBottom: "1rem",
                      opacity: 0.3,
                    }}
                  >
                    📊
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      margin: 0,
                      marginBottom: "0.25rem",
                      fontWeight: "600",
                    }}
                  >
                    No metrics logged yet
                  </p>
                  <p style={{ fontSize: "13px", color: "#d1d5db", margin: 0 }}>
                    Start tracking your recovery
                  </p>
                </div>
              ) : (
                days.map((day) => {
                  const isActive = selectedDay?.id === day.id;
                  const readinessColor =
                    day.readiness >= 70
                      ? "#4a7c59"
                      : day.readiness >= 50
                      ? "#f59e0b"
                      : "#ef4444";

                  const readinessBg =
                    day.readiness >= 70
                      ? "#d1fae5"
                      : day.readiness >= 50
                      ? "#fef3c7"
                      : "#fee2e2";

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "1.25rem 1.5rem",
                        border: "none",
                        borderBottom: "1px solid #f3f4f6",
                        background: isActive ? "#f0f9f4" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#f9fafb";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#ffffff";
                        }
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: "4px",
                            background: "#4a7c59",
                          }}
                        />
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {formatDate(day.date)}
                        </span>
                        <div
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            background: readinessBg,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "800",
                              color: readinessColor,
                            }}
                          >
                            {day.readiness}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "0.5rem",
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "500",
                        }}
                      >
                        <span>💤 {day.sleepHours}h</span>
                        <span>❤️ {day.rhr} bpm</span>
                        <span>📊 {day.hrv} ms</span>
                        <span>⚡ {day.strain}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            borderRadius: "16px",
            padding: "2rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Save size={20} color="#ffffff" />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#111827",
                margin: 0,
              }}
            >
              Log Metrics
            </h2>
          </div>
          <p
            style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "2rem" }}
          >
            {selectedDay ? "✏️ Update existing entry" : "✨ Create new entry"}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Date */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
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
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  color: "#111827",
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

            {/* Metrics Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Sleep (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
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

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
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

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
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

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Strain (0-21)
                </label>
                <input
                  type="number"
                  min="0"
                  max="21"
                  step="0.1"
                  value={strain}
                  onChange={(e) => setStrain(e.target.value)}
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
            </div>

            {/* Notes */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="How are you feeling? Any observations?"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  resize: "vertical",
                  outline: "none",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
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
              disabled={saving}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "8px",
                border: "none",
                background: saving
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(74, 124, 89, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </form>

          {/* Selected Day Preview */}
          {selectedDay && (
            <div
              style={{
                marginTop: "2rem",
                padding: "1.5rem",
                background: "linear-gradient(135deg, #d1fae5 0%, #f0f9f4 100%)",
                borderRadius: "12px",
                border: "2px solid #4a7c59",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ fontSize: "20px" }}>✅</span>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#065f46",
                    margin: 0,
                  }}
                >
                  Currently Editing
                </p>
              </div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                {formatDate(selectedDay.date)}
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
                  {selectedDay.readiness}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#6b7280",
                  }}
                >
                  /100
                </span>
              </div>
              {selectedDay.notes && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    margin: 0,
                    marginTop: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  "{selectedDay.notes}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MetricsPage;
