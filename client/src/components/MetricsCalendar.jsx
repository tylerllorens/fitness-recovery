import { useMemo } from "react";

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function parseDateKeyToLocalDate(key) {
  const [year, month, day] = key.split("-");
  // Creates a LOCAL date
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // "YYYY-MM-DD" in local time
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MetricsCalendar({
  currentMonth,
  onMonthChange,
  selectedDate,
  onSelectDate,
  daysWithData,
}) {
  const monthDate = currentMonth || new Date();

  const weeks = useMemo(() => {
    const startMonth = startOfMonth(monthDate);
    const start = startOfWeek(startMonth);

    const weeksArr = [];
    let current = start;

    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        week.push(current);
        current = addDays(current, 1);
      }
      weeksArr.push(week);
    }

    return weeksArr;
  }, [monthDate]);

  function handlePrevMonth() {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() - 1);
    onMonthChange?.(d);
  }

  function handleNextMonth() {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + 1);
    onMonthChange?.(d);
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "0.75rem",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={handlePrevMonth}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          ‹
        </button>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          {monthDate.toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          fontSize: 11,
          color: "#6b7280",
          marginBottom: "0.25rem",
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            style={{ textAlign: "center", padding: "0.15rem 0" }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          fontSize: 13,
        }}
      >
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const dayKey = formatDateKey(day);
            const inMonth = isSameMonth(day, monthDate);
            const isSelected =
              selectedDate &&
              isSameDay(day, parseDateKeyToLocalDate(selectedDate));
            const hasData = daysWithData?.has(dayKey);

            let bg = "#fff";
            let border = "1px solid #e5e7eb";
            let color = inMonth ? "#111827" : "#9ca3af";

            if (hasData) {
              bg = "#e0f2fe"; // light blue
              border = "1px solid #38bdf8";
            }

            if (isSelected) {
              bg = "#111827";
              color = "#fff";
              border = "1px solid #111827";
            }

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                onClick={() => onSelectDate?.(dayKey)}
                style={{
                  height: 32,
                  padding: 0,
                  borderRadius: "6px",
                  border,
                  background: bg,
                  color,
                  cursor: "pointer",
                }}
              >
                {day.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
