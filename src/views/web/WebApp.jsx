/**
 * WebApp.jsx — SiteOS Owner Web Shell
 * Top-level layout for the desktop/web owner experience.
 * Sidebar navigation — Rates and Checklists moved into Settings.
 */

import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import ProjectDetail from "./ProjectDetail.jsx";
import QuoteGenerator from "./QuoteGenerator.jsx";
import Reports from "./Reports.jsx";
import Settings from "./Settings.jsx";
import { useProjects } from "../../hooks/useProjects.js";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: "⊞" },
  { id: "quote",     label: "New Quote",  icon: "✦" },
  { id: "reports",   label: "Reports",    icon: "↗" },
  { id: "settings",  label: "Settings",   icon: "⚙" },
];

export default function WebApp({ theme, setTheme }) {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const projectData = useProjects();

  function openProject(projectId) {
    setSelectedProjectId(projectId);
    setActiveScreen("project");
  }

  function goBack() {
    setSelectedProjectId(null);
    setActiveScreen("dashboard");
  }

  function renderScreen() {
    switch (activeScreen) {
      case "dashboard":
        return <Dashboard {...projectData} onOpenProject={openProject} />;
      case "project":
        return <ProjectDetail {...projectData} projectId={selectedProjectId} onBack={goBack} />;
      case "quote":
        return <QuoteGenerator {...projectData} />;
      case "reports":
        return <Reports {...projectData} />;
      case "settings":
        return <Settings theme={theme} setTheme={setTheme} />;
      default:
        return <Dashboard {...projectData} onOpenProject={openProject} />;
    }
  }

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoText}>SiteOS</span>
          <span style={styles.logoTag}>BETA</span>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              style={{
                ...styles.navItem,
                ...(activeScreen === item.id || (activeScreen === "project" && item.id === "dashboard")
                  ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.userBadge}>
            <div style={styles.userAvatar}>O</div>
            <div>
              <div style={styles.userRole}>Owner</div>
              <div style={styles.userName}>SiteOS</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {renderScreen()}
      </main>
    </div>
  );
}

const styles = {
  shell: { display: "flex", height: "100vh", background: "var(--bg-primary)", overflow: "hidden" },
  sidebar: { width: 220, minWidth: 220, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" },
  logo: { padding: "24px 20px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 },
  logoText: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--gold)", letterSpacing: "-0.02em" },
  logoTag: { fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.08em" },
  nav: { flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--radius-md)", border: "none", background: "transparent", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left", transition: "all var(--transition)" },
  navItemActive: { background: "var(--gold-dim)", color: "var(--gold)", fontWeight: 600 },
  navIcon: { fontSize: "1rem", width: 20, textAlign: "center" },
  sidebarBottom: { padding: "16px", borderTop: "1px solid var(--border)" },
  userBadge: { display: "flex", alignItems: "center", gap: 10 },
  userAvatar: { width: 32, height: 32, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem" },
  userRole: { fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 },
  userName: { fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 },
  main: { flex: 1, overflow: "auto", background: "var(--bg-primary)" },
};