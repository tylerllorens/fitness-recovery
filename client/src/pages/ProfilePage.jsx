import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { getProfile, updateProfile } from "../api/profileApi.js";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load profile data
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const p = await getProfile();
        if (cancelled) return;

        setProfile(p);
        setName(p.name || "");
        setEmail(p.email || "");
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });

      setProfile(updated);
      // Auth context will pick this up on next /me fetch; for now we update local.
    } catch (e) {
      setError(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        padding: "1.5rem",
        maxWidth: "800px",
      }}
    >
      <h1 style={{ marginBottom: "0.25rem" }}>Profile</h1>
      <p style={{ marginBottom: "1rem", color: "#555", fontSize: 14 }}>
        Manage your account details and see a snapshot of your membership.
      </p>

      <ErrorMessage message={error} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1.8fr)",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left: overview */}
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            background: "#fff",
          }}
        >
          <h2 style={{ fontSize: 15, marginBottom: "0.5rem" }}>
            Account overview
          </h2>
          <p style={{ fontSize: 14, marginBottom: "0.35rem" }}>
            <strong>Name:</strong> {profile?.name || "—"}
          </p>
          <p style={{ fontSize: 14, marginBottom: "0.35rem" }}>
            <strong>Email:</strong> {profile?.email || "—"}
          </p>
          <p style={{ fontSize: 14, marginBottom: "0.35rem" }}>
            <strong>User ID:</strong>{" "}
            <span style={{ fontFamily: "monospace", fontSize: 12 }}>
              {profile?.id || "—"}
            </span>
          </p>
          <p style={{ fontSize: 14 }}>
            <strong>Member since:</strong>{" "}
            {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
          </p>

          {user?.email && user.email !== profile?.email && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              (Note: global session user email is {user.email}; it will refresh
              on next login/reload.)
            </p>
          )}
        </section>

        {/* Right: edit form */}
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            background: "#fff",
          }}
        >
          <h2 style={{ fontSize: 15, marginBottom: "0.75rem" }}>
            Edit profile
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: 13,
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: 13,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>

            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: "0.75rem",
              }}
            >
              Updating your email here will change the address you use to log
              in. Make sure you remember the new one.
            </p>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                border: "none",
                background: saving ? "#9ca3af" : "#111827",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "default" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
