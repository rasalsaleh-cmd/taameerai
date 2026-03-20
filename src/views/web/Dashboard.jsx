/**
 * Dashboard.jsx — SiteOS Owner Web Dashboard
 * Shows all active projects with stats and health indicators.
 * Owner clicks a project card to open ProjectDetail.
 */

import { fPKR } from "../../utils/formatting.js";
import { getBudgetStatus, getTimelineStatus } from "../../utils/helpers.js";

export default function Dashboard({ projects, loading, onOpenProject }) {
  // Calculate portfolio-level stats
  const totalContract = projects.reduce((sum, p) => sum + (p.contractValue || 0), 0);
  const totalSpent = projects.reduce((sum, p) => {
    const spent = (p.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    return sum + spent;
  }, 0);
  const activeCount = projects.filter((p) => p.status === "active").length;

  if (loading) return <div style={styles.loading}>Loading projects...</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            {activeCount} active project{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button style={styles.newBtn} onClick={() => {}}>
          + New Project
        </button>
      </div>

      {/* Portfolio Stats */}
      <div style={styles.statsRow}>
        <StatCard label="Active Projects" value={activeCount} mono={false} />
        <StatCard label="Total Contract Value" value={fPKR(totalContract)} />
        <StatCard label="Total Spent" value={fPKR(totalSpent)} />
        <StatCard
          label="Remaining"
          value={fPKR(totalContract - totalSpent)}
          highlight
        />
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            No projects yet. Create your first project to get started.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <ProjectCard
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

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, mono = true, highlight = false }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div
        style={{
          ...styles.statValue,
          fontFamily: mono ? "var(--font-mono)" : "var(--font-heading)",
          color: highlight ? "var(--gold)" : "var(--text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Project Card ───────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  const spent = (project.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const budget = project.contractValue || 0;
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const budgetStatus = getBudgetStatus(project);
  const timelineStatus = getTimelineStatus(project);

  const activePhase = (project.phases || []).find((p) => p.status === "active");
  const completedPhases = (project.phases || []).filter((p) => p.status === "done").length;
  const totalPhases = (project.phases || []).length;

  const statusColors = {
    "on-track":  { bg: "var(--green-bg)",  color: "var(--green)" },
    "at-risk":   { bg: "var(--amber-bg)",  color: "var(--amber)" },
    "overdue":   { bg: "var(--red-bg)",    color: "var(--red)" },
    "over-budget":{ bg: "var(--red-bg)",   color: "var(--red)" },
    "watch":     { bg: "var(--amber-bg)",  color: "var(--amber)" },
    "healthy":   { bg: "var(--green-bg)",  color: "var(--green)" },
  };

  const bStatus = statusColors[budgetStatus] || statusColors["healthy"];
  const tStatus = statusColors[timelineStatus] || statusColors["on-track"];

  return (
    <div style={styles.projectCard} onClick={onClick}>
      {/* Card Header */}
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.projectName}>{project.name}</div>
          <div style={styles.projectClient}>{project.client}</div>
        </div>
        <div style={styles.contractValue}>{fPKR(project.contractValue)}</div>
      </div>

      {/* Current Phase */}
      {activePhase && (
        <div style={styles.phaseRow}>
          <span style={styles.phaseLabel}>Current Phase</span>
          <span style={styles.phaseName}>{activePhase.label}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ marginTop: 12 }}>
        <div style={styles.progressMeta}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            {completedPhases}/{totalPhases} phases
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            {fPKR(spent)} spent
          </span>
        </div>
        <div className="progress-bar" style={{ marginTop: 6 }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Tags */}
      <div style={styles.tags}>
        <span style={{ ...styles.tag, background: bStatus.bg, color: bStatus.color }}>
          {budgetStatus}
        </span>
        <span style={{ ...styles.tag, background: tStatus.bg, color: tStatus.color }}>
          {timelineStatus}
        </span>
        <span style={{ ...styles.tag, background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
          {project.location}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 32,
    maxWidth: 1200,
  },
  loading: {
    padding: 32,
    color: "var(--text-muted)",
    fontFamily: "var(--font-sans)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: 4,
  },
  subtitle: {
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  },
  newBtn: {
    padding: "10px 20px",
    background: "var(--gold)",
    color: "#000",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
    boxShadow: "var(--shadow-sm)",
  },
  statLabel: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
    fontFamily: "var(--font-heading)",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 20,
  },
  empty: {
    padding: "60px 0",
  },
  projectCard: {background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
    cursor: "pointer",
    transition: "all var(--transition)",
    boxShadow: "var(--shadow-sm)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectName: {
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "1rem",
    color: "var(--text-primary)",
    marginBottom: 2,
  },
  projectClient: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  contractValue: {
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "var(--gold)",
  },
  phaseRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    background: "var(--bg-tertiary)",
    borderRadius: "var(--radius-sm)",
    marginTop: 8,
  },
  phaseLabel: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  phaseName: {
    fontSize: "0.8rem",
    color: "var(--text-primary)",
    fontWeight: 600,
  },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
  },
  tags: {
    display: "flex",
    gap: 6,
    marginTop: 14,
    flexWrap: "wrap",
  },
  tag: {
    padding: "3px 10px",
    borderRadius: 100,
    fontSize: "0.7rem",
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    textTransform: "capitalize",
  },
};