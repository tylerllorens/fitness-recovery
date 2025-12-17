import { useNavigate } from "react-router-dom";

function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionPath,
  onAction,
}) {
  const navigate = useNavigate();

  function handleAction() {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  }

  return (
    <div
      style={{
        padding: "4rem 2rem",
        background: "#ffffff",
        borderRadius: "16px",
        border: "2px dashed #e5e7eb",
        textAlign: "center",
      }}
    >
      {/* Icon/Emoji */}
      <div
        style={{
          fontSize: "72px",
          marginBottom: "1.5rem",
          opacity: 0.5,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#111827",
          margin: 0,
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: "16px",
          color: "#6b7280",
          margin: 0,
          marginBottom: "2rem",
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      {/* CTA Button */}
      {actionText && (actionPath || onAction) && (
        <button
          onClick={handleAction}
          style={{
            padding: "1rem 2rem",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(74, 124, 89, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(74, 124, 89, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(74, 124, 89, 0.3)";
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
