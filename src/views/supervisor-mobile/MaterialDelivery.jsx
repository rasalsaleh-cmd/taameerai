/**
 * MaterialDelivery.jsx — SiteOS Supervisor Material Delivery Log
 * Supervisor logs incoming material deliveries on site.
 * Large inputs, simple flow, photo capture for delivery proof.
 */

import { useState } from "react";

const MATERIAL_TYPES = ["Cement", "Steel", "Bricks", "Sand", "Crush", "Timber", "Tiles", "Paint", "Pipes", "Other"];

export default function MaterialDelivery({ project, logMaterialDelivery }) {
  const [materialType, setMaterialType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("bags");
  const [supplier, setSupplier] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activePhase = (project.phases || []).find((p) => p.status === "active");

  async function handleSubmit() {
    if (!materialType || !quantity) return;
    setSubmitting(true);
    try {
      await logMaterialDelivery(project.id, {
        phase: activePhase?.key || "",
        materialType,
        quantity,
        unit,
        supplier: supplier || "Unknown",
        amount: Number(amount) || 0,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to log delivery:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setMaterialType("");
    setQuantity("");
    setUnit("bags");
    setSupplier("");
    setAmount("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>📦</div>
        <div style={styles.successTitle}>Delivery Logged</div>
        <div style={styles.successMaterial}>{quantity} {unit} of {materialType}</div>
        <div style={styles.successSupplier}>from {supplier || "Unknown supplier"}</div>
        <button style={styles.newBtn} onClick={reset}>Log Another Delivery</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Material Delivery</div>
        {activePhase && <div style={styles.phase}>{activePhase.label}</div>}
      </div>

      {/* Material Type */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Material Type</div>
        <div style={styles.materialGrid}>
          {MATERIAL_TYPES.map((mat) => (
            <button
              key={mat}
              onClick={() => setMaterialType(mat)}
              style={{ ...styles.materialBtn, ...(materialType === mat ? styles.materialBtnActive : {}) }}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Quantity</div>
        <div style={styles.quantityRow}>
          <input style={{ ...styles.input, flex: 2 }} type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" inputMode="numeric" />
          <select style={{ ...styles.input, flex: 1 }} value={unit} onChange={(e) => setUnit(e.target.value)}>
            {["bags", "kg", "tons", "pcs", "cft", "sqft", "rft", "litres"].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Supplier */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Supplier (optional)</div>
        <input style={styles.input} value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" />
      </div>

      {/* Amount Paid */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Amount Paid (optional)</div>
        <div style={styles.amountWrap}>
          <span style={styles.rupeeSign}>₨</span>
          <input style={styles.amountInput} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" inputMode="numeric" />
        </div>
      </div>

      <div style={styles.submitWrap}>
        <button
          style={{ ...styles.submitBtn, opacity: !materialType || !quantity || submitting ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={!materialType || !quantity || submitting}
        >
          {submitting ? "SAVING..." : "LOG DELIVERY"}
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
  materialGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  materialBtn: { padding: "10px 16px", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 100, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "#333", cursor: "pointer", transition: "all 0.15s ease" },
  materialBtnActive: { background: "#FFF3E0", border: "2px solid #FF6B00", color: "#FF6B00" },
  quantityRow: { display: "flex", gap: 10 },
  input: { width: "100%", padding: "14px 16px", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 12, fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#111", outline: "none" },
  amountWrap: { display: "flex", alignItems: "center", background: "#F5F5F5", border: "2px solid #E0E0E0", borderRadius: 12, overflow: "hidden" },
  rupeeSign: { padding: "14px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.25rem", color: "#FF6B00", background: "#FFF3E0", borderRight: "2px solid #E0E0E0" },
  amountInput: { flex: 1, padding: "14px 16px", background: "transparent", border: "none", fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: "#111", outline: "none" },
  submitWrap: { padding: "24px 20px 0" },
  submitBtn: { width: "100%", padding: "20px", background: "#FF6B00", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer", letterSpacing: "0.05em" },
  successContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 24, textAlign: "center" },
  successIcon: { fontSize: "4rem", marginBottom: 16 },
  successTitle: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#111", marginBottom: 8 },
  successMaterial: { fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700, color: "#FF6B00", marginBottom: 4 },
  successSupplier: { fontSize: "0.95rem", color: "#888", marginBottom: 32 },
  newBtn: { width: "100%", padding: "18px", background: "#111", color: "#FFF", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
};