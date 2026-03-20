/**
 * MobileApp.jsx — SiteOS Owner Mobile Shell
 * Bottom tab navigation for owner on mobile devices.
 * Landscape mode automatically switches to web layout (handled in App.jsx).
 */

import { useState } from "react";
import MobileDashboard from "./MobileDashboard.jsx";
import MobileProjectDetail from "./MobileProjectDetail.jsx";
import MobileQuote from "./MobileQuote.jsx";
import MobileSettings from "./MobileSettings.jsx";
import Reports from "../web/Reports.jsx";
import { useProjects } from "../../hooks/useProjects.js";

const TABS = [
  { id: "dashboard", label: "Home",     icon: "⊞" },
  { id: "quote",     label: "Quote",    icon: "✦" },
  { id: "reports",   label: "Reports",  icon: "↗" },
  { id: "settings",  label: "Settings", icon: "⚙" },
];

export default function MobileApp({ theme, setTheme }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const projectData = useProjects();

  function openProject(projectId) {
    setSelectedProjectId(projectId);
    setActiveTab("project");
  }

  function goBack() {
    setSelectedProjectId(null);
    setActiveTab("dashboard");
  }

  function renderScreen() {
    switch (activeTab) {
      case "dashboard":
        return <MobileDashboard {...projectData} onOpenProject={openProject} />;
      case "project":
        return <MobileProjectDetail {...projectData} projectId={selectedProjectId} onBack={goBack} />;
      case "quote":
        return <MobileQuote />;
      case "reports":
        return <Reports {...projectData} />;
      case "settings":
        return <MobileSettings theme={theme} setTheme={setTheme} />;
      default:
        return <MobileDashboard {...projectData} onOpenProject={openProject} />;
    }
  }

  return (
    <div style={styles.shell}>
      {/* Main content — scrollable */}
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
              ...(activeTab === tab.id || (activeTab === "project" && tab.id === "dashboard")
                ? styles.tabBtnActive : {}),
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
    background: "var(--bg-primary)",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
  },
  tabBar: {
    display: "flex",
    background: "var(--bg-secondary)",
    borderTop: "1px solid var(--border)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
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
    transition: "all var(--transition)",
  },
  tabBtnActive: {
    color: "var(--gold)",
  },
  tabIcon: {
    fontSize: "1.2rem",
    color: "inherit",
  },
  tabLabel: {
    fontSize: "0.65rem",
    fontFamily: "var(--font-heading)",
    fontWeight: 600,
    color: "inherit",
    letterSpacing: "0.03em",
  },
};