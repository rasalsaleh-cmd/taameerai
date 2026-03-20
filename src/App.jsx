/**
 * App.jsx — SiteOS Root Router
 * Detects user role and device, renders the correct view.
 * This file does routing only — no UI, no data fetching.
 */

import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

// Views
import WebApp from "./views/web/WebApp.jsx";
import MobileApp from "./views/owner-mobile/MobileApp.jsx";
import SupervisorApp from "./views/supervisor-mobile/SupervisorApp.jsx";

export default function App() {
  // Role: "owner" or "supervisor" — hardcoded for now, replaced by auth later
  const [role, setRole] = useState("owner");

  // Theme: "light", "dark", or "system"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("siteos-theme") || "system";
  });

  // Device detection
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("siteos-theme", theme);
  }, [theme]);

  // Detect mobile and orientation
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024;
      const landscape = window.innerWidth > window.innerHeight;
      setIsMobile(mobile);
      setIsLandscape(landscape);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);
    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  // Shared props passed to all views
  const sharedProps = { role, setRole, theme, setTheme };

  // Supervisor always gets supervisor view
  if (role === "supervisor") {
    return <SupervisorApp {...sharedProps} />;
  }

  // Owner on mobile portrait → mobile view
  // Owner on mobile landscape or desktop → web view
  if (isMobile && !isLandscape) {
    return <MobileApp {...sharedProps} />;
  }

  return <WebApp {...sharedProps} />;
}