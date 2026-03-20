/**
 * SupervisorApp.jsx — SiteOS Supervisor Mobile Shell
 * High visibility interface for on-site supervisors.
 * White background, large buttons, one-tap operations.
 * Bottom tab navigation between site tasks.
 */

import { useState } from "react";
import Checklist from "./Checklist.jsx";
import ExpenseLog from "./ExpenseLog.jsx";
import MaterialDelivery from "./MaterialDelivery.jsx";
import LabourAttendance from "./LabourAttendance.jsx";
import { useProjects } from "../../hooks/useProjects.js";

const TABS = [
  { id: "checklist", label: "Checklist", icon: "✓" },
  { id: "expense",   label: "Expense",   icon: "₨" },
  { id: "material",  label: "Delivery",  icon: "📦" },
  { id: "labour",    label: "Labour",    icon: "👷" },
];

export default function SupervisorApp() {
  const [activeTab, setActiveTab] = useState("checklist");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const projectData = useProjects();
  const { projects } = projectData;

  // Auto-select first active project if none selected
  const activeProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : projects.find((p) => p.status === "active") || projects[0];

  function renderScreen() {
    if (!activeProject) {
      return (
        <div style={styles.noProject}>
          <div style={styles.noProjectIcon}>🏗</div>
          <div style={styles.noProjectText}>No active projects found</div>
          <div style={styles.noProjectSub}>Contact your project owner</div>
        </div>
      );
    }
    switch (activeTab) {
      case "checklist": return <Checklist project={activeProject} {...projectData} />;
      case "expense":   return <ExpenseLog project={activeProject} {...projectData} />;
      case "material":  return <MaterialDelivery project={activeProject} {...projectData} />;
      case "labour":    return <LabourAttendance project={activeProject} />;
      default:          return <Checklist project={activeProject} {...projectData} />;
    }
  }

  return (
    <div style={styles.shell}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <div style={styles.topLogo}>SiteOS</div>
          <div style={styles.topRole}>Supervisor</div>
        </div>
        {activeProject && (
          <div style={styles.projectBadge}>
            <div style={styles.projectBadgeDot} />
            <span style={styles.projectBadgeName}>{activeProject.name}</span>
          </div>
        )}
      </div>

      {/* Project Selector — shown if multiple projects */}
      {projects.length > 1 && (
        <div style={styles.projectSelector}>
          <select
            style={styles.projectSelect}
            value={activeProject?.id || ""}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.content}>
        {renderScreen()}
      </div>

      {/* Bottom Tab Bar */}
      <nav style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.id ? styles.tabBtnActive : {}),
            }}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  shell: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#FFFFFF",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#1A1A1A",
    flexShrink: 0,
  },
  topLeft: { display: "flex", alignItems: "center", gap: 8 },
  topLogo: {
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "1rem",
    color: "#C4A35A",
  },
  topRole: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    background: "#333",
    padding: "2px 6px",
    borderRadius: 4,
  },
  projectBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#333",
    padding: "6px 12px",
    borderRadius: 100,
  },
  projectBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#2ECC71",
    flexShrink: 0,
  },
  projectBadgeName: {
    fontSize: "0.75rem",
    color: "#FFF",
    fontWeight: 600,
    maxWidth: 140,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  projectSelector: {
    padding: "8px 16px",
    background: "#F5F5F5",
    borderBottom: "1px solid #E0E0E0",
  },
  projectSelect: {
    width: "100%",
    padding: "10px 12px",
    background: "#FFF",
    border: "1px solid #E0E0E0",
    borderRadius: 8,
    fontFamily: "var(--font-sans)",
    fontSize: "0.9rem",
    color: "#111",
    outline: "none",
  },
  content: {
    flex: 1,
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    background: "#FFFFFF",
  },
  tabBar: {
    display: "flex",
    background: "#1A1A1A",
    borderTop: "1px solid #333",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    flexShrink: 0,
  },
  tabBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: "10px 0",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#888",
    transition: "all var(--transition)",
  },
  tabBtnActive: { color: "#C4A35A" },
  tabIcon: { fontSize: "1.2rem" },
  tabLabel: {
    fontSize: "0.6rem",
    fontFamily: "var(--font-heading)",
    fontWeight: 600,
    letterSpacing: "0.03em",
  },
  noProject: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: 40,
    textAlign: "center",
  },
  noProjectIcon: { fontSize: "3rem", marginBottom: 16 },
  noProjectText: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "#111", marginBottom: 8 },
  noProjectSub: { fontSize: "0.875rem", color: "#888" },
};