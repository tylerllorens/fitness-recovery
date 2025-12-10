import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// simple zone → color mapping
function zoneColor(zone) {
  switch (zone) {
    case "green":
      return "#16a34a"; // green
    case "yellow":
      return "#ca8a04"; // amber
    case "red":
      return "#dc2626"; // red
    default:
      return "#6b7280"; // gray fallback
  }
}

export default function ReadinessChart({ data, title = "Readiness trend" }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          background: "#fff",
          fontSize: 14,
          color: "#6b7280",
        }}
      >
        <p style={{ margin: 0 }}>{title}</p>
        <p style={{ marginTop: "0.35rem" }}>No trend data available yet.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    label: formatDateLabel(item.date),
  }));

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "0.75rem 1rem",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h2 style={{ fontSize: 15, margin: 0 }}>{title}</h2>
        {/* simple legend */}
        <div style={{ display: "flex", gap: "0.75rem", fontSize: 11 }}>
          <LegendDot color="#16a34a" label="Green" />
          <LegendDot color="#ca8a04" label="Yellow" />
          <LegendDot color="#dc2626" label="Red" />
        </div>
      </div>

      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickMargin={8} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickMargin={8} />
            <Tooltip
              formatter={(value, name, props) => {
                if (name === "readiness") {
                  return [`${value}/100`, "Readiness"];
                }
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (!payload || payload.length === 0) return label;
                const item = payload[0].payload;
                const z = item.zone ?? "unknown";
                return `${formatDateLabel(item.date)} — ${z}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="readiness"
              stroke="#111827"
              strokeWidth={2}
              // customize dots by zone color
              dot={(props) => {
                const { cx, cy, payload } = props;
                const color = zoneColor(payload.zone);
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                );
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// small legend pill
function LegendDot({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "999px",
          background: color,
        }}
      />
      <span>{label}</span>
    </span>
  );
}
