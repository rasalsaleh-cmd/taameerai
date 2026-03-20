/**
 * Checklist.jsx — SiteOS Supervisor Daily Checklist
 * Supervisor selects their assigned active sub-phase and logs daily work.
 * Multiple sub-phases can be active simultaneously on large sites.
 * High visibility, one-tap operations, camera opens immediately on YES.
 */

import { useState } from "react";
import ChecklistItem from "./ChecklistItem.jsx";

export default function Checklist({ project, submitDailyLog }) {
  const [selectedSubPhase, setSelectedSubPhase] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get all active sub-phases (phases with a parent_phase_id and status active)
  const allPhases = project.phases || [];
  const activeSubPhases = allPhases.filter((p) => p.parent_phase_id && p.status === "active");
  // Also include active top-level phases that have no sub-phases
  const activeTopLevel = allPhases.filter((p) => !p.parent_phase_id && p.status === "active" && !allPhases.some((sp) => sp.parent_phase_id === p.id));
  const activePhases = [...activeSubPhases, ...activeTopLevel];

  const checklist = selectedSubPhase ? (selectedSubPhase.checklist_items || []).map((i) => ({ id: i.id, item: i.item, photoRequired: i.photo_required })) : [];

  function selectSubPhase(phase) {
    setSelectedSubPhase(phase);
    setStarted(false);
    setCurrentIndex(0);
    setResponses([]);
    setCompleted(false);
  }

  function handleResponse(status, photo, reason) {
    const newResponses = [...responses, {
      checklist_item_id: checklist[currentIndex]?.id || null,
      item: checklist[currentIndex]?.item,
      status, photo: photo || null, reason: reason || null,
    }];
    setResponses(newResponses);
    if (currentIndex + 1 >= checklist.length) {
      finishChecklist(newResponses);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  async function finishChecklist(allResponses) {
    setCompleted(true);
    setSubmitting(true);
    try {
      const completionRate = Math.round((allResponses.filter((r) => r.status === "yes").length / allResponses.length) * 100);
      await submitDailyLog(project.id, {
        phaseId: selectedSubPhase.id,
        phase: selectedSubPhase.key,
        completionRate,
      }, allResponses);
    } catch (err) {
      console.error("Failed to submit log:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setSelectedSubPhase(null);
    setStarted(false);
    setCurrentIndex(0);
    setResponses([]);
    setCompleted(false);
  }

  // ── Completed screen ──────────────────────────────────────
  if (completed) {
    const yesCount = responses.filter((r) => r.status === "yes").length;
    const rate = checklist.length > 0 ? Math.round((yesCount / checklist.length) * 100) : 0;
    return (
      <div style={styles.centerScreen}>
        <div style={styles.bigIcon}>{rate >= 80 ? "✅" : "⚠️"}</div>
        <div style={styles.bigTitle}>Log Submitted</div>
        <div style={styles.bigNumber}>{rate}%</div>
        <div style={styles.bigSub}>{yesCount} of {checklist.length} items completed</div>
        <div style={styles.phaseBadge}>{selectedSubPhase?.label}</div>
        {submitting && <div style={styles.savingText}>Saving...</div>}
        <button style={styles.orangeBtn} onClick={restart}>Start New Log</button>
      </div>
    );
  }

  // ── No active phases ──────────────────────────────────────
  if (activePhases.length === 0) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.bigIcon}>🏗</div>
        <div style={styles.bigTitle}>No Active Work</div>
        <div style={styles.bigSub}>No active phases or sub-phases found. Contact your manager.</div>
      </div>
    );
  }

  // ── Sub-phase selector ────────────────────────────────────
  if (!selectedSubPhase) {
    return (
      <div style={styles.container}>
        <div style={styles.selectorHeader}>
          <div style={styles.selectorTitle}>Select Work Area</div>
          <div style={styles.selectorSub}>What are you working on today?</div>
        </div>
        <div style={styles.phaseList}>
          {activePhases.map((phase) => {
            const parent = allPhases.find((p) => p.id === phase.parent_phase_id);
            const itemCount = (phase.checklist_items || []).length;
            return (
              <button key={phase.id} style={styles.phaseSelectBtn} onClick={() => selectSubPhase(phase)}>
                {parent && <div style={styles.parentLabel}>{parent.label}</div>}
                <div style={styles.phaseSelectName}>{phase.label}</div>
                <div style={styles.phaseSelectMeta}>{itemCount} checklist items</div>
                <div style={styles.phaseArrow}>→</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Start screen ──────────────────────────────────────────
  if (!started) {
    const parent = allPhases.find((p) => p.id === selectedSubPhase.parent_phase_id);
    return (
      <div style={styles.centerScreen}>
        {parent && <div style={styles.parentBadge}>{parent.label}</div>}
        <div style={styles.bigTitle}>{selectedSubPhase.label}</div>
        <div style={styles.bigSub}>{checklist.length} items to check</div>
        {checklist.length === 0 ? (
          <div style={styles.noItemsMsg}>No checklist items added yet. Ask your manager to add items to this sub-phase.</div>
        ) : (
          <button style={styles.orangeBtn} onClick={() => setStarted(true)}>START LOG</button>
        )}
        <button style={styles.backLink} onClick={() => setSelectedSubPhase(null)}>← Change work area</button>
      </div>
    );
  }

  // ── Active checklist item ─────────────────────────────────
  return (
    <ChecklistItem
      item={checklist[currentIndex]?.item}
      index={currentIndex}
      total={checklist.length}
      photoRequired={checklist[currentIndex]?.photoRequired}
      onResponse={handleResponse}
    />
  );
}

const styles = {
  container: { paddingBottom: 20 },
  centerScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 24, textAlign: "center", gap: 12 },
  bigIcon: { fontSize: "4rem" },
  bigTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#111" },
  bigNumber: { fontFamily: "var(--font-mono)", fontSize: "3.5rem", fontWeight: 800, color: "#FF6B00" },
  bigSub: { fontSize: "0.95rem", color: "#888" },
  phaseBadge: { background: "#F5F5F5", padding: "6px 16px", borderRadius: 100, fontSize: "0.85rem", fontWeight: 600, color: "#333" },
  savingText: { fontSize: "0.8rem", color: "#888" },
  orangeBtn: { width: "100%", padding: "20px", background: "#FF6B00", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer", marginTop: 8 },
  backLink: { background: "transparent", border: "none", color: "#888", fontSize: "0.875rem", cursor: "pointer", textDecoration: "underline", padding: 8 },
  noItemsMsg: { background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 12, padding: 16, fontSize: "0.875rem", color: "#E65100", maxWidth: 300 },
  selectorHeader: { padding: "20px 20px 12px", borderBottom: "1px solid #E0E0E0" },
  selectorTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "#111" },
  selectorSub: { fontSize: "0.8rem", color: "#888", marginTop: 4 },
  phaseList: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 },
  phaseSelectBtn: { display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "16px", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 14, cursor: "pointer", textAlign: "left", position: "relative", transition: "all 0.15s ease" },
  parentLabel: { fontSize: "0.65rem", fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 },
  phaseSelectName: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", color: "#111", marginBottom: 4 },
  phaseSelectMeta: { fontSize: "0.8rem", color: "#888" },
  phaseArrow: { position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: "1.25rem", color: "#FF6B00" },
  parentBadge: { background: "#FFF3E0", border: "1px solid #FFB74D", color: "#E65100", padding: "4px 14px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
};