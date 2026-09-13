import { AlertTriangle, CheckCircle2, Radio } from "lucide-react";
import { notifications } from "../../data/notifications";
import type { NotificationSeverity } from "../../types";

const iconFor: Record<NotificationSeverity, { icon: typeof AlertTriangle; color: string }> = {
  critical: { icon: AlertTriangle, color: "text-red-400" },
  warning: { icon: AlertTriangle, color: "text-amber-400" },
  info: { icon: Radio, color: "text-text-primary" },
  success: { icon: CheckCircle2, color: "text-text-secondary" },
};

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="animate-fade-in glass-panel absolute right-0 top-11 z-50 w-80 rounded-xl p-2 border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between px-2.5 py-2 border-b border-border mb-1">
          <p className="text-[13px] font-semibold text-text-primary">Notifications</p>
          <span className="text-[11px] font-medium text-text-secondary">{notifications.filter((n) => !n.read).length} new</span>
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {notifications.map((n) => {
            const { icon: Icon, color } = iconFor[n.severity];
            return (
              <button
                key={n.id}
                className="focus-ring flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left hover:bg-surface-hover transition-colors"
              >
                <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-text-primary">{n.title}</span>
                  <span className="block truncate text-[11.5px] text-text-secondary">{n.detail}</span>
                  <span className="block text-[10.5px] text-text-muted">{n.time}</span>
                </span>
                {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
