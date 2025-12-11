import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

function ErrorMessage({ message }) {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "start",
        gap: "0.75rem",
        padding: "1rem 1.25rem",
        background: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)",
        border: "2px solid #ef4444",
        borderRadius: "12px",
        marginBottom: "1.5rem",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <AlertCircle size={20} color="#ffffff" />
      </div>
      <div style={{ flex: 1, paddingTop: "0.25rem" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#991b1b",
            margin: 0,
            marginBottom: "0.25rem",
          }}
        >
          Error
        </p>
        <p
          style={{
            fontSize: "15px",
            color: "#7f1d1d",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#fecaca";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <X size={18} color="#991b1b" />
      </button>
    </div>
  );
}

export default ErrorMessage;
