/**
 * MobileSettings.jsx — SiteOS Owner Mobile Settings
 * Theme selection and app info for mobile owner view.
 * Cog icon accessible from top right of mobile header.
 */

export default function MobileSettings({ theme, setTheme }) {
  const themes = [
    { key: "system", label: "Follow System", desc: "Matches your device", icon: "⊙" },
    { key: "light",  label: "Light Mode",    desc: "Professional grey",  icon: "☀" },
    { key: "dark",   label: "Dark Mode",     desc: "Very dark grey",     icon: "◑" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Settings</div>
      </div>

      {/* Theme */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Appearance</div>
        {themes.map((t) => (
          <div
            key={t.key}
            onClick={() => setTheme(t.key)}
            style={{
              ...styles.themeRow,
              ...(theme === t.key ? styles.themeRowActive : {}),
            }}
          >
            <span style={styles.themeIcon}>{t.icon}</span>
            <div style={styles.themeInfo}>
              <div style={styles.themeLabel}>{t.label}</div>
              <div style={styles.themeDesc}>{t.desc}</div>
            </div>
            {theme === t.key && <span style={styles.check}>✓</span>}
          </div>
        ))}
      </div>

      {/* App Info */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>About</div>
        <div style={styles.infoCard}>
          {[
            { key: "Product", val: "SiteOS" },
            { key: "Version", val: "1.0.0 Beta" },
            { key: "Market",  val: "Pakistan" },
          ].map((item) => (
            <div key={item.key} style={styles.infoRow}>
              <span style={styles.infoKey}>{item.key}</span>
              <span style={styles.infoVal}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: 20 },
  header: { padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" },
  title: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" },
  section: { padding: "20px 16px 0" },
  sectionLabel: { fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: "var(--font-heading)" },
  themeRow: { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 8, cursor: "pointer", transition: "all var(--transition)" },
  themeRowActive: { border: "1px solid var(--gold)", background: "var(--gold-dim)" },
  themeIcon: { fontSize: "1.25rem", width: 28, textAlign: "center" },
  themeInfo: { flex: 1 },
  themeLabel: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: 2 },
  themeDesc: { fontSize: "0.75rem", color: "var(--text-muted)" },
  check: { width: 22, height: 22, borderRadius: "50%", background: "var(--gold)", color: "#000", fontSize: "0.7rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  infoCard: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--border)" },
  infoKey: { fontSize: "0.85rem", color: "var(--text-muted)" },
  infoVal: { fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 },
};