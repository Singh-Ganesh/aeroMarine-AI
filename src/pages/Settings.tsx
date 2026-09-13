import { useState } from "react";
import PageHeader from "../components/common/PageHeader";

interface ToggleSetting {
  key: string;
  label: string;
  desc: string;
  default: boolean;
}

const toggles: ToggleSetting[] = [
  { key: "critical-alerts", label: "Critical alert notifications", desc: "Push alerts for high-risk detections", default: true },
  { key: "email-digest", label: "Daily email digest", desc: "Summary of incidents every 24 hours", default: true },
  { key: "auto-refresh", label: "Auto-refresh live map", desc: "Refresh vessel positions every 30 seconds", default: true },
  { key: "sound", label: "Sound on new incident", desc: "Play a chime when a new incident is detected", default: false },
];

export default function Settings() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map((t) => [t.key, t.default]))
  );

  return (
    <div className="animate-fade-in space-y-4 px-4 pb-6 pt-4 md:px-6">
      <PageHeader title="Settings" subtitle="Preferences for this workspace" />

      <div className="glass-panel divide-y divide-border rounded-xl">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div>
              <p className="text-[13px] font-medium text-text-primary">{t.label}</p>
              <p className="text-[11.5px] text-text-secondary">{t.desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={state[t.key]}
              onClick={() => setState((s) => ({ ...s, [t.key]: !s[t.key] }))}
              className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors border border-border ${
                state[t.key] ? "bg-text-primary" : "bg-surface-hover"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4.5 w-4.5 rounded-full shadow transition-transform ${
                  state[t.key] ? "translate-x-5 bg-background" : "translate-x-0.5 bg-text-secondary"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-xl p-4">
        <h2 className="mb-3 text-[13px] font-semibold text-text-primary">Account</h2>
        <div className="grid grid-cols-1 gap-3 text-[12.5px] sm:grid-cols-2">
          <div>
            <p className="text-text-muted">Name</p>
            <p className="text-text-primary">Ganesh Singh</p>
          </div>
          <div>
            <p className="text-text-muted">Role</p>
            <p className="text-text-primary">Operations Analyst</p>
          </div>
        </div>
      </div>
    </div>
  );
}
