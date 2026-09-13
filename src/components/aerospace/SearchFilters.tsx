import { useEffect, useRef, useState } from "react";
import {
  Filter,
  Pause,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  AssetStatusFilter,
  AssetTypeFilter,
} from "../../types/aerospace";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: AssetTypeFilter;
  onTypeFilterChange: (type: AssetTypeFilter) => void;
  statusFilter: AssetStatusFilter;
  onStatusFilterChange: (status: AssetStatusFilter) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onResetSimulation: () => void;
  totalFiltered: number;
  matchingAssets?: import("../../types/aerospace").AerospaceAsset[];
  onSelectVessel?: (id: string) => void;
}

const typeOptions: { value: AssetTypeFilter; label: string }[] = [
  { value: "all", label: "All Waterships" },
  { value: "vessel", label: "Waterships" },
];

const statusOptions: { value: AssetStatusFilter; label: string; dotColor?: string }[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active", dotColor: "bg-emerald-400" },
  { value: "warning", label: "Warning", dotColor: "bg-amber-500" },
  { value: "inactive", label: "Inactive", dotColor: "bg-text-muted" },
];

const speedOptions = [1, 2, 5, 10];

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onResetSimulation,
  totalFiltered,
  matchingAssets = [],
  onSelectVessel,
}: SearchFiltersProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="glass-panel space-y-3 rounded-xl p-3.5">
      {/* Top row: Search input + Live simulation banner + Playback controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input with Results Popover */}
        <div ref={containerRef} className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setDropdownOpen(true);
            }}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setDropdownOpen(true);
            }}
            placeholder="Search waterships by name, ID, callsign, or type..."
            className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] py-2 pl-9 pr-9 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange("");
                setDropdownOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          )}

          {/* Interactive Search Results Dropdown */}
          {dropdownOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-[320px] overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--card)] p-1.5 shadow-2xl backdrop-blur-md animate-fade-in">
              {matchingAssets.length === 0 ? (
                <div className="p-4 text-center text-[var(--text-muted)]">
                  <p className="text-[12.5px] font-semibold text-[var(--text-secondary)]">No vessels found</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    No vessel matched "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Matching Vessels ({matchingAssets.length})
                  </div>
                  {matchingAssets.slice(0, 8).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onSelectVessel?.(asset.id);
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[13px] text-[var(--text-primary)] truncate">
                            {asset.name}
                          </span>
                          <span className="rounded bg-[var(--surface-hover)] border border-[var(--border)] px-1.5 py-0.2 font-mono text-[9.5px] text-[var(--text-muted)]">
                            {asset.callsign}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                          {asset.vesselType || "Vessel"} · {asset.imo || `MMSI ${asset.mmsi}`}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          AIS Connected
                        </span>
                        <p className="text-[9.5px] font-mono text-[var(--text-muted)] mt-0.5">
                          {asset.speed} kts
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Simulation Status & Playback Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto">
          {/* Monochrome Live Simulation Badge */}
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-hover)] px-3 py-1 text-[11.5px] font-semibold text-[var(--text-primary)] shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              {isPlaying && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--text-primary)] opacity-75" />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--text-primary)]" />
            </span>
            <span>● LIVE SIMULATION</span>
            <span className="hidden sm:inline text-[10px] font-normal text-[var(--text-muted)]">
              (Simulated Telemetry)
            </span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`focus-ring flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
              isPlaying
                ? "border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-hover)]"
                : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            title={isPlaying ? "Pause Simulation" : "Resume Live Simulation"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause" : "Resume"}</span>
          </button>

          {/* Speed Multiplier Pills */}
          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-0.5 text-[11px] font-mono">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`rounded px-2 py-1 transition-colors ${
                  speed === s
                    ? "bg-[var(--card)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-strong)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
                title={`Simulation Speed ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={onResetSimulation}
            className="focus-ring rounded-lg border border-[var(--border)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
            title="Reset Simulation Positions"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Bottom row: Type Filters & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
        {/* Type filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1">
            <Filter size={12} />
            Domain:
          </span>
          {typeOptions.map((opt) => {
            const active = typeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onTypeFilterChange(opt.value)}
                className={`focus-ring rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  active
                    ? "border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-primary)] font-semibold shadow-sm"
                    : "border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Status filter pills & Count badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1">
            <SlidersHorizontal size={12} />
            Status:
          </span>
          {statusOptions.map((opt) => {
            const active = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onStatusFilterChange(opt.value)}
                className={`focus-ring flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  active
                    ? "border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-primary)] font-semibold shadow-sm"
                    : "border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {opt.dotColor && <span className={`h-1.5 w-1.5 rounded-full ${opt.dotColor}`} />}
                {opt.label}
              </button>
            );
          })}

          <span className="ml-2 rounded border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-0.5 text-[10.5px] font-mono text-[var(--text-muted)]">
            {totalFiltered} visible
          </span>
        </div>
      </div>
    </div>
  );
}
