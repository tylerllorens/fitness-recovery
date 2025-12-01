import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #ddd" }}>
      <strong style={{ marginRight: "1.5rem" }}>
        Fitness Recovery Tracker
      </strong>
      <Link to="/dashboard" style={{ marginRight: "1rem" }}>
        Dashboard
      </Link>
      <Link to="/metrics" style={{ marginRight: "1rem" }}>
        Metrics
      </Link>
      <Link to="/trends" style={{ marginRight: "1rem" }}>
        Trends
      </Link>
      <Link to="/profile" style={{ marginRight: "1rem" }}>
        Profile
      </Link>
      <Link to="/login" style={{ float: "right" }}>
        Login
      </Link>
    </nav>
  );
}

export default Navbar;
