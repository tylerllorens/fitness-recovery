import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

function formatDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function zoneColor(zone) {
  switch (zone) {
    case "green":
      return "#4a7c59";
    case "yellow":
      return "#f59e0b";
    case "red":
      return "#ef4444";
    default:
      return "#9ca3af";
  }
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const zone = data.zone || "unknown";
  const color = zoneColor(zone);

  return (
    <div
      style={{
        background: "#ffffff",
        border: `2px solid ${color}`,
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#6b7280",
          margin: 0,
          marginBottom: "0.5rem",
        }}
      >
        {formatDateLabel(data.date)}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
        <span
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: color,
            lineHeight: 1,
          }}
        >
          {data.readiness}
        </span>
        <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "600" }}>
          /100
        </span>
      </div>
      <div
        style={{
          marginTop: "0.5rem",
          paddingTop: "0.5rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            background: `${color}20`,
            color: color,
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {zone} zone
        </span>
      </div>
    </div>
  );
}

export default function ReadinessChart({ data, title = "Readiness trend" }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          background: "#f9fafb",
          borderRadius: "12px",
          border: "2px dashed #e5e7eb",
        }}
      >
        <p
          style={{
            fontSize: "16px",
            color: "#9ca3af",
            margin: 0,
            fontWeight: "500",
          }}
        >
          No trend data available yet
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "#d1d5db",
            margin: 0,
            marginTop: "0.25rem",
          }}
        >
          Log some metrics to see your readiness trend
        </p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    label: formatDateLabel(item.date),
  }));

  return (
    <div>
      {title && (
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#111827",
            margin: 0,
            marginBottom: "1.5rem",
          }}
        >
          {title}
        </h2>
      )}

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
          >
            <defs>
              <linearGradient
                id="readinessGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4a7c59" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: "500" }}
              tickMargin={12}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: "500" }}
              tickMargin={12}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#d1d5db", strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="readiness"
              stroke="#4a7c59"
              strokeWidth={3}
              fill="url(#readinessGradient)"
              animationDuration={1000}
            />

            <Line
              type="monotone"
              dataKey="readiness"
              stroke="#4a7c59"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const color = zoneColor(payload.zone);
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={3}
                    />
                  </g>
                );
              }}
              activeDot={{
                r: 8,
                strokeWidth: 3,
                stroke: "#ffffff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#4a7c59",
            }}
          />
          <span
            style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}
          >
            Green Zone (80-100)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#f59e0b",
            }}
          />
          <span
            style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}
          >
            Yellow Zone (60-79)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#ef4444",
            }}
          />
          <span
            style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}
          >
            Red Zone (0-59)
          </span>
        </div>
      </div>
    </div>
  );
}
