/**
 * LabourAttendance.jsx — SiteOS Supervisor Labour & Workers
 * Two tabs: Attendance (log daily workers) and Roster (manage workers).
 * Supervisor can add, edit, and deactivate workers from the roster.
 */

import { useState, useEffect } from "react";
import { supabase } from "../../supabase.js";

const TRADES = [
  { key: "mason",       label: "Mason (Raj Mistri)",  rate: 2500 },
  { key: "helper",      label: "Helper",              rate: 1500 },
  { key: "plumber",     label: "Plumber",             rate: 2800 },
  { key: "electrician", label: "Electrician",         rate: 3000 },
  { key: "carpenter",   label: "Carpenter",           rate: 2500 },
  { key: "painter",     label: "Painter",             rate: 2200 },
  { key: "steel_fixer", label: "Steel Fixer",         rate: 2800 },
  { key: "other",       label: "Other",               rate: 1500 },
];

export default function LabourAttendance({ project }) {
  const [tab, setTab] = useState("attendance");
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadWorkers(); }, [project.id]);

  async function loadWorkers() {
    setLoading(true);
    const { data } = await supabase
      .from("workers")
      .select("*")
      .eq("project_id", project.id)
      .order("trade");
    setWorkers(data || []);
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Labour</div>
        <div style={styles.date}>
          {new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={styles.tabSwitcher}>
        <button
          style={{ ...styles.tabBtn, ...(tab === "attendance" ? styles.tabBtnActive : {}) }}
          onClick={() => setTab("attendance")}
        >
          📋 Daily Attendance
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === "roster" ? styles.tabBtnActive : {}) }}
          onClick={() => setTab("roster")}
        >
          👷 Worker Roster
        </button>
      </div>

      {tab === "attendance" && (
        <AttendanceTab workers={workers} project={project} />
      )}
      {tab === "roster" && (
        <RosterTab workers={workers} project={project} onRefresh={loadWorkers} />
      )}
    </div>
  );
}

