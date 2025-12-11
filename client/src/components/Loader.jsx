function Loader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #4a7c59",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p
        style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#6b7280",
          margin: 0,
        }}
      >
        Loading...
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Loader;
