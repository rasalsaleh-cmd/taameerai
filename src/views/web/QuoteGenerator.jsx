/**
 * QuoteGenerator.jsx — SiteOS AI BOQ Generator
 * Structured input form + AI analysis of architectural drawings.
 * Sends confirmed inputs to Claude API for Pakistani construction BOQ.
 */

import { useState } from "react";

const LOCATIONS = ["Lahore", "Islamabad", "Karachi", "Rawalpindi", "Faisalabad", "Other"];
const QUALITY_LEVELS = [
  { key: "standard", label: "Standard", desc: "A-category materials, standard finishes" },
  { key: "premium", label: "Premium", desc: "Premium materials, quality finishes" },
  { key: "luxury", label: "Luxury", desc: "Imported materials, bespoke finishes" },
];

export default function QuoteGenerator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    projectName: "", client: "", location: "Lahore",
    plotSize: "", coveredArea: "", floors: "2",
    basement: false, bedrooms: "3", bathrooms: "3",
    quality: "standard", notes: "",
  });

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generateBOQ() {
    setLoading(true);
    setError(null);

    const prompt = `You are an expert Pakistani quantity surveyor with deep knowledge of construction costs in ${form.location}.

Generate a detailed Bill of Quantities (BOQ) for this project:

PROJECT DETAILS:
- Project Name: ${form.projectName}
- Client: ${form.client}
- Location: ${form.location}
- Plot Size: ${form.plotSize} Marla
- Covered Area: ${form.coveredArea} sqft
- Floors: ${form.floors}
- Basement: ${form.basement ? "Yes" : "No"}
- Bedrooms: ${form.bedrooms}
- Bathrooms: ${form.bathrooms}
- Build Quality: ${form.quality}
- Additional Notes: ${form.notes || "None"}

Use current ${form.location} market rates (2026). Break down costs by construction phase.
For each phase provide: phase name, key materials with quantities and unit costs, labour costs, and phase total in PKR.
Also provide overall project total.

Format your response as JSON with this exact structure:
{
  "projectSummary": "brief summary",
  "totalCost": number,
  "phases": [
    {
      "key": "excavation",
      "label": "Excavation & Foundation",
      "budget": number,
      "percentage": number,
      "items": [
        { "description": "item name", "quantity": "amount unit", "unitRate": number, "total": number }
      ]
    }
  ],
  "assumptions": ["assumption 1", "assumption 2"]
}

Analyse this project carefully at least 5 times before producing your final numbers. Be precise with Pakistani market rates.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse BOQ response");
      const boq = JSON.parse(jsonMatch[0]);
      setResult(boq);
      setStep(2);
    } catch (err) {
      setError("Failed to generate BOQ. Please try again.");
    } finally {
      setLoading(false);
    }
  }function resetForm() {
    setStep(1);
    setResult(null);
    setError(null);
    setForm({ projectName: "", client: "", location: "Lahore", plotSize: "", coveredArea: "", floors: "2", basement: false, bedrooms: "3", bathrooms: "3", quality: "standard", notes: "" });
  }

  if (step === 2 && result) return <BOQResult result={result} form={form} onReset={resetForm} />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI Quote Generator</h1>
        <p style={styles.subtitle}>Enter project details for an AI-generated Bill of Quantities</p>
      </div>

      <div style={styles.formCard}>
        {/* Project Info */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Project Information</div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label>Project Name</label>
              <input className="input" value={form.projectName} onChange={(e) => updateForm("projectName", e.target.value)} placeholder="e.g. DHA Phase 6 Villa" />
            </div>
            <div style={styles.field}>
              <label>Client Name</label>
              <input className="input" value={form.client} onChange={(e) => updateForm("client", e.target.value)} placeholder="e.g. Mr. Ahmed Khan" />
            </div>
          </div>
          <div style={styles.field}>
            <label>Location</label>
            <select className="input" value={form.location} onChange={(e) => updateForm("location", e.target.value)}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Dimensions</div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label>Plot Size (Marla)</label>
              <input className="input" type="number" value={form.plotSize} onChange={(e) => updateForm("plotSize", e.target.value)} placeholder="e.g. 10" />
            </div>
            <div style={styles.field}>
              <label>Covered Area (sqft)</label>
              <input className="input" type="number" value={form.coveredArea} onChange={(e) => updateForm("coveredArea", e.target.value)} placeholder="e.g. 4500" />
            </div>
            <div style={styles.field}>
              <label>Number of Floors</label>
              <input className="input" type="number" value={form.floors} onChange={(e) => updateForm("floors", e.target.value)} placeholder="e.g. 2" />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label>Bedrooms</label>
              <input className="input" type="number" value={form.bedrooms} onChange={(e) => updateForm("bedrooms", e.target.value)} />
            </div>
            <div style={styles.field}>
              <label>Bathrooms</label>
              <input className="input" type="number" value={form.bathrooms} onChange={(e) => updateForm("bathrooms", e.target.value)} />
            </div>
            <div style={styles.field}>
              <label>Basement</label>
              <button onClick={() => updateForm("basement", !form.basement)} style={{ ...styles.toggle, background: form.basement ? "var(--gold)" : "var(--bg-tertiary)", color: form.basement ? "#000" : "var(--text-muted)" }}>
                {form.basement ? "Yes" : "No"}
              </button>
            </div>
          </div>
        </div>

        {/* Build Quality */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Build Quality</div>
          <div style={styles.qualityRow}>
            {QUALITY_LEVELS.map((q) => (
              <div key={q.key} onClick={() => updateForm("quality", q.key)} style={{ ...styles.qualityCard, ...(form.quality === q.key ? styles.qualityCardActive : {}) }}>
                <div style={styles.qualityLabel}>{q.label}</div>
                <div style={styles.qualityDesc}>{q.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={styles.section}>
          <div style={styles.field}>
            <label>Additional Notes (optional)</label>
            <textarea className="input" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Special requirements, site conditions, etc." rows={3} style={{ resize: "vertical" }} />
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button onClick={generateBOQ} disabled={loading || !form.projectName || !form.coveredArea} style={{ ...styles.generateBtn, opacity: loading || !form.projectName || !form.coveredArea ? 0.6 : 1 }}>
          {loading ? "Analysing project..." : "✦ Generate BOQ"}
        </button>
      </div>
    </div>
  );
}

// ─── BOQ Result View ────────────────────────────────────────
function BOQResult({ result, form, onReset }) {
  const { fPKR } = { fPKR: (n) => n >= 10000000 ? `₨${(n/10000000).toFixed(2)} Cr` : n >= 100000 ? `₨${(n/100000).toFixed(2)} L` : `₨${Math.round(n).toLocaleString()}` };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>BOQ — {form.projectName}</h1>
          <p style={styles.subtitle}>{form.client} · {form.location} · {form.coveredArea} sqft · {form.quality}</p>
        </div>
        <button onClick={onReset} style={styles.resetBtn}>← New Quote</button>
      </div>

      <div style={styles.totalCard}>
        <div style={styles.totalLabel}>Estimated Total Cost</div>
        <div style={styles.totalValue}>{fPKR(result.totalCost)}</div>
        <div style={styles.totalSub}>{result.projectSummary}</div>
      </div>

      {(result.phases || []).map((phase) => (
        <div key={phase.key} style={styles.phaseCard}>
          <div style={styles.phaseHeader}>
            <div style={styles.phaseTitle}>{phase.label}</div>
            <div style={styles.phaseAmount}>{fPKR(phase.budget)}</div>
          </div>
          <div style={styles.phasePercent}>{phase.percentage}% of total</div>
          {(phase.items || []).map((item, i) => (
            <div key={i} style={styles.itemRow}>
              <div style={styles.itemDesc}>{item.description}</div>
              <div style={styles.itemQty}>{item.quantity}</div>
              <div style={styles.itemTotal}>{fPKR(item.total)}</div>
            </div>
          ))}
        </div>
      ))}

      {result.assumptions?.length > 0 && (
        <div style={styles.assumptionsCard}>
          <div style={styles.sectionTitle}>Assumptions</div>
          {result.assumptions.map((a, i) => (
            <div key={i} style={styles.assumption}>• {a}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 900 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: 4 },
  subtitle: { color: "var(--text-muted)", fontSize: "0.875rem" },
  formCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow-sm)" },
  section: { marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid var(--border)" },
  sectionTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  toggle: { padding: "10px 20px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-heading)", fontSize: "0.875rem", transition: "all var(--transition)" },
  qualityRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  qualityCard: { padding: 16, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all var(--transition)" },
  qualityCardActive: { border: "1px solid var(--gold)", background: "var(--gold-dim)" },
  qualityLabel: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 4 },
  qualityDesc: { fontSize: "0.75rem", color: "var(--text-muted)" },
  error: { padding: 12, background: "var(--red-bg)", color: "var(--red)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", marginBottom: 16 },
  generateBtn: { width: "100%", padding: "14px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", cursor: "pointer", transition: "all var(--transition)" },
  resetBtn: { padding: "8px 16px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", fontSize: "0.875rem" },
  totalCard: { background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24, textAlign: "center" },
  totalLabel: { fontSize: "0.8rem", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 },
  totalValue: { fontFamily: "var(--font-mono)", fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)" },
  totalSub: { fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 8 },
  phaseCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 16 },
  phaseHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  phaseTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" },
  phaseAmount: { fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--gold)", fontSize: "1rem" },
  phasePercent: { fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 12 },
  itemRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--border)", gap: 12 },
  itemDesc: { flex: 2, fontSize: "0.85rem", color: "var(--text-secondary)" },
  itemQty: { flex: 1, fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" },
  itemTotal: { flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--text-primary)", textAlign: "right" },
  assumptionsCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 },
  assumption: { fontSize: "0.85rem", color: "var(--text-secondary)", padding: "4px 0" },
};