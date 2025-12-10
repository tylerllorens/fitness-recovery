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
      <h2 style={{ fontSize: 15, marginBottom: "0.5rem" }}>{title}</h2>
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
              formatter={(value, name) => {
                if (name === "readiness") return [`${value}/100`, "Readiness"];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (!payload || payload.length === 0) return label;
                const item = payload[0].payload;
                return `${formatDateLabel(item.date)} (${item.zone})`;
              }}
            />
            <Line
              type="monotone"
              dataKey="readiness"
              stroke="#111827"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
