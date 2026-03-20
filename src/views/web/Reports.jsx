/**
 * Reports.jsx — SiteOS Client Progress Reports
 * Owner selects a project and generates a shareable progress report.
 * Includes phase progress, photo timeline, budget summary toggle, change orders.
 */

import { useState } from "react";
import { fPKR, fDate } from "../../utils/formatting.js";

export default function Reports({ projects }) {
  const [selectedId, setSelectedId] = useState("");
  const [showBudget, setShowBudget] = useState(true);
  const [showPhotos, setShowPhotos] = useState(true);

  const project = projects.find((p) => p.id === selectedId);

  function shareWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Progress Report — ${project.name}\nClient: ${project.client}\nLocation: ${project.location}\n\nView full report: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reports</h1>
          <p style={styles.subtitle}>Generate and share client progress reports</p>
        </div>
      </div>

      {/* Project Selector */}
      <div style={styles.selectorCard}>
        <label>Select Project</label>
        <select className="input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ marginTop: 6 }}>
          <option value="">Choose a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.client}</option>
          ))}
        </select>
      </div>

      {project && (
        <>
          {/* Report Options */}
          <div style={styles.optionsRow}>
            <div style={styles.optionLabel}>Report Options</div>
            <div style={styles.toggleRow}>
              <button onClick={() => setShowBudget(!showBudget)} style={{ ...styles.toggleBtn, background: showBudget ? "var(--gold-dim)" : "var(--bg-tertiary)", color: showBudget ? "var(--gold)" : "var(--text-muted)", border: `1px solid ${showBudget ? "var(--gold-border)" : "var(--border)"}` }}>
                {showBudget ? "✓" : "○"} Budget Summary
              </button>
              <button onClick={() => setShowPhotos(!showPhotos)} style={{ ...styles.toggleBtn, background: showPhotos ? "var(--gold-dim)" : "var(--bg-tertiary)", color: showPhotos ? "var(--gold)" : "var(--text-muted)", border: `1px solid ${showPhotos ? "var(--gold-border)" : "var(--border)"}` }}>
                {showPhotos ? "✓" : "○"} Photo Timeline
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div style={styles.reportCard}>
            {/* Report Header */}
            <div style={styles.reportHeader}>
              <div style={styles.reportLogo}>SiteOS</div>
              <div style={styles.reportMeta}>
                <div style={styles.reportTitle}>{project.name}</div>
                <div style={styles.reportSubtitle}>{project.client} · {project.location}</div>
                <div style={styles.reportDate}>Report generated: {fDate(new Date().toISOString())}</div>
              </div>
            </div>

            <div style={styles.reportDivider} />

            {/* Phase Progress */}
            <div style={styles.reportSection}>
              <div style={styles.reportSectionTitle}>Construction Progress</div>
              {(project.phases || []).map((phase) => {
                const statusColor = { done: "var(--green)", active: "var(--gold)", pending: "var(--text-muted)" };
                return (
                  <div key={phase.id} style={styles.reportPhaseRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[phase.status] || "var(--text-muted)", flexShrink: 0 }} />
                      <span style={styles.reportPhaseName}>{phase.label}</span>
                    </div>
                    <div style={styles.reportPhaseProgress}>
                      <div style={styles.reportProgressBar}>
                        <div style={{ height: "100%", background: statusColor[phase.status] || "var(--bg-tertiary)", borderRadius: 100, width: `${phase.progress || 0}%`, transition: "width 0.5s ease" }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>{phase.progress || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget Summary */}
            {showBudget && (
              <div style={styles.reportSection}>
                <div style={styles.reportSectionTitle}>Budget Summary</div>
                <div style={styles.budgetRow}>
                  {(() => {
                    const spent = (project.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
                    const remaining = (project.contractValue || 0) - spent;
                    const pct = project.contractValue > 0 ? ((spent / project.contractValue) * 100).toFixed(1) : 0;
                    return (
                      <>
                        <div style={styles.budgetItem}><div style={styles.budgetItemLabel}>Total Spent</div><div style={styles.budgetItemValue}>{fPKR(spent)}</div></div>
                        <div style={styles.budgetItem}><div style={styles.budgetItemLabel}>Remaining</div><div style={{ ...styles.budgetItemValue, color: remaining >= 0 ? "var(--green)" : "var(--red)" }}>{fPKR(remaining)}</div></div>
                        <div style={styles.budgetItem}><div style={styles.budgetItemLabel}>Usage</div><div style={styles.budgetItemValue}>{pct}%</div></div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Change Orders */}
            {(project.changeOrders || []).length > 0 && (
              <div style={styles.reportSection}>
                <div style={styles.reportSectionTitle}>Change Orders</div>
                {(project.changeOrders || []).map((co) => (
                  <div key={co.id} style={styles.coRow}>
                    <div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{co.description}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{co.phase} · {fDate(co.date)}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", color: "var(--gold)", fontSize: "0.9rem" }}>{fPKR(co.amount)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Timeline */}
            {showPhotos && (
              <div style={styles.reportSection}>
                <div style={styles.reportSectionTitle}>Photo Timeline</div>
                {(project.checklistLogs || []).length === 0 ? (
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>No site photos yet.</p>
                ) : (
                  <div style={styles.photoGrid}>
                    {(project.checklistLogs || []).flatMap((log) =>
                      (log.items || []).filter((i) => i.photo).map((item) => (
                        <div key={item.id} style={styles.photoCard}>
                          <img src={item.photo} alt={item.item} style={styles.photo} />
                          <div style={styles.photoCaption}>{item.item}</div>
                          <div style={styles.photoDate}>{fDate(log.date)}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Share Button */}
          <button onClick={shareWhatsApp} style={styles.whatsappBtn}>
            Share via WhatsApp
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 900 },
  header: { marginBottom: 24 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: 4 },
  subtitle: { color: "var(--text-muted)", fontSize: "0.875rem" },
  selectorCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 20 },
  optionsRow: { marginBottom: 20 },
  optionLabel: { fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 },
  toggleRow: { display: "flex", gap: 10 },
  toggleBtn: { padding: "8px 16px", borderRadius: 100, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all var(--transition)" },
  reportCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow-md)", marginBottom: 20 },
  reportHeader: { display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 },
  reportLogo: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", color: "var(--gold)", background: "var(--gold-dim)", padding: "6px 12px", borderRadius: "var(--radius-sm)" },
  reportMeta: { flex: 1 },
  reportTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: 2 },
  reportSubtitle: { fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 2 },
  reportDate: { fontSize: "0.75rem", color: "var(--text-muted)" },
  reportDivider: { height: 1, background: "var(--border)", marginBottom: 20 },
  reportSection: { marginBottom: 24 },
  reportSectionTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 },
  reportPhaseRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 10 },
  reportPhaseName: { fontSize: "0.875rem", color: "var(--text-primary)", minWidth: 160 },
  reportPhaseProgress: { flex: 1, display: "flex", alignItems: "center", gap: 10 },
  reportProgressBar: { flex: 1, height: 6, background: "var(--bg-tertiary)", borderRadius: 100, overflow: "hidden" },
  budgetRow: { display: "flex", gap: 16 },
  budgetItem: { flex: 1, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", padding: 16 },
  budgetItemLabel: { fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 },
  budgetItemValue: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" },
  coRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 },
  photoCard: { borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" },
  photo: { width: "100%", height: 100, objectFit: "cover" },
  photoCaption: { padding: "6px 8px 2px", fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 500 },
  photoDate: { padding: "0 8px 6px", fontSize: "0.7rem", color: "var(--text-muted)" },
  whatsappBtn: { width: "100%", padding: 14, background: "#25D366", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
};