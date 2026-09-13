import { Cloud, Cpu, Flame, Ship, TrendingUp, Waves } from "lucide-react";
import type { KpiDatum } from "../../types";

const icons: Record<string, typeof Ship> = {
  ship: Ship,
  flame: Flame,
  waves: Waves,
  cpu: Cpu,
  "cloud-sun": Cloud,
};

const accentClasses: Record<KpiDatum["accent"], { icon: string; ring: string; glow: string }> = {
  cyan: {
    icon: "text-text-primary",
    ring: "bg-surface-hover border border-border",
    glow: "shadow-sm",
  },
  magenta: {
    icon: "text-text-primary",
    ring: "bg-surface-hover border border-border",
    glow: "shadow-sm",
  },
  purple: {
    icon: "text-text-primary",
    ring: "bg-surface-hover border border-border",
    glow: "shadow-sm",
  },
  amber: {
    icon: "text-text-primary",
    ring: "bg-surface-hover border border-border",
    glow: "shadow-sm",
  },
  green: {
    icon: "text-text-primary",
    ring: "bg-surface-hover border border-border",
    glow: "shadow-sm",
  },
};

export default function KpiCard({ data }: { data: KpiDatum }) {
  const Icon = icons[data.icon] ?? Ship;
  const accent = accentClasses[data.accent] || accentClasses.cyan;

  return (
    <div className="glass-panel animate-fade-in group flex items-center gap-3.5 rounded-xl p-4 transition-transform hover:-translate-y-0.5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent.ring} ${accent.glow}`}>
        <Icon size={20} className={accent.icon} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11.5px] text-text-secondary">{data.label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-[19px] font-semibold leading-tight text-text-primary">{data.value}</p>
          {data.delta && (
            <span
              className={`flex items-center gap-0.5 text-[11px] font-medium ${
                data.deltaDirection === "up"
                  ? "text-text-primary"
                  : data.deltaDirection === "down"
                  ? "text-text-muted"
                  : "text-text-muted"
              }`}
            >
              {data.deltaDirection === "up" && <TrendingUp size={11} />}
              {data.delta}
            </span>
          )}
        </div>
        {data.sub && <p className="text-[11px] text-text-secondary">{data.sub}</p>}
      </div>
    </div>
  );
}
