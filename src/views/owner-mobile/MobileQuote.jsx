/**
 * MobileQuote.jsx — SiteOS Owner Mobile Quote Generator
 * Simplified BOQ generator optimised for mobile input.
 * Same AI logic as web version, mobile-friendly layout.
 */

import { useState } from "react";

const LOCATIONS = ["Lahore", "Islamabad", "Karachi", "Rawalpindi", "Faisalabad", "Other"];
const QUALITY_LEVELS = ["Standard", "Premium", "Luxury"];

export default function MobileQuote() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    projectName: "", client: "", location: "Lahore",
    plotSize: "", coveredArea: "", floors: "2",
    basement: false, bedrooms: "3", bathrooms: "3",
    quality: "Standard", notes: "",
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generateBOQ() {
    setLoading(true);
    setError(null);
    const prompt = `You are an expert Pakistani quantity surveyor. Generate a detailed BOQ for this project in ${form.location}:
Project: ${form.projectName}, Client: ${form.client}
Plot: ${form.plotSize} Marla, Covered Area: ${form.coveredArea} sqft
Floors: ${form.floors}, Basement: ${form.basement ? "Yes" : "No"}
Bedrooms: ${form.bedrooms}, Bathrooms: ${form.bathrooms}
Quality: ${form.quality}
Notes: ${form.notes || "None"}
Use current 2026 ${form.location} market rates. Analyse carefully at least 5 times before producing final numbers.
Return ONLY valid JSON:
{"projectSummary":"string","totalCost":number,"phases":[{"key":"string","label":"string","budget":number,"percentage":number}],"assumptions":["string"]}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Parse error");
      setResult(JSON.parse(jsonMatch[0]));
      setStep(2);
    } catch {
      setError("Failed to generate BOQ. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fPKR(n) {
    if (!n) return "—";
    if (n >= 10000000) return `₨${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₨${(n / 100000).toFixed(2)} L`;
    return `₨${Math.round(n).toLocaleString()}`;
  }

  if (step === 2 && result) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => { setStep(1); setResult(null); }} style={styles.backBtn}>← New Quote</button>
          <div style={styles.headerTitle}>BOQ Result</div>
        </div>
        <div style={styles.totalCard}>
          <div style={styles.totalLabel}>Estimated Total</div>
          <div style={styles.totalValue}>{fPKR(result.totalCost)}</div>
          <div style={styles.totalSub}>{result.projectSummary}</div>
        </div>
        {(result.phases || []).map((phase) => (
          <div key={phase.key} style={styles.phaseCard}>
            <div style={styles.phaseRow}>
              <div style={styles.phaseLabel}>{phase.label}</div>
              <div style={styles.phaseAmount}>{fPKR(phase.budget)}</div>
            </div>
            <div style={styles.phasePercent}>{phase.percentage}% of total</div>
          </div>
        ))}
        {result.assumptions?.length > 0 && (
          <div style={styles.card}>
            <div style={styles.sectionLabel}>Assumptions</div>
            {result.assumptions.map((a, i) => (
              <div key={i} style={styles.assumption}>• {a}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>New Quote</div>
        <div style={styles.headerSub}>AI-powered BOQ generator</div>
      </div>

      <div style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Project Name</label>
          <input style={styles.input} value={form.projectName} onChange={(e) => update("projectName", e.target.value)} placeholder="e.g. DHA Phase 6 Villa" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Client Name</label>
          <input style={styles.input} value={form.client} onChange={(e) => update("client", e.target.value)} placeholder="e.g. Mr. Ahmed Khan" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Location</label>
          <select style={styles.input} value={form.location} onChange={(e) => update("location", e.target.value)}>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Plot Size (Marla)</label>
            <input style={styles.input} type="number" value={form.plotSize} onChange={(e) => update("plotSize", e.target.value)} placeholder="10" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Covered Area (sqft)</label>
            <input style={styles.input} type="number" value={form.coveredArea} onChange={(e) => update("coveredArea", e.target.value)} placeholder="4500" />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Floors</label>
            <input style={styles.input} type="number" value={form.floors} onChange={(e) => update("floors", e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Bedrooms</label>
            <input style={styles.input} type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Bathrooms</label>
            <input style={styles.input} type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Basement</label>
          <button onClick={() => update("basement", !form.basement)} style={{ ...styles.toggle, background: form.basement ? "var(--gold)" : "var(--bg-tertiary)", color: form.basement ? "#000" : "var(--text-muted)" }}>
            {form.basement ? "Yes — Basement Included" : "No Basement"}
          </button>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Build Quality</label>
          <div style={styles.qualityRow}>
            {QUALITY_LEVELS.map((q) => (
              <button key={q} onClick={() => update("quality", q)} style={{ ...styles.qualityBtn, background: form.quality === q ? "var(--gold)" : "var(--bg-tertiary)", color: form.quality === q ? "#000" : "var(--text-muted)", border: `1px solid ${form.quality === q ? "var(--gold)" : "var(--border)"}` }}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Notes (optional)</label>
          <textarea style={{ ...styles.input, resize: "none" }} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Special requirements..." rows={3} />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          onClick={generateBOQ}
          disabled={loading || !form.projectName || !form.coveredArea}
          style={{ ...styles.generateBtn, opacity: loading || !form.projectName || !form.coveredArea ? 0.6 : 1 }}
        >
          {loading ? "Analysing project..." : "✦ Generate BOQ"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: 20 },
  header: { padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" },
  headerTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" },
  headerSub: { fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 },
  backBtn: { padding: "6px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: 8 },
  form: { padding: "16px", display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-heading)" },
  input: { padding: "12px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--text-primary)", outline: "none", width: "100%" },
  row: { display: "flex", gap: 10 },
  toggle: { padding: "12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-heading)", fontSize: "0.875rem", transition: "all var(--transition)", width: "100%" },
  qualityRow: { display: "flex", gap: 8 },
  qualityBtn: { flex: 1, padding: "10px 0", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem", transition: "all var(--transition)" },
  error: { padding: 12, background: "var(--red-bg)", color: "var(--red)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" },
  generateBtn: { padding: 16, background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", cursor: "pointer", width: "100%" },
  totalCard: { margin: 16, background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-lg)", padding: 20, textAlign: "center" },
  totalLabel: { fontSize: "0.7rem", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 },
  totalValue: { fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" },
  totalSub: { fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 8 },
  phaseCard: { margin: "0 16px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 14 },
  phaseRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  phaseLabel: { fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" },
  phaseAmount: { fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--gold)", fontSize: "0.875rem" },
  phasePercent: { fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 },
  card: { margin: "0 16px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 14 },
  sectionLabel: { fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 },
  assumption: { fontSize: "0.8rem", color: "var(--text-secondary)", padding: "3px 0" },
};