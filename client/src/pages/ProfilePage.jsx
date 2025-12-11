import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { getProfile, updateProfile } from "../api/profileApi.js";
import { User, Mail, Calendar, Hash, Save, CheckCircle } from "lucide-react";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "long",
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

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
    setSaveSuccess(false);

    try {
      const updated = await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });

      setProfile(updated);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setError(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "800",
            margin: 0,
            marginBottom: "0.5rem",
            color: "#111827",
            letterSpacing: "-0.02em",
          }}
        >
          Profile
        </h1>
        <p style={{ fontSize: "18px", color: "#6b7280", margin: 0 }}>
          Manage your account settings and information
        </p>
      </div>

      <ErrorMessage message={error} />

      {/* Success Message */}
      {saveSuccess && (
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "linear-gradient(135deg, #d1fae5 0%, #f0f9f4 100%)",
            border: "2px solid #4a7c59",
            borderRadius: "12px",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <CheckCircle size={20} color="#4a7c59" />
          <span
            style={{ fontSize: "15px", fontWeight: "600", color: "#065f46" }}
          >
            Profile updated successfully!
          </span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left: Account Info Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%)",
            borderRadius: "16px",
            padding: "2rem",
            border: "2px solid #4a7c59",
            boxShadow: "0 2px 8px rgba(74, 124, 89, 0.15)",
          }}
        >
          {/* Profile Avatar */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "32px",
              fontWeight: "800",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(74, 124, 89, 0.3)",
            }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Account Overview
          </h2>

          {/* Info Items */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={16} color="#4a7c59" />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                }}
              >
                Name
              </span>
            </div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
                marginLeft: "2.5rem",
              }}
            >
              {profile?.name || "—"}
            </p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mail size={16} color="#4a7c59" />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                }}
              >
                Email
              </span>
            </div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
                marginLeft: "2.5rem",
                wordBreak: "break-all",
              }}
            >
              {profile?.email || "—"}
            </p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Hash size={16} color="#4a7c59" />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                }}
              >
                User ID
              </span>
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "500",
                fontFamily: "monospace",
                color: "#6b7280",
                margin: 0,
                marginLeft: "2.5rem",
              }}
            >
              {profile?.id || "—"}
            </p>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calendar size={16} color="#4a7c59" />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                }}
              >
                Member Since
              </span>
            </div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
                marginLeft: "2.5rem",
              }}
            >
              {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
            </p>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            borderRadius: "16px",
            padding: "2rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={20} color="#ffffff" />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#111827",
                margin: 0,
              }}
            >
              Edit Profile
            </h2>
          </div>
          <p
            style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "2rem" }}
          >
            Update your account information
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  color: "#111827",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid #4a7c59";
                  e.target.style.boxShadow = "0 0 0 3px rgba(74, 124, 89, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid #d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  color: "#111827",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid #4a7c59";
                  e.target.style.boxShadow = "0 0 0 3px rgba(74, 124, 89, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid #d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Info Box */}
            <div
              style={{
                padding: "1rem",
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "#92400e",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                <strong>⚠️ Note:</strong> Changing your email will update your
                login credentials. Make sure you remember the new email address.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "8px",
                border: "none",
                background: saving
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(74, 124, 89, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Save size={18} />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>

          {/* Additional Info */}
          <div
            style={{
              marginTop: "2rem",
              padding: "1.25rem",
              background: "#f9fafb",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#9ca3af",
                margin: 0,
                marginBottom: "0.5rem",
              }}
            >
              Account Security
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Your data is securely stored and encrypted. We never share your
              personal information with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
