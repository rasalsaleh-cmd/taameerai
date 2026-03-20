/**
 * ChecklistEditor.jsx — SiteOS Checklist Template Editor
 * Owner manages the default checklist items supervisors see on site.
 * Items can be added, renamed, deleted, and photo requirement toggled.
 */

import { useState } from "react";

const DEFAULT_ITEMS = [
  { id: 1, item: "Foundation level checked", photoRequired: true },
  { id: 2, item: "Steel placement verified", photoRequired: true },
  { id: 3, item: "Shuttering complete", photoRequired: false },
  { id: 4, item: "Concrete poured", photoRequired: true },
  { id: 5, item: "Curing in progress", photoRequired: false },
  { id: 6, item: "Brickwork level checked", photoRequired: false },
  { id: 7, item: "Plumbing lines installed", photoRequired: true },
  { id: 8, item: "Electrical conduits placed", photoRequired: true },
  { id: 9, item: "Plastering complete", photoRequired: false },
  { id: 10, item: "Site cleaned and safe", photoRequired: false },
];

export default function ChecklistEditor() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("siteos-checklist");
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
  });
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saved, setSaved] = useState(false);

  function addItem() {
    if (!newItem.trim()) return;
    const item = { id: Date.now(), item: newItem.trim(), photoRequired: false };
    setItems((prev) => [...prev, item]);
    setNewItem("");
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditValue(item.item);
  }

  function saveEdit(id) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, item: editValue } : i));
    setEditingId(null);
  }

  function togglePhoto(id) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, photoRequired: !i.photoRequired } : i));
  }

  function saveAll() {
    localStorage.setItem("siteos-checklist", JSON.stringify(items));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetDefaults() {
    setItems(DEFAULT_ITEMS);
    localStorage.removeItem("siteos-checklist");
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Checklist Templates</h1>
          <p style={styles.subtitle}>Manage the items supervisors check on site daily</p>
        </div>
        <div style={styles.headerBtns}>
          <button onClick={resetDefaults} style={styles.resetBtn}>Reset Defaults</button>
          <button onClick={saveAll} style={{ ...styles.saveBtn, background: saved ? "var(--green)" : "var(--gold)" }}>
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Items List */}
      <div style={styles.list}>
        {items.map((item, index) => (
          <div key={item.id} style={styles.itemRow}>
            <div style={styles.itemNumber}>{index + 1}</div>
            {editingId === item.id ? (
              <div style={styles.editRow}>
                <input
                  style={styles.editInput}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                  autoFocus
                />
                <button style={styles.confirmBtn} onClick={() => saveEdit(item.id)}>✓</button>
                <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
              </div>
            ) : (
              <div style={styles.itemContent}>
                <span style={styles.itemText}>{item.item}</span>
                <div style={styles.itemActions}>
                  <button
                    onClick={() => togglePhoto(item.id)}
                    style={{ ...styles.photoToggle, background: item.photoRequired ? "var(--gold-dim)" : "var(--bg-tertiary)", color: item.photoRequired ? "var(--gold)" : "var(--text-muted)", border: `1px solid ${item.photoRequired ? "var(--gold-border)" : "var(--border)"}` }}
                  >
                    📷 {item.photoRequired ? "Required" : "Optional"}
                  </button>
                  <button style={styles.editBtn} onClick={() => startEdit(item)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => deleteItem(item.id)}>✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div style={styles.addRow}>
        <input
          style={styles.addInput}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add a new checklist item..."
        />
        <button style={styles.addBtn} onClick={addItem}>+ Add Item</button>
      </div>

      <div style={styles.hint}>
        {items.length} items · {items.filter((i) => i.photoRequired).length} require photos
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 800 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: 4 },
  subtitle: { color: "var(--text-muted)", fontSize: "0.875rem" },
  headerBtns: { display: "flex", gap: 10 },
  resetBtn: { padding: "10px 18px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" },
  saveBtn: { padding: "10px 18px", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", transition: "background var(--transition)" },
  list: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  itemRow: { display: "flex", alignItems: "center", gap: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 16px" },
  itemNumber: { width: 24, height: 24, borderRadius: "50%", background: "var(--bg-tertiary)", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemContent: { flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  itemText: { fontSize: "0.9rem", color: "var(--text-primary)", flex: 1 },
  itemActions: { display: "flex", gap: 8, alignItems: "center" },
  photoToggle: { padding: "4px 10px", borderRadius: 100, cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, transition: "all var(--transition)" },
  editBtn: { padding: "5px 12px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 },
  deleteBtn: { padding: "5px 10px", background: "var(--red-bg)", color: "var(--red)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700 },
  editRow: { flex: 1, display: "flex", gap: 8, alignItems: "center" },
  editInput: { flex: 1, padding: "8px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none" },
  confirmBtn: { padding: "6px 12px", background: "var(--green-bg)", color: "var(--green)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700 },
  cancelBtn: { padding: "6px 12px", background: "var(--red-bg)", color: "var(--red)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700 },
  addRow: { display: "flex", gap: 10, marginTop: 8 },
  addInput: { flex: 1, padding: "10px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none" },
  addBtn: { padding: "10px 20px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem" },
  hint: { marginTop: 12, fontSize: "0.8rem", color: "var(--text-muted)" },
};