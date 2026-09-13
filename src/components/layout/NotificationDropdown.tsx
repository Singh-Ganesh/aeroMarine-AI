import { useEffect, useRef } from "react";
import { AlertCircle, AlertTriangle, Bell, Check, CheckCheck, Info, MapPin, Ship, Trash2, X } from "lucide-react";
import type { AppNotification } from "../../types";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
}: NotificationDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-[50000] w-80 sm:w-96 rounded-xl border border-[var(--border)] bg-[var(--card)] p-0 shadow-2xl backdrop-blur-md animate-fade-in"
      style={{ maxWidth: "calc(100vw - 20px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 bg-[var(--surface)] rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[var(--text-primary)]" />
          <h4 className="text-[13px] font-bold text-[var(--text-primary)]">NOTIFICATIONS</h4>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.2 text-[10px] font-mono font-bold text-red-500 dark:text-red-400 border border-red-500/30">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              title="Mark all as read"
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              <CheckCheck size={13} />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              title="Clear notifications"
              className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--border)]">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)]">
            <Bell size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-[12.5px] font-medium text-[var(--text-secondary)]">No notifications</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Maritime monitoring logs are clear</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isRed = n.severity === "critical";
            const isOrange = n.severity === "warning";

            return (
              <div
                key={n.id}
                onClick={() => onSelectNotification(n)}
                className={`group flex items-start gap-3 p-3.5 cursor-pointer transition-all hover:bg-[var(--surface-hover)] ${
                  !n.read ? "bg-[var(--surface)]/50" : ""
                }`}
              >
                {/* Severity Badge / Dot */}
                <div className="shrink-0 mt-0.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                      isRed
                        ? "border-red-500/40 bg-red-500/15 text-red-500 dark:text-red-400"
                        : isOrange
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-500 dark:text-amber-400"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                    }`}
                  >
                    {isRed ? (
                      <AlertCircle size={14} />
                    ) : isOrange ? (
                      <AlertTriangle size={14} />
                    ) : n.vesselId ? (
                      <Ship size={14} />
                    ) : (
                      <Info size={14} />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h5
                      className={`text-[12px] font-semibold leading-tight truncate ${
                        !n.read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {n.title}
                    </h5>
                    <span className="shrink-0 text-[10px] font-mono text-[var(--text-muted)]">
                      {n.time}
                    </span>
                  </div>

                  {n.location && (
                    <p className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)] mt-0.5 truncate">
                      <MapPin size={11} className="shrink-0 text-[var(--text-muted)]" />
                      {n.location}
                    </p>
                  )}

                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1">
                    {n.detail}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border)]/50">
                    <span className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      {n.isSimulatedDemo ? "DEMO / SIMULATED" : "VERIFIED AIS"}
                    </span>
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(n.id);
                        }}
                        title="Mark as read"
                        className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-0.5"
                      >
                        <Check size={11} /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