// ─── Attendance Tab ─────────────────────────────────────────
function AttendanceTab({ workers, project }) {
  const activeWorkers = workers.filter((w) => w.status === "active");
  const [present, setPresent] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function toggle(workerId) {
    setPresent((prev) => ({ ...prev, [workerId]: !prev[workerId] }));
  }

  const presentCount = Object.values(present).filter(Boolean).length;
  const totalCost = activeWorkers
    .filter((w) => present[w.id])
    .reduce((s, w) => s + (w.daily_rate || 0), 0);

  async function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>👷</div>
        <div style={styles.successTitle}>Attendance Logged</div>
        <div style={styles.successCount}>{presentCount} Workers Present</div>
        <div style={styles.successCost}>Est. Daily Cost: ₨{totalCost.toLocaleString()}</div>
        <button style={styles.newBtn} onClick={() => setSubmitted(false)}>Log Again</button>
      </div>
    );
  }

  if (activeWorkers.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>👷</div>
        <div style={styles.emptyText}>No workers on roster yet</div>
        <div style={styles.emptySub}>Switch to Worker Roster tab to add workers</div>
      </div>
    );
  }

  return (
    <div style={styles.tabContent}>
      {/* Summary Strip */}
      <div style={styles.summaryStrip}>
        <div style={styles.summaryItem}>
          <div style={styles.summaryValue}>{presentCount}</div>
          <div style={styles.summaryLabel}>Present</div>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <div style={styles.summaryValue}>{activeWorkers.length - presentCount}</div>
          <div style={styles.summaryLabel}>Absent</div>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <div style={{ ...styles.summaryValue, fontSize: "1rem" }}>₨{(totalCost / 1000).toFixed(1)}K</div>
          <div style={styles.summaryLabel}>Day Cost</div>
        </div>
      </div>

      {/* Worker List */}
      <div style={styles.workerList}>
        {activeWorkers.map((worker) => (
          <div
            key={worker.id}
            style={{ ...styles.workerRow, ...(present[worker.id] ? styles.workerRowPresent : {}) }}
            onClick={() => toggle(worker.id)}
          >
            <div style={styles.workerInfo}>
              <div style={styles.workerName}>{worker.name}</div>
              <div style={styles.workerTrade}>{worker.trade} · ₨{(worker.daily_rate || 0).toLocaleString()}/day</div>
            </div>
            <div style={{ ...styles.presentBtn, background: present[worker.id] ? "#00C853" : "#E0E0E0" }}>
              {present[worker.id] ? "✓" : ""}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.submitWrap}>
        <button
          style={{ ...styles.submitBtn, opacity: presentCount === 0 ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={presentCount === 0}
        >
          LOG {presentCount} WORKERS PRESENT
        </button>
      </div>
    </div>
  );
}

// ─── Roster Tab ─────────────────────────────────────────────
function RosterTab({ workers, project, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [form, setForm] = useState({ name: "", trade: "mason", phone: "", daily_rate: "", notes: "" });

  function startAdd() {
    setForm({ name: "", trade: "mason", phone: "", daily_rate: "", notes: "" });
    setEditingWorker(null);
    setShowForm(true);
  }

  function startEdit(worker) {
    setForm({
      name: worker.name,
      trade: worker.trade,
      phone: worker.phone || "",
      daily_rate: worker.daily_rate || "",
      notes: worker.notes || "",
    });
    setEditingWorker(worker);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    const defaultRate = TRADES.find((t) => t.key === form.trade)?.rate || 1500;

    if (editingWorker) {
      await supabase.from("workers").update({
        name: form.name,
        trade: form.trade,
        phone: form.phone || null,
        daily_rate: Number(form.daily_rate) || defaultRate,
        notes: form.notes || null,
      }).eq("id", editingWorker.id);
    } else {
      await supabase.from("workers").insert({
        project_id: project.id,
        name: form.name,
        trade: form.trade,
        phone: form.phone || null,
        daily_rate: Number(form.daily_rate) || defaultRate,
        notes: form.notes || null,
        status: "active",
      });
    }
    await onRefresh();
    setShowForm(false);
    setEditingWorker(null);
  }

  async function toggleStatus(worker) {
    const newStatus = worker.status === "active" ? "inactive" : "active";
    await supabase.from("workers").update({ status: newStatus }).eq("id", worker.id);
    await onRefresh();
  }

  async function deleteWorker(id) {
    await supabase.from("workers").delete().eq("id", id);
    await onRefresh();
  }

  const activeWorkers = workers.filter((w) => w.status === "active");
  const inactiveWorkers = workers.filter((w) => w.status !== "active");

  return (
    <div style={styles.tabContent}>
      <button style={styles.addWorkerBtn} onClick={startAdd}>+ Add Worker</button>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={styles.workerForm}>
          <div style={styles.formTitle}>{editingWorker ? "Edit Worker" : "Add New Worker"}</div>
          <input
            style={styles.formInput}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
          <select
            style={styles.formInput}
            value={form.trade}
            onChange={(e) => {
              const rate = TRADES.find((t) => t.key === e.target.value)?.rate || 1500;
              setForm({ ...form, trade: e.target.value, daily_rate: rate });
            }}
          >
            {TRADES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input
            style={styles.formInput}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number (optional)"
            type="tel"
          />
          <div style={styles.rateRow}>
            <span style={styles.ratePrefix}>₨</span>
            <input
              style={{ ...styles.formInput, flex: 1, borderLeft: "none", borderRadius: "0 12px 12px 0" }}
              type="number"
              value={form.daily_rate}
              onChange={(e) => setForm({ ...form, daily_rate: e.target.value })}
              placeholder="Daily rate"
            />
          </div>
          <input
            style={styles.formInput}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.saveWorkerBtn} onClick={handleSave}>
              {editingWorker ? "Save Changes" : "Add Worker"}
            </button>
            <button style={styles.cancelWorkerBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Active Workers */}
      {activeWorkers.length > 0 && (
        <>
          <div style={styles.rosterSectionLabel}>Active Workers ({activeWorkers.length})</div>
          {activeWorkers.map((worker) => (
            <div key={worker.id} style={styles.rosterRow}>
              <div style={styles.rosterInfo}>
                <div style={styles.rosterName}>{worker.name}</div>
                <div style={styles.rosterMeta}>
                  {TRADES.find((t) => t.key === worker.trade)?.label || worker.trade}
                  {worker.phone ? ` · ${worker.phone}` : ""}
                  {` · ₨${(worker.daily_rate || 0).toLocaleString()}/day`}
                </div>
              </div>
              <div style={styles.rosterActions}>
                <button style={styles.rosterEditBtn} onClick={() => startEdit(worker)}>Edit</button>
                <button style={styles.rosterOffBtn} onClick={() => toggleStatus(worker)}>Off</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Inactive Workers */}
      {inactiveWorkers.length > 0 && (
        <>
          <div style={{ ...styles.rosterSectionLabel, marginTop: 20 }}>Inactive ({inactiveWorkers.length})</div>
          {inactiveWorkers.map((worker) => (
            <div key={worker.id} style={{ ...styles.rosterRow, opacity: 0.6 }}>
              <div style={styles.rosterInfo}>
                <div style={styles.rosterName}>{worker.name}</div>
                <div style={styles.rosterMeta}>{TRADES.find((t) => t.key === worker.trade)?.label || worker.trade}</div>
              </div>
              <div style={styles.rosterActions}>
                <button style={styles.rosterEditBtn} onClick={() => toggleStatus(worker)}>Reactivate</button>
                <button style={{ ...styles.rosterOffBtn, background: "#FFEBEE", color: "#D50000" }} onClick={() => deleteWorker(worker.id)}>Delete</button>
              </div>
            </div>
          ))}
        </>
      )}

      {workers.length === 0 && !showForm && (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>👷</div>
          <div style={styles.emptyText}>No workers added yet</div>
          <div style={styles.emptySub}>Tap + Add Worker to build your roster</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { paddingBottom: 20 },
  header: { padding: "16px 20px 12px", borderBottom: "1px solid #E0E0E0" },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "#111" },
  date: { fontSize: "0.75rem", color: "#888", marginTop: 4 },
  tabSwitcher: { display: "flex", gap: 0, borderBottom: "2px solid #E0E0E0" },
  tabBtn: { flex: 1, padding: "12px 0", background: "transparent", border: "none", borderBottom: "3px solid transparent", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.85rem", color: "#888", transition: "all 0.15s ease" },
  tabBtnActive: { color: "#FF6B00", borderBottomColor: "#FF6B00" },
  tabContent: { padding: "0 0 20px" },
  summaryStrip: { display: "flex", background: "#1A1A1A", padding: "14px 0", marginBottom: 0 },
  summaryItem: { flex: 1, textAlign: "center" },
  summaryValue: { fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.5rem", color: "#C4A35A" },
  summaryLabel: { fontSize: "0.65rem", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 },
  summaryDivider: { width: 1, background: "#333", margin: "4px 0" },
  workerList: { display: "flex", flexDirection: "column", gap: 0 },
  workerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #E0E0E0", cursor: "pointer", transition: "background 0.15s ease" },
  workerRowPresent: { background: "#F0FFF4" },
  workerInfo: { flex: 1 },
  workerName: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", color: "#111" },
  workerTrade: { fontSize: "0.75rem", color: "#888", marginTop: 2 },
  presentBtn: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", color: "#FFF", flexShrink: 0, transition: "background 0.15s ease" },
  submitWrap: { padding: "16px 20px 0" },
  submitBtn: { width: "100%", padding: "20px", background: "#FF6B00", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer" },
  successContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24, textAlign: "center" },
  successIcon: { fontSize: "4rem", marginBottom: 16 },
  successTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#111", marginBottom: 8 },
  successCount: { fontFamily: "var(--font-mono)", fontSize: "2.5rem", fontWeight: 700, color: "#FF6B00", marginBottom: 4 },
  successCost: { fontSize: "0.95rem", color: "#888", marginBottom: 32 },
  newBtn: { width: "100%", padding: "18px", background: "#111", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
  emptyContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", padding: 24, textAlign: "center" },
  emptyIcon: { fontSize: "3rem", marginBottom: 16 },
  emptyText: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "#111", marginBottom: 8 },
  emptySub: { fontSize: "0.875rem", color: "#888" },
  addWorkerBtn: { width: "calc(100% - 40px)", margin: "16px 20px 0", padding: "14px", background: "#FF6B00", color: "#FFF", border: "none", borderRadius: 12, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" },
  workerForm: { margin: "12px 20px", background: "#F5F5F5", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  formTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", color: "#111", marginBottom: 4 },
  formInput: { width: "100%", padding: "12px 14px", background: "#FFF", border: "2px solid #E0E0E0", borderRadius: 12, fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "#111", outline: "none" },
  rateRow: { display: "flex", alignItems: "center", background: "#FFF", border: "2px solid #E0E0E0", borderRadius: 12, overflow: "hidden" },
  ratePrefix: { padding: "12px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1rem", color: "#FF6B00", background: "#FFF3E0", borderRight: "2px solid #E0E0E0" },
  saveWorkerBtn: { flex: 2, padding: "12px", background: "#FF6B00", color: "#FFF", border: "none", borderRadius: 10, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" },
  cancelWorkerBtn: { flex: 1, padding: "12px", background: "#E0E0E0", color: "#333", border: "none", borderRadius: 10, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" },
  rosterSectionLabel: { padding: "12px 20px 6px", fontSize: "0.65rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" },
  rosterRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #F0F0F0" },
  rosterInfo: { flex: 1 },
  rosterName: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9rem", color: "#111" },
  rosterMeta: { fontSize: "0.75rem", color: "#888", marginTop: 2 },
  rosterActions: { display: "flex", gap: 6 },
  rosterEditBtn: { padding: "6px 12px", background: "#FFF3E0", color: "#FF6B00", border: "1px solid #FFB74D", borderRadius: 8, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" },
  rosterOffBtn: { padding: "6px 12px", background: "#F5F5F5", color: "#888", border: "1px solid #E0E0E0", borderRadius: 8, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" },
};