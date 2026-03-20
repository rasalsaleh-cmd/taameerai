/**
 * ExpenseLog.jsx — SiteOS Supervisor Expense Logger
 * Large tap targets for logging expenses on site.
 * High visibility, simple form, one tap category selection.
 */

import { useState } from "react";

const CATEGORIES = [
  { key: "material",   label: "Material",   icon: "🧱" },
  { key: "labor",      label: "Labour",     icon: "👷" },
  { key: "contractor", label: "Contractor", icon: "📋" },
  { key: "misc",       label: "Other",      icon: "📎" },
];

export default function ExpenseLog({ project, logExpense }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activePhase = (project.phases || []).find((p) => p.status === "active");

  async function handleSubmit() {
    if (!category || !amount || !description) return;
    setSubmitting(true);
    try {
      await logExpense(project.id, {
        phase: activePhase?.key || "",
        category,
        description,
        amount: Number(amount),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to log expense:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setCategory("");
    setDescription("");
    setAmount("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>✅</div>
        <div style={styles.successTitle}>Expense Logged</div>
        <div style={styles.successAmount}>₨{Number(amount).toLocaleString()}</div>
        <div style={styles.successDesc}>{description}</div>
        <button style={styles.newBtn} onClick={reset}>Log Another Expense</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Log Expense</div>
        {activePhase && <div style={styles.phase}>{activePhase.label}</div>}
      </div>

      {/* Category Selection */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Category</div>
        <div style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              style={{
                ...styles.categoryBtn,
                ...(category === cat.key ? styles.categoryBtnActive : {}),
              }}
            >
              <span style={styles.categoryIcon}>{cat.icon}</span>
              <span style={styles.categoryLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Description</div>
        <input
          style={styles.input}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was purchased or paid for?"
        />
      </div>

      {/* Amount */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Amount (PKR)</div>
        <div style={styles.amountWrap}>
          <span style={styles.rupeeSign}>₨</span>
          <input
            style={styles.amountInput}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Submit */}
      <div style={styles.submitWrap}>
        <button
          style={{
            ...styles.submitBtn,
            opacity: !category || !amount || !description || submitting ? 0.5 : 1,
          }}
          onClick={handleSubmit}
          disabled={!category || !amount || !description || submitting}
        >
          {submitting ? "SAVING..." : "SUBMIT EXPENSE"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: 20 },
  header: { padding: "16px 20px 12px", borderBottom: "1px solid #E0E0E0" },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "#111" },
  phase: { fontSize: "0.75rem", color: "#888", marginTop: 4 },
  section: { padding: "16px 20px 0" },
  sectionLabel: { fontSize: "0.7rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: "var(--font-heading)" },
  categoryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  categoryBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 10px", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 12, cursor: "pointer", transition: "all 0.15s ease" },
  categoryBtnActive: { background: "#FFF3E0", border: "2px solid #FF6B00" },
  categoryIcon: { fontSize: "1.75rem" },
  categoryLabel: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#111" },
  input: { width: "100%", padding: "14px 16px", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 12, fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#111", outline: "none" },
  amountWrap: { display: "flex", alignItems: "center", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 12, overflow: "hidden" },
  rupeeSign: { padding: "14px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.25rem", color: "#FF6B00", background: "#FFF3E0", borderRight: "2px solid #E0E0E0" },
  amountInput: { flex: 1, padding: "14px 16px", background: "transparent", border: "none", fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: "#111", outline: "none" },
  submitWrap: { padding: "24px 20px 0" },
  submitBtn: { width: "100%", padding: "20px", background: "#FF6B00", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer", letterSpacing: "0.05em", transition: "opacity 0.15s ease" },
  successContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 24, textAlign: "center" },
  successIcon: { fontSize: "4rem", marginBottom: 16 },
  successTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#111", marginBottom: 8 },
  successAmount: { fontFamily: "var(--font-mono)", fontSize: "2.5rem", fontWeight: 700, color: "#FF6B00", marginBottom: 8 },
  successDesc: { fontSize: "0.95rem", color: "#888", marginBottom: 32 },
  newBtn: { width: "100%", padding: "18px", background: "#111", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
};