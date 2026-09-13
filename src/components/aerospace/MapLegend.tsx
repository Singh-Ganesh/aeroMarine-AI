import { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

interface MapLegendProps {
  className?: string;
}

export default function MapLegend({ className = "" }: MapLegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`glass-panel overflow-hidden rounded-xl border border-white/10 bg-navy-950/90 backdrop-blur-xl shadow-xl transition-all duration-200 z-[500] ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[11px] font-mono font-bold tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title={collapsed ? "Expand Map Legend" : "Minimize Map Legend"}
      >
        <span className="flex items-center gap-1.5 uppercase">
          <Layers size={12} className="text-[var(--text-primary)]" />
          MAP LEGEND
        </span>
        {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </button>

      {/* Legend Items */}
      {!collapsed && (
        <div className="border-t border-[var(--border)] p-2.5 space-y-1.5 font-mono text-[10.5px]">
          {/* Active Oil Spill - RED kept */}
          <div className="flex items-center gap-2">
            <span className="text-[11px]">🔴</span>
            <span className="font-semibold text-red-500 dark:text-red-400">ACTIVE OIL SPILL</span>
          </div>

          {/* Monitoring Oil Spill - ORANGE kept */}
          <div className="flex items-center gap-2">
            <span className="text-[11px]">🟠</span>
            <span className="font-medium text-amber-500 dark:text-amber-400">MONITORING</span>
          </div>

          {/* Historical Spill - GREY kept */}
          <div className="flex items-center gap-2">
            <span className="text-[11px]">⚫</span>
            <span className="font-medium text-slate-500 dark:text-slate-300">HISTORICAL SPILL</span>
          </div>

          <div className="h-px bg-[var(--border)] my-1" />

          {/* Watership - Monochrome icon & label */}
          <div className="flex items-center gap-2">
            <span className="text-[11px]">⚪</span>
            <span className="font-medium text-[var(--text-primary)]">WATERSHIP</span>
          </div>

        </div>
      )}
    </div>
  );
}
