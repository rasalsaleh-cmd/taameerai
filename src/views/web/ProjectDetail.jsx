/**
 * ProjectDetail.jsx — SiteOS Project Detail View
 * Full project detail with phases, sub-phases, and per-phase checklists.
 * Owner can add/edit/delete phases, sub-phases, and checklist items.
 * Multiple sub-phases can be active simultaneously.
 */

import { useState } from "react";
import { fPKR, fDate } from "../../utils/formatting.js";
import { supabase } from "../../supabase.js";

const TABS = ["Overview", "Phases", "Budget", "Expenses", "Logs"];

export default function ProjectDetail({ projects, projectId, onBack, updatePhase, addPhase, deletePhase, logExpense, fetchProjects }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const project = projects.find((p) => p.id === projectId);

  if (!project) return <div style={styles.empty}>Project not found.</div>;

  const totalSpent = (project.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const remaining = (project.contractValue || 0) - totalSpent;
  const topLevelPhases = (project.phases || []).filter((p) => !p.parent_phase_id);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <div style={styles.headerInfo}>
          <h1 style={styles.title}>{project.name}</h1>
          <p style={styles.subtitle}>{project.client} · {project.location}</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.headerStat}>
            <span style={styles.headerStatLabel}>Contract</span>
            <span style={styles.headerStatValue}>{fPKR(project.contractValue)}</span>
          </div>
          <div style={styles.headerStat}>
            <span style={styles.headerStatLabel}>Spent</span>
            <span style={styles.headerStatValue}>{fPKR(totalSpent)}</span>
          </div>
          <div style={styles.headerStat}>
            <span style={styles.headerStatLabel}>Remaining</span>
            <span style={{ ...styles.headerStatValue, color: remaining >= 0 ? "var(--green)" : "var(--red)" }}>
              {fPKR(remaining)}
            </span>
          </div>
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
        {activeTab === "Overview"  && <OverviewTab project={project} totalSpent={totalSpent} topLevelPhases={topLevelPhases} allPhases={project.phases || []} />}
        {activeTab === "Phases"    && <PhasesTab project={project} allPhases={project.phases || []} topLevelPhases={topLevelPhases} updatePhase={updatePhase} addPhase={addPhase} deletePhase={deletePhase} fetchProjects={fetchProjects} />}
        {activeTab === "Budget"    && <BudgetTab project={project} totalSpent={totalSpent} remaining={remaining} />}
        {activeTab === "Expenses"  && <ExpensesTab project={project} logExpense={logExpense} />}
        {activeTab === "Logs"      && <LogsTab project={project} />}
      </div>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────
function OverviewTab({ project, totalSpent, topLevelPhases, allPhases }) {
  const progress = project.contractValue > 0 ? Math.min((totalSpent / project.contractValue) * 100, 100) : 0;
  const activeSubPhases = allPhases.filter((p) => p.parent_phase_id && p.status === "active");

  return (
    <div style={styles.tabContent}>
      {/* Active Sub-phases */}
      {activeSubPhases.length > 0 && (
        <div style={styles.activeSection}>
          <div style={styles.activeSectionTitle}>🟡 Currently Active</div>
          <div style={styles.activeGrid}>
            {activeSubPhases.map((sp) => {
              const parent = topLevelPhases.find((p) => p.id === sp.parent_phase_id);
              return (
                <div key={sp.id} style={styles.activeCard}>
                  <div style={styles.activeCardParent}>{parent?.label}</div>
                  <div style={styles.activeCardName}>{sp.label}</div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${sp.progress || 0}%` }} />
                  </div>
                  <div style={styles.progressText}>{sp.progress || 0}% · Due {fDate(sp.expectedEnd)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div style={styles.overviewGrid}>
        {[
          { label: "Location",   value: project.location },
          { label: "Area",       value: `${project.totalArea} sqft` },
          { label: "Floors",     value: project.floors },
          { label: "Start Date", value: fDate(project.startDate) },
          { label: "Phases",     value: `${topLevelPhases.length} phases` },
          { label: "Status",     value: project.status },
        ].map((item) => (
          <div key={item.label} style={styles.infoCard}>
            <div style={styles.infoLabel}>{item.label}</div>
            <div style={styles.infoValue}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Budget Progress */}
      <div style={styles.budgetProgressCard}>
        <div style={styles.infoLabel}>Overall Budget Usage</div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <div style={styles.progressText}>{fPKR(totalSpent)} of {fPKR(project.contractValue)} — {progress.toFixed(1)}%</div>
      </div>
    </div>
  );
}

// ─── Phases Tab ─────────────────────────────────────────────
function PhasesTab({ project, allPhases, topLevelPhases, updatePhase, addPhase, deletePhase, fetchProjects }) {
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newPhaseLabel, setNewPhaseLabel] = useState("");
  const [newSubPhaseLabel, setNewSubPhaseLabel] = useState("");
  const [addingSubTo, setAddingSubTo] = useState(null);
  const [expandedChecklist, setExpandedChecklist] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [addingChecklistTo, setAddingChecklistTo] = useState(null);

  const getSubPhases = (parentId) => allPhases.filter((p) => p.parent_phase_id === parentId);
  const statusColor = { done: "var(--green)", active: "var(--gold)", pending: "var(--text-muted)" };

  async function saveEdit(id) {
    await updatePhase(id, editValues);
    setEditingId(null);
  }

  async function handleAddPhase() {
    if (!newPhaseLabel.trim()) return;
    await addPhase(project.id, { key: newPhaseLabel.toLowerCase().replace(/\s+/g, "_"), label: newPhaseLabel, budget: 0 });
    setNewPhaseLabel("");
  }

  async function handleAddSubPhase(parentId) {
    if (!newSubPhaseLabel.trim()) return;
    const { error } = await supabase.from("project_phases").insert({
      projectId: project.id,
      key: newSubPhaseLabel.toLowerCase().replace(/\s+/g, "_"),
      label: newSubPhaseLabel,
      budget: 0,
      spent: 0,
      progress: 0,
      status: "pending",
      parent_phase_id: parentId,
    });
    if (!error) { await fetchProjects(); setNewSubPhaseLabel(""); setAddingSubTo(null); }
  }

  async function addChecklistItem(phaseId) {
    if (!newChecklistItem.trim()) return;
    const { error } = await supabase.from("phase_checklist_items").insert({
      phase_id: phaseId,
      item: newChecklistItem.trim(),
      photo_required: false,
      sort_order: 0,
    });
    if (!error) { await fetchProjects(); setNewChecklistItem(""); setAddingChecklistTo(null); }
  }

  async function deleteChecklistItem(itemId) {
    await supabase.from("phase_checklist_items").delete().eq("id", itemId);
    await fetchProjects();
  }

  async function togglePhotoRequired(itemId, current) {
    await supabase.from("phase_checklist_items").update({ photo_required: !current }).eq("id", itemId);
    await fetchProjects();
  }

  return (
    <div style={styles.tabContent}>
      {topLevelPhases.map((phase) => {
        const subPhases = getSubPhases(phase.id);
        const isExpanded = expandedPhase === phase.id;

        return (
          <div key={phase.id} style={styles.phaseBlock}>
            {/* Phase Header */}
            <div style={styles.phaseHeader}>
              <div style={styles.phaseHeaderLeft} onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor[phase.status] || "var(--text-muted)", flexShrink: 0 }} />
                {editingId === phase.id ? (
                  <input style={styles.editInput} value={editValues.label} onChange={(e) => setEditValues({ ...editValues, label: e.target.value })} autoFocus />
                ) : (
                  <div style={styles.phaseName}>{phase.label}</div>
                )}
              </div>
              <div style={styles.phaseHeaderRight}>
                <span style={styles.subPhaseCount}>{subPhases.length} sub-phases</span>
                {editingId === phase.id ? (
                  <>
                    <button style={styles.saveBtn} onClick={() => saveEdit(phase.id)}>Save</button>
                    <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button style={styles.editBtn} onClick={() => { setEditingId(phase.id); setEditValues({ label: phase.label, budget: phase.budget, expectedEnd: phase.expectedEnd }); }}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => deletePhase(phase.id)}>✕</button>
                  </>
                )}
                <button style={styles.expandBtn} onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}>
                  {isExpanded ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {/* Sub-phases */}
            {isExpanded && (
              <div style={styles.subPhasesContainer}>
                {subPhases.map((sp) => (
                  <div key={sp.id} style={styles.subPhaseBlock}>
                    {/* Sub-phase Row */}
                    <div style={styles.subPhaseRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[sp.status] || "var(--text-muted)", flexShrink: 0 }} />
                        <div style={styles.subPhaseName}>{sp.label}</div>
                        <span style={{ ...styles.statusChip, background: sp.status === "active" ? "var(--gold-dim)" : "var(--bg-tertiary)", color: sp.status === "active" ? "var(--gold)" : "var(--text-muted)" }}>
                          {sp.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button style={styles.checklistToggle} onClick={() => setExpandedChecklist(expandedChecklist === sp.id ? null : sp.id)}>
                          📋 {(sp.checklist_items || []).length} items
                        </button>
                        <select style={styles.statusSelect} value={sp.status} onChange={(e) => updatePhase(sp.id, { status: e.target.value })}>
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="done">Done</option>
                        </select>
                        <button style={styles.deleteBtn} onClick={() => deletePhase(sp.id)}>✕</button>
                      </div>
                    </div>

                    {/* Checklist Items */}
                    {expandedChecklist === sp.id && (
                      <div style={styles.checklistContainer}>
                        {(sp.checklist_items || []).map((item) => (
                          <div key={item.id} style={styles.checklistItem}>
                            <span style={styles.checklistItemText}>{item.item}</span>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button onClick={() => togglePhotoRequired(item.id, item.photo_required)} style={{ ...styles.photoToggle, background: item.photo_required ? "var(--gold-dim)" : "var(--bg-tertiary)", color: item.photo_required ? "var(--gold)" : "var(--text-muted)" }}>
                                📷 {item.photo_required ? "Required" : "Optional"}
                              </button>
                              <button style={styles.deleteBtn} onClick={() => deleteChecklistItem(item.id)}>✕</button>
                            </div>
                          </div>
                        ))}
                        {addingChecklistTo === sp.id ? (
                          <div style={styles.addRow}>
                            <input style={styles.addInput} value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} placeholder="New checklist item..." onKeyDown={(e) => e.key === "Enter" && addChecklistItem(sp.id)} autoFocus />
                            <button style={styles.addBtn} onClick={() => addChecklistItem(sp.id)}>Add</button>
                            <button style={styles.cancelBtn} onClick={() => setAddingChecklistTo(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button style={styles.addItemBtn} onClick={() => setAddingChecklistTo(sp.id)}>+ Add Checklist Item</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Sub-phase */}
                {addingSubTo === phase.id ? (
                  <div style={styles.addRow}>
                    <input style={styles.addInput} value={newSubPhaseLabel} onChange={(e) => setNewSubPhaseLabel(e.target.value)} placeholder="Sub-phase name..." onKeyDown={(e) => e.key === "Enter" && handleAddSubPhase(phase.id)} autoFocus />
                    <button style={styles.addBtn} onClick={() => handleAddSubPhase(phase.id)}>Add</button>
                    <button style={styles.cancelBtn} onClick={() => setAddingSubTo(null)}>Cancel</button>
                  </div>
                ) : (
                  <button style={styles.addSubPhaseBtn} onClick={() => setAddingSubTo(phase.id)}>+ Add Sub-phase</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Top-level Phase */}
      <div style={styles.addPhaseRow}>
        <input style={styles.addInput} value={newPhaseLabel} onChange={(e) => setNewPhaseLabel(e.target.value)} placeholder="New phase name..." onKeyDown={(e) => e.key === "Enter" && handleAddPhase()} />
        <button style={styles.addBtn} onClick={handleAddPhase}>+ Add Phase</button>
      </div>
    </div>
  );
}

// ─── Budget Tab ─────────────────────────────────────────────
function BudgetTab({ project, totalSpent, remaining }) {
  const byCategory = (project.expenses || []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div style={styles.tabContent}>
      <div style={styles.budgetGrid}>
        <div style={styles.budgetCard}><div style={styles.infoLabel}>Contract Value</div><div style={styles.budgetAmount}>{fPKR(project.contractValue)}</div></div>
        <div style={styles.budgetCard}><div style={styles.infoLabel}>Total Spent</div><div style={styles.budgetAmount}>{fPKR(totalSpent)}</div></div>
        <div style={styles.budgetCard}><div style={styles.infoLabel}>Remaining</div><div style={{ ...styles.budgetAmount, color: remaining >= 0 ? "var(--green)" : "var(--red)" }}>{fPKR(remaining)}</div></div>
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={styles.sectionTitle}>Spend by Category</div>
        {Object.entries(byCategory).map(([cat, amt]) => (
          <div key={cat} style={styles.categoryRow}>
            <span style={{ textTransform: "capitalize", color: "var(--text-secondary)" }}>{cat}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>{fPKR(amt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Expenses Tab ────────────────────────────────────────────
function ExpensesTab({ project, logExpense }) {
  const [form, setForm] = useState({ phase: "", category: "material", description: "", amount: "" });
  const [showing, setShowing] = useState(false);

  async function handleSubmit() {
    if (!form.amount || !form.description) return;
    await logExpense(project.id, { ...form, amount: Number(form.amount) });
    setForm({ phase: "", category: "material", description: "", amount: "" });
    setShowing(false);
  }

  const allPhases = (project.phases || []);

  return (
    <div style={styles.tabContent}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={styles.sectionTitle}>All Expenses</div>
        <button style={styles.addBtn} onClick={() => setShowing(!showing)}>+ Log Expense</button>
      </div>
      {showing && (
        <div style={styles.formCard}>
          <select style={styles.addInput} value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })}>
            <option value="">Select phase</option>
            {allPhases.map((p) => <option key={p.id} value={p.key}>{p.label}</option>)}
          </select>
          <select style={styles.addInput} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="material">Material</option>
            <option value="labor">Labour</option>
            <option value="contractor">Contractor</option>
            <option value="misc">Misc</option>
          </select>
          <input style={styles.addInput} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <input style={styles.addInput} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount in PKR" />
          <button style={styles.saveBtn} onClick={handleSubmit}>Save Expense</button>
        </div>
      )}
      {(project.expenses || []).map((e) => (
        <div key={e.id} style={styles.expenseRow}>
          <div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{e.description}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.phase} · {e.category} · {fDate(e.date)}</div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>{fPKR(e.amount)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Logs Tab ────────────────────────────────────────────────
function LogsTab({ project }) {
  return (
    <div style={styles.tabContent}>
      <div style={styles.sectionTitle}>Supervisor Logs</div>
      {(project.checklistLogs || []).length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No logs yet.</p>
      ) : (
        (project.checklistLogs || []).map((log) => (
          <div key={log.id} style={styles.logRow}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{fDate(log.date)}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.phase} · {log.completionRate}% complete</div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1000 },
  empty: { padding: 32, color: "var(--text-muted)" },
  header: { display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28, flexWrap: "wrap" },
  backBtn: { padding: "8px 16px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", fontSize: "0.875rem", whiteSpace: "nowrap" },
  headerInfo: { flex: 1 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: 4 },
  subtitle: { color: "var(--text-muted)", fontSize: "0.875rem" },
  headerStats: { display: "flex", gap: 20 },
  headerStat: { textAlign: "right" },
  headerStatLabel: { display: "block", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 2 },
  headerStatValue: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 },
  tab: { padding: "10px 18px", background: "transparent", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-muted)", transition: "all var(--transition)" },
  tabActive: { color: "var(--gold)", borderBottomColor: "var(--gold)" },
  content: {},
  tabContent: { display: "flex", flexDirection: "column", gap: 12 },
  activeSection: { background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 8 },
  activeSectionTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 },
  activeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 },
  activeCard: { background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: 12 },
  activeCardParent: { fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 },
  activeCardName: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: 8 },
  progressBar: { height: 5, background: "var(--bg-tertiary)", borderRadius: 100, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", background: "var(--gold)", borderRadius: 100 },
  progressText: { fontSize: "0.7rem", color: "var(--text-muted)" },
  overviewGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  infoCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16 },
  infoLabel: { fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-heading)" },
  infoValue: { fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" },
  budgetProgressCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16 },
  phaseBlock: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" },
  phaseHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer" },
  phaseHeaderLeft: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  phaseHeaderRight: { display: "flex", alignItems: "center", gap: 8 },
  phaseName: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" },
  subPhaseCount: { fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "2px 8px", borderRadius: 100 },
  expandBtn: { padding: "4px 8px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem" },
  subPhasesContainer: { borderTop: "1px solid var(--border)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 },
  subPhaseBlock: { background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", overflow: "hidden" },
  subPhaseRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", gap: 10 },
  subPhaseName: { fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" },
  statusChip: { fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, textTransform: "capitalize" },
  statusSelect: { padding: "4px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "var(--text-primary)", cursor: "pointer", outline: "none" },
  checklistToggle: { padding: "4px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 },
  checklistContainer: { borderTop: "1px solid var(--border)", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 },
  checklistItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" },
  checklistItemText: { fontSize: "0.85rem", color: "var(--text-primary)", flex: 1 },
  photoToggle: { padding: "3px 8px", borderRadius: 100, cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, border: "1px solid var(--border)", transition: "all var(--transition)" },
  addSubPhaseBtn: { padding: "8px 14px", background: "transparent", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, width: "100%", textAlign: "center" },
  addItemBtn: { padding: "6px 12px", background: "transparent", border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, width: "100%", textAlign: "center", marginTop: 4 },
  addPhaseRow: { display: "flex", gap: 8 },
  addRow: { display: "flex", gap: 8, alignItems: "center" },
  addInput: { flex: 1, padding: "8px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-primary)", outline: "none" },
  addBtn: { padding: "8px 16px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap" },
  editInput: { flex: 1, padding: "6px 10px", background: "var(--bg-tertiary)", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--text-primary)", outline: "none" },
  editBtn: { padding: "5px 10px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 },
  deleteBtn: { padding: "5px 8px", background: "var(--red-bg)", color: "var(--red)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" },
  saveBtn: { padding: "8px 16px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem" },
  cancelBtn: { padding: "8px 12px", background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.875rem" },
  budgetGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  budgetCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 },
  budgetAmount: { fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 8 },
  sectionTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 12 },
  categoryRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" },
  formCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  expenseRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" },
  logRow: { padding: "12px 0", borderBottom: "1px solid var(--border)" },
};