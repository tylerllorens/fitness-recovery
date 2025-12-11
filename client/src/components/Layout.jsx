import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function Layout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f4f1",
      }}
    >
      <Navbar />
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "3rem 3rem",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
// import { Outlet } from "react-router-dom";
// import Navbar from "./Navbar.jsx";

// function Layout() {
//   return (
//     <div className="app-shell">
//       <Navbar />
//       <main style={{ padding: "1rem" }}>
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default Layout;
