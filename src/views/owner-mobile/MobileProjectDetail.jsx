/**
 * MobileProjectDetail.jsx — SiteOS Owner Mobile Project Detail
 * Full project detail optimised for phone screens.
 * Tabbed view with swipeable sections.
 */

import { useState } from "react";
import { fPKR, fDate } from "../../utils/formatting.js";

const TABS = ["Overview", "Phases", "Budget", "Expenses"];

export default function MobileProjectDetail({ projects, projectId, onBack, updatePhase, addPhase, deletePhase, logExpense }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const project = projects.find((p) => p.id === projectId);

  if (!project) return <div style={styles.empty}>Project not found.</div>;

  const totalSpent = (project.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const remaining = (project.contractValue || 0) - totalSpent;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <div style={styles.headerInfo}>
          <div style={styles.title}>{project.name}</div>
          <div style={styles.subtitle}>{project.client}</div>
        </div>
        <div style={styles.contractBadge}>{fPKR(project.contractValue)}</div>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{fPKR(totalSpent)}</div>
          <div style={styles.statLabel}>Spent</div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <div style={{ ...styles.statValue, color: remaining >= 0 ? "var(--green)" : "var(--red)" }}>{fPKR(remaining)}</div>
          <div style={styles.statLabel}>Remaining</div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <div style={styles.statValue}>{(project.phases || []).filter((p) => p.status === "done").length}/{(project.phases || []).length}</div>
          <div style={styles.statLabel}>Phases</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === "Overview" && <MobileOverview project={project} totalSpent={totalSpent} />}
        {activeTab === "Phases" && <MobilePhases project={project} updatePhase={updatePhase} addPhase={addPhase} deletePhase={deletePhase} />}
        {activeTab === "Budget" && <MobileBudget project={project} totalSpent={totalSpent} remaining={remaining} />}
        {activeTab === "Expenses" && <MobileExpenses project={project} logExpense={logExpense} />}
      </div>
    </div>
  );
}

function MobileOverview({ project, totalSpent }) {
  const activePhase = (project.phases || []).find((p) => p.status === "active");
  const progress = project.contractValue > 0 ? Math.min((totalSpent / project.contractValue) * 100, 100) : 0;
  return (
    <div style={styles.tabContent}>
      {activePhase && (
        <div style={styles.activePhaseCard}>
          <div style={styles.cardLabel}>Current Phase</div>
          <div style={styles.activePhaseName}>{activePhase.label}</div>
          <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${activePhase.progress || 0}%` }} /></div>
          <div style={styles.progressText}>{activePhase.progress || 0}% · Due {fDate(activePhase.expectedEnd)}</div>
        </div>
      )}
      <div style={styles.infoGrid}>
        {[
          { label: "Location", value: project.location },
          { label: "Area", value: `${project.totalArea} sqft` },
          { label: "Floors", value: project.floors },
          { label: "Start Date", value: fDate(project.startDate) },
        ].map((item) => (
          <div key={item.label} style={styles.infoCard}>
            <div style={styles.cardLabel}>{item.label}</div>
            <div style={styles.infoValue}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={styles.card}>
        <div style={styles.cardLabel}>Overall Budget Usage</div>
        <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${progress}%` }} /></div>
        <div style={styles.progressText}>{fPKR(totalSpent)} of {fPKR(project.contractValue)} — {progress.toFixed(1)}%</div>
      </div>
    </div>
  );
}

