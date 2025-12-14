import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MetricsPage from "./pages/MetricsPage.jsx";
import TrendsPage from "./pages/TrendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing page - only show if NOT authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Login page - only show if NOT authenticated */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Register page - only show if NOT authenticated */}
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Protected routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
