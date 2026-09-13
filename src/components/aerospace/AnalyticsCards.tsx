import {
  AlertOctagon,
  Droplets,
  Flame,
} from "lucide-react";
import type { AssetTypeFilter } from "../../types/aerospace";

export interface MaritimeCommandKpiProps {
  activeSpillsCount: number;
  totalAffectedAreaKm2: string | number;
  aiDetectionConfidence?: string;
  criticalAlertsCount: number;
  selectedFilter?: AssetTypeFilter;
  onSelectFilter?: (filter: AssetTypeFilter) => void;
}

export default function AnalyticsCards({
  activeSpillsCount,
  totalAffectedAreaKm2,
  criticalAlertsCount,
}: MaritimeCommandKpiProps) {
  const cards = [
    {
      id: "active-spills",
      label: "ACTIVE OIL SPILLS",
      value: `${activeSpillsCount} Detected`,
      sub: "Active spreading slicks",
      icon: Flame,
      accent: "red",
      glow: "shadow-[0_0_16px_-6px_rgba(239,68,68,0.6)]",
      ring: "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/40",
    },
    {
      id: "affected-area",
      label: "TOTAL AFFECTED AREA",
      value: `${totalAffectedAreaKm2} km²`,
      sub: "Active surface slick",
      icon: Droplets,
      accent: "mono",
      glow: "shadow-sm",
      ring: "bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-strong)]",
    },
    {
      id: "critical-alerts",
      label: "CRITICAL ALERTS",
      value: `${criticalAlertsCount} Critical`,
      sub: criticalAlertsCount > 0 ? "High/Critical severity" : "All Nominal",
      icon: AlertOctagon,
      accent: "amber",
      glow: criticalAlertsCount > 0 ? "shadow-[0_0_16px_-6px_rgba(249,115,22,0.6)]" : "shadow-sm",
      ring:
        criticalAlertsCount > 0
          ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/40 animate-pulse"
          : "bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="glass-panel animate-fade-in group flex items-center gap-3.5 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.ring} ${c.glow}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10.5px] font-semibold tracking-wider text-text-muted uppercase">
                {c.label}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <p className="text-[18px] font-bold leading-tight text-text-primary font-mono">{c.value}</p>
              </div>
              <p className="truncate text-[10px] text-text-secondary mt-0.5">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
