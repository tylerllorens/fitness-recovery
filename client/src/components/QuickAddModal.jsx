import { useState } from "react";
import { X, Save } from "lucide-react";
import { upsertMetricDay } from "../api/metricsApi.js";

function QuickAddModal({ isOpen, onClose, onSuccess, initialDate }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [date, setDate] = useState(initialDate || todayStr);
  const [sleepHours, setSleepHours] = useState("");
  const [rhr, setRhr] = useState("");
  const [hrv, setHrv] = useState("");
  const [strain, setStrain] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        date,
        sleepHours: sleepHours !== "" ? Number(sleepHours) : null,
        rhr: rhr !== "" ? Number(rhr) : null,
        hrv: hrv !== "" ? Number(hrv) : null,
        strain: strain !== "" ? Number(strain) : null,
        notes: notes.trim() || null,
      };

      await upsertMetricDay(payload);

      // Reset form
      setSleepHours("");
      setRhr("");
      setHrv("");
      setStrain("");
      setNotes("");

      // Notify parent
      if (onSuccess) onSuccess();

      // Close modal
      onClose();
    } catch (e) {
      setError(e.message || "Failed to save metrics");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <X size={24} color="#6b7280" />
        </button>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
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
              <Save size={20} color="#ffffff" />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#111827",
                margin: 0,
              }}
            >
              Quick Add Metrics
            </h2>
          </div>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Log today's recovery data in seconds
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <p style={{ fontSize: "14px", color: "#991b1b", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Date */}
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
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
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

          {/* Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Sleep (hours)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="7.5"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
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

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Resting HR (bpm)
              </label>
              <input
                type="number"
                min="20"
                max="200"
                value={rhr}
                onChange={(e) => setRhr(e.target.value)}
                placeholder="55"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
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

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                HRV (ms)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={hrv}
                onChange={(e) => setHrv(e.target.value)}
                placeholder="65"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
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

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Strain (0-21)
              </label>
              <input
                type="number"
                min="0"
                max="21"
                step="0.1"
                value={strain}
                onChange={(e) => setStrain(e.target.value)}
                placeholder="12"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
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
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How are you feeling today?"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                resize: "vertical",
                outline: "none",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
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
            {saving ? "Saving..." : "Save Metrics"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuickAddModal;
