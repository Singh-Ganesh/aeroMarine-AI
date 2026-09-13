import {
  Activity,
  Droplets,
  FileWarning,
  Settings,
  Ship,
  X,
} from "lucide-react";
import type { SectionKey } from "../../types";

const navItems: { key: SectionKey; label: string; icon: typeof Ship }[] = [
  { key: "live-monitor", label: "Maritime Command", icon: Ship },
  { key: "oil-spill", label: "Oil Spill Detection", icon: Droplets },
  { key: "incident-reports", label: "Incident Reports", icon: FileWarning },
  { key: "analytics", label: "Analytics & AI", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  active: SectionKey;
  onSelect: (key: SectionKey) => void;
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

export default function Sidebar({ active, onSelect, open, onClose, collapsed = false }: SidebarProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] pt-16 transition-all duration-300 lg:static lg:z-0 lg:translate-x-0 lg:pt-0 ${
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        } ${open ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <button
          onClick={onClose}
          className="focus-ring absolute right-3 top-3 rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] lg:hidden"
          aria-label="Close navigation menu"
        >
          <X size={18} />
        </button>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-2.5 py-4" aria-label="Primary">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => {
                  onSelect(key);
                  onClose();
                }}
                title={collapsed ? label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`focus-ring group relative flex w-full items-center ${
                  collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
                } rounded-lg text-left text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[var(--card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-strong)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[var(--text-primary)]" />
                )}
                <Icon
                  size={18}
                  strokeWidth={2}
                  className={`shrink-0 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
                />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed ? (
          <div className="glass-panel m-3 mt-auto rounded-xl p-4">
            <p className="text-[11.5px] text-[var(--text-muted)] uppercase tracking-wider font-mono">aeroMarine-Ai</p>
            <p className="text-[14px] font-semibold text-[var(--text-primary)] mt-0.5">Command Center</p>
            <div className="mt-3 space-y-2.5">
              <Metric value="Live" label="Fleet & Spill Grid" />
              <Metric value="99.8%" label="Telemetry Link Quality" />
              <Metric value="24/7" label="Global Surveillance" />
            </div>
          </div>
        ) : (
          <div className="mt-auto mb-4 flex flex-col items-center gap-1 text-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
            <span className="text-[8px] font-mono font-semibold text-[var(--text-muted)] uppercase">LIVE</span>
          </div>
        )}
      </aside>
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 border-l-2 border-[var(--border-strong)] pl-2.5">
      <div>
        <p className="text-[14px] font-semibold leading-tight text-[var(--text-primary)] font-mono">{value}</p>
        <p className="text-[10.5px] leading-tight text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
