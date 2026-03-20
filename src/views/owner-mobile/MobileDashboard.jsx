/**
 * MobileDashboard.jsx — SiteOS Owner Mobile Dashboard
 * Card-based project overview optimised for phone screens.
 * Tap a project card to open full project detail.
 */

import { fPKR } from "../../utils/formatting.js";
import { getBudgetStatus, getTimelineStatus } from "../../utils/helpers.js";

export default function MobileDashboard({ projects, loading, onOpenProject }) {
  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalContract = projects.reduce((s, p) => s + (p.contractValue || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p.expenses || []).reduce((e, x) => e + (x.amount || 0), 0), 0);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoText}>SiteOS</div>
        <div style={styles.headerRight}>
          <span style={styles.betaTag}>BETA</span>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={styles.statsStrip}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{activeCount}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <div style={{ ...styles.statValue, fontFamily: "var(--font-mono)", fontSize: "1rem" }}>{fPKR(totalContract)}</div>
          <div style={styles.statLabel}>Total Contract</div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <div style={{ ...styles.statValue, fontFamily: "var(--font-mono)", fontSize: "1rem", color: "var(--gold)" }}>{fPKR(totalSpent)}</div>
          <div style={styles.statLabel}>Total Spent</div>
        </div>
      </div>

      {/* Section Title */}
      <div style={styles.sectionTitle}>Your Projects</div>

      {/* Project Cards */}
      {projects.length === 0 ? (
        <div style={styles.empty}>No projects yet.</div>
      ) : (
        <div style={styles.list}>
          {projects.map((project) => (
            <MobileProjectCard
              key={project.id}
              project={project}
              onClick={() => onOpenProject(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileProjectCard({ project, onClick }) {
  const spent = (project.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const progress = project.contractValue > 0 ? Math.min((spent / project.contractValue) * 100, 100) : 0;
  const activePhase = (project.phases || []).find((p) => p.status === "active");
  const budgetStatus = getBudgetStatus(project);
  const timelineStatus = getTimelineStatus(project);

  const statusColors = {
    "on-track":    "var(--green)",
    "at-risk":     "var(--amber)",
    "overdue":     "var(--red)",
    "over-budget": "var(--red)",
    "watch":       "var(--amber)",
    "healthy":     "var(--green)",
  };

  return (
    <div style={styles.card} onClick={onClick}>
      {/* Card Top */}
      <div style={styles.cardTop}>
        <div style={styles.cardLeft}>
          <div style={styles.projectName}>{project.name}</div>
          <div style={styles.projectClient}>{project.client}</div>
        </div>
        <div style={styles.contractValue}>{fPKR(project.contractValue)}</div>
      </div>

      {/* Active Phase */}
      {activePhase && (
        <div style={styles.phaseChip}>
          <div style={styles.phaseDot} />
          <span style={styles.phaseText}>{activePhase.label}</span>
        </div>
      )}

      {/* Progress */}
      <div style={styles.progressWrap}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <div style={styles.progressMeta}>
          <span style={{ color: statusColors[budgetStatus] || "var(--text-muted)" }}>
            {budgetStatus}
          </span>
          <span style={{ color: statusColors[timelineStatus] || "var(--text-muted)" }}>
            {timelineStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: 20 },
  loading: { padding: 24, color: "var(--text-muted)", textAlign: "center" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px" },
  logoText: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--gold)" },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  betaTag: { fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.08em" },
  statsStrip: { display: "flex", background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "14px 0", marginBottom: 20 },
  statItem: { flex: 1, textAlign: "center" },
  statValue: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" },
  statLabel: { fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 },
  statDivider: { width: 1, background: "var(--border)", margin: "4px 0" },
  sectionTitle: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 20px", marginBottom: 12 },
  list: { display: "flex", flexDirection: "column", gap: 12, padding: "0 16px" },
  empty: { padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" },
  card: { background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16, boxShadow: "var(--shadow-sm)", cursor: "pointer" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  cardLeft: { flex: 1 },
  projectName: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 2 },
  projectClient: { fontSize: "0.75rem", color: "var(--text-muted)" },
  contractValue: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.875rem", color: "var(--gold)" },
  phaseChip: { display: "flex", alignItems: "center", gap: 6, background: "var(--bg-tertiary)", borderRadius: 100, padding: "4px 10px", marginBottom: 10, alignSelf: "flex-start", width: "fit-content" },
  phaseDot: { width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 },
  phaseText: { fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 },
  progressWrap: { marginTop: 4 },
  progressBar: { height: 5, background: "var(--bg-tertiary)", borderRadius: 100, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", background: "var(--gold)", borderRadius: 100, transition: "width 0.5s ease" },
  progressMeta: { display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 600, textTransform: "capitalize" },
};