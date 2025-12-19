import { useState } from "react";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { upsertMetricDay } from "../api/metricsApi.js";

function CSVImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("upload"); // upload, map, preview, importing, success
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    date: "",
    sleepHours: "",
    rhr: "",
    hrv: "",
    strain: "",
    notes: "",
  });
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  function handleFileSelect(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Parse CSV
    Papa.parse(selectedFile, {
      complete: (results) => {
        if (results.data.length === 0) {
          setError("CSV file is empty");
          return;
        }

        // Get headers from first row
        const csvHeaders = results.data[0];
        setHeaders(csvHeaders);

        // Get data rows (skip header)
        const dataRows = results.data.slice(1).filter((row) => {
          // Filter out empty rows
          return row.some((cell) => cell && cell.trim() !== "");
        });

        setCsvData(dataRows);

        // Auto-detect columns based on common names
        const mapping = { ...columnMapping };
        csvHeaders.forEach((header, index) => {
          const lower = header.toLowerCase();
          if (lower.includes("date")) mapping.date = index;
          if (lower.includes("sleep")) mapping.sleepHours = index;
          if (lower.includes("rhr") || lower.includes("heart rate"))
            mapping.rhr = index;
          if (lower.includes("hrv")) mapping.hrv = index;
          if (lower.includes("strain") || lower.includes("load"))
            mapping.strain = index;
          if (lower.includes("note")) mapping.notes = index;
        });

        setColumnMapping(mapping);
        setStep("map");
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      },
    });
  }

  function handleColumnMappingChange(field, columnIndex) {
    setColumnMapping({
      ...columnMapping,
      [field]: columnIndex === "" ? "" : parseInt(columnIndex),
    });
  }

  function validateMapping() {
    // Date is required
    if (columnMapping.date === "") {
      setError("Date column is required");
      return false;
    }

    // At least one metric is required
    const hasMetric =
      columnMapping.sleepHours !== "" ||
      columnMapping.rhr !== "" ||
      columnMapping.hrv !== "" ||
      columnMapping.strain !== "";

    if (!hasMetric) {
      setError("At least one metric column is required");
      return false;
    }

    return true;
  }

  function handlePreview() {
    if (!validateMapping()) return;
    setError(null);
    setStep("preview");
  }

  async function handleImport() {
    setImporting(true);
    setImportProgress(0);
    setError(null);

    const results = {
      total: csvData.length,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        // Extract data based on column mapping
        const dateStr =
          columnMapping.date !== "" ? row[columnMapping.date] : null;

        if (!dateStr || dateStr.trim() === "") {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing date`);
          continue;
        }

        // Parse date (handle multiple formats)
        let parsedDate;
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) throw new Error("Invalid date");
          parsedDate = d.toISOString().split("T")[0]; // YYYY-MM-DD
        } catch {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Invalid date format "${dateStr}"`);
          continue;
        }

        // Extract metrics
        const payload = {
          date: parsedDate,
          sleepHours:
            columnMapping.sleepHours !== "" && row[columnMapping.sleepHours]
              ? parseFloat(row[columnMapping.sleepHours]) || null
              : null,
          rhr:
            columnMapping.rhr !== "" && row[columnMapping.rhr]
              ? parseFloat(row[columnMapping.rhr]) || null
              : null,
          hrv:
            columnMapping.hrv !== "" && row[columnMapping.hrv]
              ? parseFloat(row[columnMapping.hrv]) || null
              : null,
          strain:
            columnMapping.strain !== "" && row[columnMapping.strain]
              ? parseFloat(row[columnMapping.strain]) || null
              : null,
          notes:
            columnMapping.notes !== "" && row[columnMapping.notes]
              ? row[columnMapping.notes]
              : null,
        };

        // Import to database
        await upsertMetricDay(payload);
        results.imported++;

        // Update progress
        setImportProgress(Math.round(((i + 1) / csvData.length) * 100));
      } catch (e) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }

    setImportResults(results);
    setImporting(false);
    setStep("success");

    // Notify parent to refresh data
    if (onSuccess) onSuccess();
  }

  function handleReset() {
    setFile(null);
    setStep("upload");
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({
      date: "",
      sleepHours: "",
      rhr: "",
      hrv: "",
      strain: "",
      notes: "",
    });
    setImportProgress(0);
    setImportResults(null);
    setError(null);
  }

  function handleClose() {
    handleReset();
    onClose();
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
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
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
          onClick={handleClose}
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
              <Upload size={20} color="#ffffff" />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#111827",
                margin: 0,
              }}
            >
              Import CSV
            </h2>
          </div>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            {step === "upload" && "Upload your recovery data from other apps"}
            {step === "map" && "Map your CSV columns to our fields"}
            {step === "preview" && "Review data before importing"}
            {step === "importing" && "Importing your data..."}
            {step === "success" && "Import complete!"}
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
              display: "flex",
              alignItems: "start",
              gap: "0.5rem",
            }}
          >
            <AlertCircle
              size={18}
              color="#ef4444"
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <p style={{ fontSize: "14px", color: "#991b1b", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === "upload" && (
          <div>
            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: "12px",
                padding: "3rem 2rem",
                textAlign: "center",
                background: "#f9fafb",
                marginBottom: "1.5rem",
              }}
            >
              <Upload
                size={48}
                color="#9ca3af"
                style={{ marginBottom: "1rem" }}
              />
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                {file ? file.name : "Choose a CSV file"}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "1.5rem",
                }}
              >
                From Whoop, Garmin, Strava, or any fitness app
              </p>
              <label
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-block",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(74, 124, 89, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Select File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div
              style={{
                padding: "1rem",
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
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
                <strong>💡 Tip:</strong> Your CSV should have columns for date
                and at least one metric (sleep, HRV, heart rate, or strain).
                We'll help you map the columns in the next step.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Column Mapping */}
        {step === "map" && (
          <div>
            <p
              style={{
                fontSize: "15px",
                color: "#6b7280",
                marginBottom: "1.5rem",
              }}
            >
              Found <strong>{csvData.length} rows</strong> of data. Map your CSV
              columns to our fields:
            </p>

            <div style={{ marginBottom: "2rem" }}>
              {[
                { field: "date", label: "Date", required: true },
                { field: "sleepHours", label: "Sleep Hours", required: false },
                { field: "rhr", label: "Resting Heart Rate", required: false },
                { field: "hrv", label: "HRV", required: false },
                { field: "strain", label: "Strain", required: false },
                { field: "notes", label: "Notes", required: false },
              ].map((item) => (
                <div key={item.field} style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    {item.label}{" "}
                    {item.required && (
                      <span style={{ color: "#ef4444" }}>*</span>
                    )}
                  </label>
                  <select
                    value={columnMapping[item.field]}
                    onChange={(e) =>
                      handleColumnMappingChange(item.field, e.target.value)
                    }
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
                  >
                    <option value="">-- Not mapped --</option>
                    {headers.map((header, index) => (
                      <option key={index} value={index}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setStep("upload")}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handlePreview}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Preview Data
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview */}
        {step === "preview" && (
          <div>
            <p
              style={{
                fontSize: "15px",
                color: "#6b7280",
                marginBottom: "1.5rem",
              }}
            >
              Preview of first 5 rows:
            </p>

            <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        color: "#6b7280",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        color: "#6b7280",
                      }}
                    >
                      Sleep
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        color: "#6b7280",
                      }}
                    >
                      RHR
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        color: "#6b7280",
                      }}
                    >
                      HRV
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        color: "#6b7280",
                      }}
                    >
                      Strain
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                      }}
                    >
                      <td style={{ padding: "0.75rem" }}>
                        {columnMapping.date !== ""
                          ? row[columnMapping.date]
                          : "—"}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {columnMapping.sleepHours !== ""
                          ? row[columnMapping.sleepHours]
                          : "—"}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {columnMapping.rhr !== ""
                          ? row[columnMapping.rhr]
                          : "—"}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {columnMapping.hrv !== ""
                          ? row[columnMapping.hrv]
                          : "—"}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {columnMapping.strain !== ""
                          ? row[columnMapping.strain]
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setStep("map")}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: "8px",
                  border: "none",
                  background: importing
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: importing ? "not-allowed" : "pointer",
                }}
              >
                {importing ? "Importing..." : `Import ${csvData.length} Rows`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Importing Progress */}
        {step === "importing" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 1.5rem",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #4a7c59",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Importing...
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "1rem",
              }}
            >
              {importProgress}% complete
            </p>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${importProgress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #4a7c59 0%, #6b9e78 100%)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {/* STEP 5: Success */}
        {step === "success" && importResults && (
          <div>
            <div
              style={{
                textAlign: "center",
                padding: "2rem 0",
                marginBottom: "2rem",
              }}
            >
              <CheckCircle
                size={64}
                color="#4a7c59"
                style={{ marginBottom: "1rem" }}
              />
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Import Complete!
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280" }}>
                Successfully imported {importResults.imported} of{" "}
                {importResults.total} rows
              </p>
            </div>

            <div
              style={{
                padding: "1.5rem",
                background: "#f9fafb",
                borderRadius: "12px",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0,
                      marginBottom: "0.25rem",
                    }}
                  >
                    Total Rows
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {importResults.total}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0,
                      marginBottom: "0.25rem",
                    }}
                  >
                    Imported
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#4a7c59",
                      margin: 0,
                    }}
                  >
                    {importResults.imported}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0,
                      marginBottom: "0.25rem",
                    }}
                  >
                    Failed
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: importResults.failed > 0 ? "#ef4444" : "#6b7280",
                      margin: 0,
                    }}
                  >
                    {importResults.failed}
                  </p>
                </div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div
                style={{
                  padding: "1rem",
                  background: "#fee2e2",
                  border: "1px solid #ef4444",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#991b1b",
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  Errors:
                </p>
                {importResults.errors.slice(0, 10).map((err, index) => (
                  <p
                    key={index}
                    style={{
                      fontSize: "12px",
                      color: "#7f1d1d",
                      margin: 0,
                      marginBottom: "0.25rem",
                    }}
                  >
                    • {err}
                  </p>
                ))}
                {importResults.errors.length > 10 && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#7f1d1d",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    ... and {importResults.errors.length - 10} more errors
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleClose}
              style={{
                width: "100%",
                padding: "0.875rem",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #4a7c59 0%, #6b9e78 100%)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CSVImportModal;