function MobilePhases({ project, updatePhase, addPhase, deletePhase }) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newLabel, setNewLabel] = useState("");
  const statusColor = { done: "var(--green)", active: "var(--gold)", pending: "var(--text-muted)" };

  async function saveEdit(id) {
    await updatePhase(id, editValues);
    setEditingId(null);
  }

  async function handleAdd() {
    if (!newLabel.trim()) return;
    await addPhase(project.id, { key: newLabel.toLowerCase().replace(/\s+/g, "_"), label: newLabel, budget: 0 });
    setNewLabel("");
  }

  return (
    <div style={styles.tabContent}>
      {(project.phases || []).map((phase) => (
        <div key={phase.id} style={styles.card}>
          {editingId === phase.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input style={styles.mobileInput} value={editValues.label} onChange={(e) => setEditValues({ ...editValues, label: e.target.value })} placeholder="Phase name" />
              <input style={styles.mobileInput} type="number" value={editValues.budget} onChange={(e) => setEditValues({ ...editValues, budget: Number(e.target.value) })} placeholder="Budget PKR" />
              <input style={styles.mobileInput} type="date" value={editValues.expectedEnd || ""} onChange={(e) => setEditValues({ ...editValues, expectedEnd: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.saveBtn} onClick={() => saveEdit(phase.id)}>Save</button>
                <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[phase.status] || "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
                  <div style={styles.phaseName}>{phase.label}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={styles.editBtn} onClick={() => { setEditingId(phase.id); setEditValues({ label: phase.label, budget: phase.budget, expectedEnd: phase.expectedEnd }); }}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => deletePhase(phase.id)}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, marginLeft: 16 }}>Budget: {fPKR(phase.budget)} · Due: {fDate(phase.expectedEnd)}</div>
            </>
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input style={{ ...styles.mobileInput, flex: 1 }} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New phase name..." />
        <button style={styles.addBtn} onClick={handleAdd}>+ Add</button>
      </div>
    </div>
  );
}

function MobileBudget({ project, totalSpent, remaining }) {
  const byCategory = (project.expenses || []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  return (
    <div style={styles.tabContent}>
      {[
        { label: "Contract Value", value: fPKR(project.contractValue), color: "var(--text-primary)" },
        { label: "Total Spent", value: fPKR(totalSpent), color: "var(--text-primary)" },
        { label: "Remaining", value: fPKR(remaining), color: remaining >= 0 ? "var(--green)" : "var(--red)" },
      ].map((item) => (
        <div key={item.label} style={styles.card}>
          <div style={styles.cardLabel}>{item.label}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
        </div>
      ))}
      <div style={styles.card}>
        <div style={styles.cardLabel}>Spend by Category</div>
        {Object.entries(byCategory).map(([cat, amt]) => (
          <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ textTransform: "capitalize", color: "var(--text-secondary)", fontSize: "0.875rem" }}>{cat}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)", fontSize: "0.875rem" }}>{fPKR(amt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileExpenses({ project, logExpense }) {
  const [form, setForm] = useState({ phase: "", category: "material", description: "", amount: "" });
  const [showing, setShowing] = useState(false);

  async function handleSubmit() {
    if (!form.amount || !form.description) return;
    await logExpense(project.id, { ...form, amount: Number(form.amount) });
    setForm({ phase: "", category: "material", description: "", amount: "" });
    setShowing(false);
  }

  return (
    <div style={styles.tabContent}>
      <button style={styles.addBtn} onClick={() => setShowing(!showing)}>+ Log Expense</button>
      {showing && (
        <div style={{ ...styles.card, display: "flex", flexDirection: "column", gap: 8 }}>
          <select style={styles.mobileInput} value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })}>
            <option value="">Select phase</option>
            {(project.phases || []).map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select style={styles.mobileInput} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="material">Material</option>
            <option value="labor">Labour</option>
            <option value="contractor">Contractor</option>
            <option value="misc">Misc</option>
          </select>
          <input style={styles.mobileInput} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <input style={styles.mobileInput} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount in PKR" />
          <button style={styles.saveBtn} onClick={handleSubmit}>Save Expense</button>
        </div>
      )}
      {(project.expenses || []).map((e) => (
        <div key={e.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{e.description}</div>
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--gold)", fontSize: "0.875rem" }}>{fPKR(e.amount)}</div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>{e.phase} · {e.category} · {fDate(e.date)}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { paddingBottom: 20 },
  empty: { padding: 24, color: "var(--text-muted)" },
  header: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" },
  backBtn: { width: 36, height: 36, borderRadius: "50%", background: "var(--bg-tertiary)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-secondary)", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerInfo: { flex: 1, minWidth: 0 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  subtitle: { fontSize: "0.75rem", color: "var(--text-muted)" },
  contractBadge: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.8rem", color: "var(--gold)", background: "var(--gold-dim)", padding: "4px 8px", borderRadius: "var(--radius-sm)", flexShrink: 0 },
  statsRow: { display: "flex", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "12px 0" },
  statItem: { flex: 1, textAlign: "center" },
  statValue: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" },
  statLabel: { fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 },
  statDivider: { width: 1, background: "var(--border)", margin: "4px 0" },
  tabs: { display: "flex", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", overflowX: "auto" },
  tab: { flex: 1, padding: "10px 8px", background: "transparent", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", transition: "all var(--transition)" },
  tabActive: { color: "var(--gold)", borderBottomColor: "var(--gold)" },
  content: { padding: "16px" },
  tabContent: { display: "flex", flexDirection: "column", gap: 10 },
  activePhaseCard: { background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-md)", padding: 14 },
  activePhaseName: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "var(--gold)", margin: "4px 0 10px" },
  progressBar: { height: 5, background: "var(--bg-tertiary)", borderRadius: 100, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", background: "var(--gold)", borderRadius: 100 },
  progressText: { fontSize: "0.75rem", color: "var(--text-muted)" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  infoCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12 },
  cardLabel: { fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontFamily: "var(--font-heading)" },
  infoValue: { fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" },
  card: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 14 },
  phaseName: { fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" },
  mobileInput: { width: "100%", padding: "10px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-primary)", outline: "none" },
  editBtn: { padding: "5px 10px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 },
  deleteBtn: { padding: "5px 8px", background: "var(--red-bg)", color: "var(--red)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700, fontSize: "0.75rem" },
  saveBtn: { padding: "10px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem" },
  cancelBtn: { padding: "10px", background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.875rem" },
  addBtn: { padding: "10px 16px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem" },
};