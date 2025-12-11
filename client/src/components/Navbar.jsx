import { Link, useLocation } from "react-router-dom";
import { Activity, TrendingUp, Calendar, User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Activity },
    { to: "/metrics", label: "Metrics", icon: Calendar },
    { to: "/trends", label: "Trends", icon: TrendingUp },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "1.25rem 3rem",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo/Brand - Bold and Minimal */}
        <Link
          to="/dashboard"
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#2d5016",
            letterSpacing: "-0.03em",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          RECOVERY
        </Link>

        {/* Nav Links - Clean and Spaced */}
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          {navItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: active ? "600" : "500",
                  color: active ? "#2d5016" : "#6b7280",
                  position: "relative",
                  transition: "color 0.2s ease",
                  paddingBottom: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#2d5016";
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#6b7280";
                  }
                }}
              >
                <Icon size={18} />
                {item.label}
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-1.25rem",
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: "#4a7c59",
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* Logout Button - Minimal */}
          <button
            onClick={logout}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              border: "1.5px solid #4a7c59",
              background: "transparent",
              color: "#2d5016",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginLeft: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4a7c59";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#2d5016";
            }}
          >
            LOG OUT
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

// import { Link } from "react-router-dom";

// function Navbar() {
//   return (
//     <nav style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #ddd" }}>
//       <strong style={{ marginRight: "1.5rem" }}>
//         Fitness Recovery Tracker
//       </strong>
//       <Link to="/dashboard" style={{ marginRight: "1rem" }}>
//         Dashboard
//       </Link>
//       <Link to="/metrics" style={{ marginRight: "1rem" }}>
//         Metrics
//       </Link>
//       <Link to="/trends" style={{ marginRight: "1rem" }}>
//         Trends
//       </Link>
//       <Link to="/profile" style={{ marginRight: "1rem" }}>
//         Profile
//       </Link>
//       <Link to="/login" style={{ float: "right" }}>
//         Login
//       </Link>
//     </nav>
//   );
// }

// export default Navbar;
