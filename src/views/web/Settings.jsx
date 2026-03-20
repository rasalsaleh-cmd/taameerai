/**
 * Settings.jsx — SiteOS App Settings
 * Tabs: Appearance, Rate Database, Team & Access, About
 * Owner can preview Supervisor View from Team & Access tab.
 */

import { useState } from "react";
import { DEFAULT_RATES } from "../../constants/rates.js";
import SupervisorApp from "../supervisor-mobile/SupervisorApp.jsx";

const TABS = ["Appearance", "Rate Database", "Team & Access", "About"];

export default function Settings({ theme, setTheme }) {
  const [activeTab, setActiveTab] = useState("Appearance");
  const [previewingSupervisor, setPreviewingSupervisor] = useState(false);

  // Full screen supervisor preview
  if (previewingSupervisor) {
    return (
      <div style={styles.previewWrapper}>
        <div style={styles.previewBanner}>
          <span style={styles.previewBannerText}>
            👁 Previewing Supervisor View
          </span>
          <button
            style={styles.previewExitBtn}
            onClick={() => setPreviewingSupervisor(false)}
          >
            ✕ Exit Preview
          </button>
        </div>
        <div style={styles.previewPhone}>
          <SupervisorApp />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Manage your SiteOS preferences</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Appearance"    && <AppearanceTab theme={theme} setTheme={setTheme} />}
      {activeTab === "Rate Database" && <RateDatabaseTab />}
      {activeTab === "Team & Access" && <TeamTab onPreviewSupervisor={() => setPreviewingSupervisor(true)} />}
      {activeTab === "About"         && <AboutTab />}
    </div>
  );
}

// ─── Appearance Tab ─────────────────────────────────────────
function AppearanceTab({ theme, setTheme }) {
  const themes = [
    { key: "system", label: "Follow System", desc: "Matches your device setting", icon: "⊙" },
    { key: "light",  label: "Light Mode",    desc: "Professional grey theme",    icon: "☀" },
    { key: "dark",   label: "Dark Mode",     desc: "Very dark grey theme",       icon: "◑" },
  ];
  return (
    <div style={styles.tabContent}>
      <div style={styles.sectionTitle}>Theme</div>
      <div style={styles.themeGrid}>
        {themes.map((t) => (
          <div
            key={t.key}
            onClick={() => setTheme(t.key)}
            style={{ ...styles.themeCard, ...(theme === t.key ? styles.themeCardActive : {}) }}
          >
            <div style={styles.themeIcon}>{t.icon}</div>
            <div style={styles.themeLabel}>{t.label}</div>
            <div style={styles.themeDesc}>{t.desc}</div>
            {theme === t.key && <div style={styles.themeCheck}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rate Database Tab ──────────────────────────────────────
function RateDatabaseTab() {
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
    setRates((prev) => ({ ...prev, [key]: { ...prev[key], rate: Number(editValue) } }));
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
    <div style={styles.tabContent}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitle}>Material & Labour Rates</div>
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
                    <input style={styles.rateInput} type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
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

// ─── Team & Access Tab ───────────────────────────────────────
function TeamTab({ onPreviewSupervisor }) {
  return (
    <div style={styles.tabContent}>
      {/* Supervisor Preview */}
      <div style={styles.previewCard}>
        <div style={styles.previewCardLeft}>
          <div style={styles.previewCardTitle}>Supervisor View Preview</div>
          <div style={styles.previewCardDesc}>
            See exactly what your on-site supervisors see when they open SiteOS.
            High visibility interface designed for dusty construction sites.
          </div>
        </div>
        <button style={styles.previewBtn} onClick={onPreviewSupervisor}>
          👁 Preview
        </button>
      </div>

      {/* Auth coming soon */}
      <div style={styles.comingSoonCard}>
        <div style={styles.comingSoonIcon}>🔐</div>
        <div style={styles.comingSoonTitle}>Team Management Coming Soon</div>
        <div style={styles.comingSoonDesc}>
          Add managers and supervisors, assign them to projects, and control access.
          Full authentication system coming in the next build session.
        </div>
        <div style={styles.comingSoonFeatures}>
          <div style={styles.comingSoonFeature}>✦ Email & phone number login</div>
          <div style={styles.comingSoonFeature}>✦ Owner creates team accounts</div>
          <div style={styles.comingSoonFeature}>✦ Supervisors assigned to sub-phases</div>
          <div style={styles.comingSoonFeature}>✦ Manager role for delegation</div>
        </div>
      </div>
    </div>
  );
}

// ─── About Tab ───────────────────────────────────────────────
function AboutTab() {
  return (
    <div style={styles.tabContent}>
      <div style={styles.sectionTitle}>About SiteOS</div>
      <div style={styles.infoCard}>
        {[
          { key: "Product",  val: "SiteOS" },
          { key: "Version",  val: "1.0.0 Beta" },
          { key: "Tagline",  val: "The Operating System for Construction" },
          { key: "Market",   val: "Pakistan" },
          { key: "Stack",    val: "React + Supabase + Claude AI" },
        ].map((item) => (
          <div key={item.key} style={styles.infoRow}>
            <span style={styles.infoKey}>{item.key}</span>
            <span style={styles.infoVal}>{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 800 },
  header: { marginBottom: 24 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: 4 },
  subtitle: { color: "var(--text-muted)", fontSize: "0.875rem" },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 28 },
  tab: { padding: "10px 18px", background: "transparent", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-muted)", transition: "all var(--transition)" },
  tabActive: { color: "var(--gold)", borderBottomColor: "var(--gold)" },
  tabContent: { display: "flex", flexDirection: "column", gap: 16 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 16 },
  headerBtns: { display: "flex", gap: 10 },
  resetBtn: { padding: "8px 16px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.8rem", color: "var(--text-secondary)" },
  saveBtn: { padding: "8px 16px", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem", transition: "background var(--transition)" },
  categorySection: { marginBottom: 20 },
  categoryTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 },
  rateRow: { display: "flex", alignItems: "center", padding: "10px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 5, gap: 12 },
  rateName: { flex: 2, fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" },
  rateUnit: { flex: 1, fontSize: "0.75rem", color: "var(--text-muted)" },
  rateValueRow: { flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  rateValue: { fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--gold)", fontSize: "0.9rem" },
  editRow: { flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  rateInput: { width: 110, padding: "6px 10px", background: "var(--bg-tertiary)", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--text-primary)", outline: "none" },
  editBtn: { padding: "5px 10px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 },
  confirmBtn: { padding: "5px 10px", background: "var(--green-bg)", color: "var(--green)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700 },
  cancelBtn: { padding: "5px 10px", background: "var(--red-bg)", color: "var(--red)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 700 },
  themeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  themeCard: { position: "relative", padding: 20, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "all var(--transition)", textAlign: "center" },
  themeCardActive: { border: "1px solid var(--gold)", background: "var(--gold-dim)" },
  themeIcon: { fontSize: "1.5rem", marginBottom: 10 },
  themeLabel: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 4 },
  themeDesc: { fontSize: "0.75rem", color: "var(--text-muted)" },
  themeCheck: { position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "var(--gold)", color: "#000", fontSize: "0.7rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  infoCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--border)" },
  infoKey: { fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 },
  infoVal: { fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 },
  previewWrapper: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg-primary)", zIndex: 1000, display: "flex", flexDirection: "column" },
  previewBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "var(--gold)", flexShrink: 0 },
  previewBannerText: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#000" },
  previewExitBtn: { padding: "6px 16px", background: "#000", color: "var(--gold)", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem" },
  previewPhone: { flex: 1, overflow: "auto", maxWidth: 390, margin: "0 auto", width: "100%", background: "#FFF", boxShadow: "var(--shadow-lg)" },
  previewCard: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", gap: 20 },
  previewCardLeft: { flex: 1 },
  previewCardTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 6 },
  previewCardDesc: { fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 },
  previewBtn: { padding: "12px 24px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap" },
  comingSoonCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, textAlign: "center" },
  comingSoonIcon: { fontSize: "2.5rem", marginBottom: 12 },
  comingSoonTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 8 },
  comingSoonDesc: { fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 },
  comingSoonFeatures: { display: "flex", flexDirection: "column", gap: 8, textAlign: "left", maxWidth: 300, margin: "0 auto" },
  comingSoonFeature: { fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 },
};