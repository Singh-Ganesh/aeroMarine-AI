import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  Info,
  ShieldAlert,
} from "lucide-react";
import type { OilSpillTimelineFilter } from "../../types/oilSpill";
import {
  ITOPF_DISCLAIMER,
  itopfAnnualStats,
  oilSpillIncidents,
} from "../../data/oilSpillData";

interface OilSpillTimelineControlProps {
  filter: OilSpillTimelineFilter;
  onChangeFilter: (filter: OilSpillTimelineFilter) => void;
  className?: string;
  onSelectIncident?: (incidentId: string) => void;
}

const HISTORICAL_YEARS = [
  1978, 1989, 1996, 1999, 2002, 2007, 2010, 2018, 2020, 2021, 2022, 2023, 2024, 2025,
];

export default function OilSpillTimelineControl({
  filter,
  onChangeFilter,
  className = "",
  onSelectIncident,
}: OilSpillTimelineControlProps) {
  const [expanded, setExpanded] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const isHistorical = filter.mode === "historical";
  const selectedYear = isHistorical ? filter.year : null;

  // Active spills count
  const activeCount = oilSpillIncidents.filter((s) => s.status === "active").length;
  const monitoringCount = oilSpillIncidents.filter((s) => s.status === "monitoring").length;

  // Current year's ITOPF stat if a specific year is picked
  const currentStat =
    typeof selectedYear === "number" ? itopfAnnualStats[selectedYear] : null;

  // Incidents visible under current filter
  const visibleIncidents = oilSpillIncidents.filter((s) => {
    if (filter.mode === "active") {
      return s.status === "active" || s.status === "monitoring";
    }
    if (filter.year === "all") {
      return s.status === "historical";
    }
    return s.status === "historical" && s.year === filter.year;
  });

  return (
    <div
      className={`glass-panel overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl shadow-2xl transition-all duration-300 z-[500] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Droplets size={15} className="text-red-500 dark:text-red-400" />
          <div>
            <h3 className="text-[12px] font-mono font-bold tracking-wider uppercase text-[var(--text-primary)] flex items-center gap-2">
              OIL SPILL HISTORY & TIMELINE
              {filter.mode === "active" ? (
                <span className="rounded bg-red-500/20 border border-red-500/40 px-1.5 py-0.2 text-[9px] font-bold text-red-500 dark:text-red-400">
                  LIVE SPREADING
                </span>
              ) : (
                <span className="rounded bg-slate-500/20 border border-slate-500/40 px-1.5 py-0.2 text-[9px] font-bold text-slate-500 dark:text-slate-300">
                  {selectedYear === "all" ? "ALL HISTORICAL" : selectedYear}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDisclaimer((d) => !d)}
            title="ITOPF Reporting Context"
            className="focus-ring rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Info size={14} />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Minimize Control" : "Expand Control"}
            className="focus-ring rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ITOPF Reporting Context Callout */}
      {showDisclaimer && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 p-2.5 text-[10px] font-mono text-amber-600 dark:text-amber-300 leading-relaxed">
          <div className="flex items-center gap-1 font-bold uppercase text-amber-500 dark:text-amber-400 mb-1">
            <ShieldAlert size={12} />
            ITOPF Reference Notice
          </div>
          {ITOPF_DISCLAIMER}
        </div>
      )}

      {/* Main Controls Body */}
      {expanded && (
        <div className="p-3 space-y-3 font-mono text-[11px]">
          {/* Mode Switch: Active Spreading vs Historical Archive */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeFilter({ mode: "active" })}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 px-2 transition-all ${
                !isHistorical
                  ? "border-red-500/60 bg-red-500/20 text-red-500 dark:text-red-400 font-bold shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                  : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {!isHistorical && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>ACTIVE SPREADING</span>
              <span className="rounded bg-red-500/30 px-1 py-0.2 text-[9px]">
                {activeCount + monitoringCount}
              </span>
            </button>

            <button
              onClick={() =>
                onChangeFilter({
                  mode: "historical",
                  year: selectedYear || 2024,
                })
              }
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 px-2 transition-all ${
                isHistorical
                  ? "border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-primary)] font-bold shadow-sm"
                  : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Calendar size={13} />
              <span>HISTORICAL SPILLS</span>
            </button>
          </div>

          {/* Historical Year Selector Ribbon */}
          {isHistorical && (
            <div className="space-y-2 pt-1 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1 font-semibold uppercase text-[var(--text-primary)]">
                  <Clock size={11} />
                  SELECT HISTORICAL TIMELINE:
                </span>
                <button
                  onClick={() =>
                    onChangeFilter({ mode: "historical", year: "all" })
                  }
                  className={`px-2 py-0.5 rounded transition-colors text-[9.5px] ${
                    selectedYear === "all"
                      ? "bg-[var(--text-primary)] text-[var(--background)] font-bold shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  All Incidents
                </button>
              </div>

              {/* Year Pills Grid */}
              <div className="flex flex-wrap gap-1">
                {HISTORICAL_YEARS.map((yr) => {
                  const isYrSelected = selectedYear === yr;
                  const stat = itopfAnnualStats[yr];
                  const incidentCount = oilSpillIncidents.filter((s) => s.status === "historical" && s.year === yr).length;
                  return (
                    <button
                      key={yr}
                      onClick={() =>
                        onChangeFilter({ mode: "historical", year: yr })
                      }
                      title={stat ? `${yr}: ${stat.tankerSpillsGte7T} tanker spills (≥7t)` : `${yr}: ${incidentCount} historical incident(s)`}
                      className={`flex-1 min-w-[54px] rounded px-1.5 py-1 text-center transition-all ${
                        isYrSelected
                          ? "border border-[var(--border-strong)] bg-[var(--card)] font-bold text-[var(--text-primary)] shadow-sm"
                          : "border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <div className="text-[11px] leading-none">{yr}</div>
                      <div className="text-[8px] opacity-75 mt-0.5">
                        {stat ? `${stat.tankerSpillsGte7T} spills` : `${incidentCount} event`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Annual ITOPF Statistics Summary Card */}
              {currentStat && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-[10.5px] space-y-1">
                  <div className="flex items-center justify-between text-[var(--text-primary)] font-bold border-b border-[var(--border)] pb-1">
                    <span>
                      ITOPF {currentStat.year} ANNUAL SUMMARY
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px]">
                      Spills ≥7t:{" "}
                      <span className="text-[var(--text-primary)]">
                        {currentStat.tankerSpillsGte7T}
                      </span>
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    Reported Volume:{" "}
                    <span className="font-semibold text-amber-500 dark:text-amber-400">
                      {currentStat.approxVolumeTonnes || "Verified Records"}
                    </span>
                  </div>
                  <div className="text-[9.5px] text-[var(--text-muted)] italic leading-tight">
                    {currentStat.keyNote}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick-list of Filtered Incidents */}
          <div className="space-y-1 pt-1 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)] uppercase">
              <span>
                {isHistorical ? "ARCHIVED INCIDENTS" : "ACTIVE SPREADING ZONES"} (
                {visibleIncidents.length})
              </span>
              <span className="text-[9px] text-[var(--text-muted)]">[CLICK TO INSPECT]</span>
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {visibleIncidents.map((spill) => (
                <button
                  key={spill.id}
                  onClick={() => onSelectIncident?.(spill.id)}
                  className="flex w-full items-center justify-between rounded border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-1 text-left text-[10.5px] hover:border-[var(--border-strong)] transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        spill.status === "active"
                          ? "bg-red-500"
                          : spill.status === "monitoring"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    <span className="font-medium text-[var(--text-primary)] truncate">
                      {spill.name}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-[var(--text-muted)] font-mono shrink-0 ml-2">
                    {spill.estimatedAreaKm2} km²
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
