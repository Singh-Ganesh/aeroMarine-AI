import { useCallback, useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import OilSpillDetection from "./pages/OilSpillDetection";
import IncidentReports from "./pages/IncidentReports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import type { AppNotification, SectionKey } from "./types";
import { initialNotifications } from "./data/notifications";

export type SidebarMode = "full" | "collapsed" | "hidden";

export default function App() {
  const [section, setSection] = useState<SectionKey>("live-monitor");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("full");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>(initialNotifications);

  // Target entity to focus when an alert is clicked
  const [targetAssetId, setTargetAssetId] = useState<string | null>(null);
  const [targetSpillId, setTargetSpillId] = useState<string | null>(null);

  // Trigger window resize so Leaflet maps recalculate dimensions smoothly
  const triggerMapResize = useCallback(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 350);
  }, []);

  // 3-state toggle: full -> collapsed (icon-only) -> hidden (fullscreen) -> full
  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen((prev) => !prev);
      triggerMapResize();
      return;
    }

    setSidebarMode((current) => {
      let next: SidebarMode;
      if (current === "full") {
        next = "collapsed";
      } else if (current === "collapsed") {
        next = "hidden";
      } else {
        next = "full";
      }
      triggerMapResize();
      return next;
    });
  };

  const handleMarkAsRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotificationsList([]);
  };

  const handleSelectNotification = (notif: AppNotification) => {
    handleMarkAsRead(notif.id);
    if (notif.targetSection) {
      setSection(notif.targetSection);
    }
    if (notif.vesselId) {
      setTargetAssetId(notif.vesselId);
      setTargetSpillId(null);
    } else if (notif.incidentId) {
      setTargetSpillId(notif.incidentId);
      setTargetAssetId(null);
    }
    triggerMapResize();
  };

  function renderSection() {
    switch (section) {
      case "live-monitor":
        return (
          <Dashboard
            targetAssetId={targetAssetId}
            targetSpillId={targetSpillId}
          />
        );
      case "oil-spill":
        return <OilSpillDetection />;
      case "incident-reports":
        return <IncidentReports />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar (Full, Collapsed icons-only, or hidden) */}
      {sidebarMode !== "hidden" && (
        <Sidebar
          active={section}
          onSelect={(key) => {
            setSection(key);
            setTargetAssetId(null);
            setTargetSpillId(null);
            setMobileDrawerOpen(false);
            triggerMapResize();
          }}
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          collapsed={sidebarMode === "collapsed"}
        />
      )}

      {/* Main Content Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-300">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          sidebarMode={sidebarMode}
          notifications={notificationsList}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onSelectNotification={handleSelectNotification}
        />
        <main className="min-w-0 flex-1">{renderSection()}</main>
      </div>
    </div>
  );
}
