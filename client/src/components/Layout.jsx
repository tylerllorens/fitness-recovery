import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
