/**
 * LabourAttendance.jsx — SiteOS Supervisor Labour Attendance
 * Supervisor logs daily worker attendance on site.
 * Simple counter interface, large tap targets.
 */

import { useState } from "react";

const LABOUR_TYPES = [
  { key: "mason",       label: "Mason (Raj Mistri)",  rate: 2500 },
  { key: "helper",      label: "Helper",              rate: 1500 },
  { key: "plumber",     label: "Plumber",             rate: 2800 },
  { key: "electrician", label: "Electrician",         rate: 3000 },
  { key: "carpenter",   label: "Carpenter",           rate: 2500 },
  { key: "painter",     label: "Painter",             rate: 2200 },
  { key: "steel_fixer", label: "Steel Fixer",         rate: 2800 },
  { key: "other",       label: "Other Labour",        rate: 1500 },
];

export default function LabourAttendance({ project }) {
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(LABOUR_TYPES.map((t) => [t.key, 0]))
  );
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState("");

  function increment(key) {
    setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  }

  function decrement(key) {
    setCounts((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
  }

  const totalWorkers = Object.values(counts).reduce((s, c) => s + c, 0);
  const totalCost = LABOUR_TYPES.reduce((s, t) => s + counts[t.key] * t.rate, 0);

  function handleSubmit() {
    if (totalWorkers === 0) return;
    // Log attendance as a note — full attendance module in future
    setSubmitted(true);
  }

  function reset() {
    setCounts(Object.fromEntries(LABOUR_TYPES.map((t) => [t.key, 0])));
    setNotes("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>👷</div>
        <div style={styles.successTitle}>Attendance Logged</div>
        <div style={styles.successCount}>{totalWorkers} Workers</div>
        <div style={styles.successCost}>Est. Daily Cost: ₨{totalCost.toLocaleString()}</div>
        <button style={styles.newBtn} onClick={reset}>Log New Day</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Labour Attendance</div>
        <div style={styles.date}>{new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>

      {/* Summary Strip */}
      <div style={styles.summaryStrip}>
        <div style={styles.summaryItem}>
          <div style={styles.summaryValue}>{totalWorkers}</div>
          <div style={styles.summaryLabel}>Total Workers</div>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <div style={styles.summaryValue}>₨{(totalCost / 1000).toFixed(1)}K</div>
          <div style={styles.summaryLabel}>Est. Daily Cost</div>
        </div>
      </div>

      {/* Labour Counters */}
      <div style={styles.list}>
        {LABOUR_TYPES.map((type) => (
          <div key={type.key} style={styles.labourRow}>
            <div style={styles.labourInfo}>
              <div style={styles.labourName}>{type.label}</div>
              <div style={styles.labourRate}>₨{type.rate.toLocaleString()}/day</div>
            </div>
            <div style={styles.counter}>
              <button style={styles.counterBtn} onClick={() => decrement(type.key)}>−</button>
              <div style={styles.counterValue}>{counts[type.key]}</div>
              <button style={styles.counterBtnAdd} onClick={() => increment(type.key)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={styles.notesWrap}>
        <div style={styles.sectionLabel}>Notes (optional)</div>
        <input style={styles.input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any attendance notes..." />
      </div>

      {/* Submit */}
      <div style={styles.submitWrap}>
        <button
          style={{ ...styles.submitBtn, opacity: totalWorkers === 0 ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={totalWorkers === 0}
        >
          LOG {totalWorkers} WORKERS
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: 20 },
  header: { padding: "16px 20px 12px", borderBottom: "1px solid #E0E0E0" },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "#111" },
  date: { fontSize: "0.75rem", color: "#888", marginTop: 4 },
  summaryStrip: { display: "flex", background: "#1A1A1A", padding: "14px 0" },
  summaryItem: { flex: 1, textAlign: "center" },
  summaryValue: { fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.5rem", color: "#C4A35A" },
  summaryLabel: { fontSize: "0.65rem", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 },
  summaryDivider: { width: 1, background: "#333", margin: "4px 0" },
  list: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 },
  labourRow: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F5F5F5", borderRadius: 12, padding: "12px 16px" },
  labourInfo: { flex: 1 },
  labourName: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9rem", color: "#111" },
  labourRate: { fontSize: "0.75rem", color: "#888", marginTop: 2 },
  counter: { display: "flex", alignItems: "center", gap: 0 },
  counterBtn: { width: 40, height: 40, border: "none", background: "#E0E0E0", color: "#111", fontSize: "1.25rem", fontWeight: 700, cursor: "pointer", borderRadius: "8px 0 0 8px" },
  counterBtnAdd: { width: 40, height: 40, border: "none", background: "#FF6B00", color: "#FFF", fontSize: "1.25rem", fontWeight: 700, cursor: "pointer", borderRadius: "0 8px 8px 0" },
  counterValue: { width: 44, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFF", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.1rem", color: "#111", border: "1px solid #E0E0E0", borderLeft: "none", borderRight: "none" },
  notesWrap: { padding: "8px 16px 0" },
  sectionLabel: { fontSize: "0.7rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "var(--font-heading)" },
  input: { width: "100%", padding: "14px 16px", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 12, fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#111", outline: "none" },
  submitWrap: { padding: "16px 16px 0" },
  submitBtn: { width: "100%", padding: "20px", background: "#FF6B00", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer", letterSpacing: "0.05em" },
  successContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 24, textAlign: "center" },
  successIcon: { fontSize: "4rem", marginBottom: 16 },
  successTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#111", marginBottom: 8 },
  successCount: { fontFamily: "var(--font-mono)", fontSize: "2.5rem", fontWeight: 700, color: "#FF6B00", marginBottom: 4 },
  successCost: { fontSize: "0.95rem", color: "#888", marginBottom: 32 },
  newBtn: { width: "100%", padding: "18px", background: "#111", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
};