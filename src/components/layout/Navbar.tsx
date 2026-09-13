import { useState } from "react";
import { Bell, Menu, Moon, Sun, UserPlus, Waves } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import RegisterModal from "./RegisterModal";
import NotificationDropdown from "./NotificationDropdown";
import type { AppNotification } from "../../types";

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarMode: "full" | "collapsed" | "hidden";
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAllNotifications: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export default function Navbar({
  onToggleSidebar,
  sidebarMode,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAllNotifications,
  onSelectNotification,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="relative z-[5000] flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 transition-colors">
      <div className="flex items-center gap-3">
        {/* Three-line Hamburger Button (Active on Desktop & Mobile) */}
        <button 
          onClick={onToggleSidebar} 
          className="focus-ring rounded-lg p-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          aria-label="Toggle navigation menu"
          title={
            sidebarMode === "full"
              ? "Collapse sidebar (Icon only)"
              : sidebarMode === "collapsed"
              ? "Enter Fullscreen (Hide sidebar)"
              : "Expand full sidebar"
          }
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] shadow-sm">
            <Waves size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              aeroMarine-Ai
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] leading-tight mt-0.5">
              AI-Powered Oil Spill Detection & Maritime Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Top-right Actions: [🔔] [Register / Sign Up] [Theme] */}
      <div className="flex items-center gap-2.5">
        {/* Notifications Icon with Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen((o) => !o)}
            aria-label="Notifications"
            title="Open Notifications"
            className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] shadow-sm transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-mono font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={notifDropdownOpen}
            onClose={() => setNotifDropdownOpen(false)}
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearAll={onClearAllNotifications}
            onSelectNotification={(notif) => {
              setNotifDropdownOpen(false);
              onSelectNotification(notif);
            }}
          />
        </div>

        {/* Register / Sign Up Button */}
        <button
          onClick={() => setAuthModalOpen(true)}
          className="focus-ring flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] shadow-sm transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]"
        >
          <UserPlus size={14} className="text-[var(--text-primary)]" />
          <span className="whitespace-nowrap font-medium">Register / Sign Up</span>
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className="focus-ring flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] shadow-sm transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]"
        >
          {theme === "dark" ? (
            <>
              <Sun size={15} className="text-[var(--text-primary)]" />
              <span className="hidden sm:inline font-mono">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} className="text-[var(--text-primary)]" />
              <span className="hidden sm:inline font-mono">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Standalone Centered Registration / Sign Up Modal */}
      <RegisterModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
}

