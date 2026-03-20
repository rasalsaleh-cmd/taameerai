/**
 * RateEditor.jsx — SiteOS Rate Database Editor
 * Owner can view and edit all construction material and labour rates.
 * Rates are stored in localStorage and override DEFAULT_RATES.
 */

import { useState } from "react";
import { DEFAULT_RATES } from "../../constants/rates.js";

export default function RateEditor() {
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem("siteos-rates");
    return saved ? JSON.parse(saved) : { ...DEFAULT_RATES };
  });
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saved, setSaved] = useState(false);

  function startEdit(key, currentRate) {
    setEditingKey(key);
    setEditValue(currentRate.rate);
  }

  function saveEdit(key) {
    setRates((prev) => ({
      ...prev,
      [key]: { ...prev[key], rate: Number(editValue) },
    }));
    setEditingKey(null);
  }

  function saveAll() {
    localStorage.setItem("siteos-rates", JSON.stringify(rates));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetDefaults() {
    setRates({ ...DEFAULT_RATES });
    localStorage.removeItem("siteos-rates");
  }

  const categories = [...new Set(Object.values(rates).map((r) => r.category))];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Rate Database</h1>
          <p style={styles.subtitle}>Edit material and labour rates for BOQ generation</p>
        </div>
        <div style={styles.headerBtns}>
          <button onClick={resetDefaults} style={styles.resetBtn}>Reset Defaults</button>
          <button onClick={saveAll} style={{ ...styles.saveBtn, background: saved ? "var(--green)" : "var(--gold)" }}>
            {saved ? "✓ Saved" : "Save Rates"}
          </button>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category} style={styles.categorySection}>
          <div style={styles.categoryTitle}>{category}</div>
          {Object.entries(rates)
            .filter(([, r]) => r.category === category)
            .map(([key, rateObj]) => (
              <div key={key} style={styles.rateRow}>
                <div style={styles.rateName}>{rateObj.name}</div>
                <div style={styles.rateUnit}>{rateObj.unit}</div>
                {editingKey === key ? (
                  <div style={styles.editRow}>
                    <input
                      style={styles.rateInput}
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <button style={styles.confirmBtn} onClick={() => saveEdit(key)}>✓</button>
                    <button style={styles.cancelBtn} onClick={() => setEditingKey(null)}>✕</button>
                  </div>
                ) : (
                  <div style={styles.rateValueRow}>
                    <span style={styles.rateValue}>₨{rateObj.rate.toLocaleString()}</span>
                    <button style={styles.editBtn} onClick={() => startEdit(key, rateObj)}>Edit</button>
                  </div>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 800 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: 4 },
  subtitle: { color: "var(--text-muted)", fontSize: "0.875rem" },
  headerBtns: { display: "flex", gap: 10 },
  resetBtn: { padding: "10px 18px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" },
  saveBtn: { padding: "10px 18px", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", transition: "background var(--transition)" },
  categorySection: { marginBottom: 28 },
  categoryTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 },
  rateRow: { display: "flex", alignItems: "center", padding: "12px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 6, gap: 12 },
  rateName: { flex: 2, fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)" },
  rateUnit: { flex: 1, fontSize: "0.8rem", color: "var(--text-muted)" },
  rateValueRow: { flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  rateValue: { fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--gold)", fontSize: "0.95rem" },
  editRow: { flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  rateInput: { width: 120, padding: "6px 10px", background: "var(--bg-tertiary)", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none" },
  editBtn: { padding: "5px 12px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 },
  confirmBtn: { padding: "5px 10px", background: "var(--green-bg)", color: "var(--green)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700 },
  cancelBtn: { padding: "5px 10px", background: "var(--red-bg)", color: "var(--red)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700 },
};