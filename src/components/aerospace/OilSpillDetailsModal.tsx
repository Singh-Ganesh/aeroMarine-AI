import { useMemo } from "react";
import {
  Droplets,
  Maximize2,
  Ship,
  X,
} from "lucide-react";
import type { OilSpillIncident } from "../../types/oilSpill";
import type { AerospaceAsset } from "../../types/aerospace";
import { calculateDistanceAndBearing } from "../map/geo";

interface OilSpillDetailsModalProps {
  spill: OilSpillIncident | null;
  assets: AerospaceAsset[];
  onClose: () => void;
  onCenterOnMap?: (lat: number, lng: number) => void;
  onGenerateReport?: (spill: OilSpillIncident) => void;
}

export default function OilSpillDetailsModal({
  spill,
  assets,
  onClose,
  onCenterOnMap,
  onGenerateReport,
}: OilSpillDetailsModalProps) {
  // Compute nearby waterships sorted by spherical distance
  const nearbyWaterships = useMemo(() => {
    if (!spill) return [];

    const ships = assets.filter((a) => a.type === "vessel");

    return ships
      .map((ship) => {
        const { distanceNM, distanceKM, bearing } = calculateDistanceAndBearing(
          { lat: spill.latitude, lng: spill.longitude },
          { lat: ship.latitude, lng: ship.longitude }
        );
        return {
          ship,
          distanceNM,
          distanceKM,
          bearing,
        };
      })
      .sort((a, b) => a.distanceNM - b.distanceNM)
      .slice(0, 4);
  }, [spill, assets]);

  if (!spill) return null;

  const latFormatted = `${Math.abs(spill.latitude).toFixed(3)}° ${
    spill.latitude >= 0 ? "N" : "S"
  }`;
  const lngFormatted = `${Math.abs(spill.longitude).toFixed(3)}° ${
    spill.longitude >= 0 ? "E" : "W"
  }`;

  const statusText =
    spill.status === "active"
      ? "ACTIVE / SPREADING"
      : spill.status === "monitoring"
      ? "RECENT / UNDER MONITORING"
      : "HISTORICAL / PAST INCIDENT";

  const statusColor =
    spill.status === "active"
      ? "text-red-400 bg-red-500/15 border-red-500/40"
      : spill.status === "monitoring"
      ? "text-amber-400 bg-amber-500/15 border-amber-500/40"
      : "text-slate-400 bg-slate-500/15 border-slate-500/40";

  const severityColor =
    spill.severity === "critical"
      ? "text-red-400 bg-red-500/15 border-red-500/40"
      : spill.severity === "high"
      ? "text-red-400 bg-red-500/15 border-red-500/40"
      : spill.severity === "medium"
      ? "text-amber-400 bg-amber-500/15 border-amber-500/40"
      : "text-text-primary bg-surface-hover border-border";

  return (
    <div className="absolute top-14 right-3 z-[600] w-96 max-w-[calc(100vw-24px)] animate-fade-in overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-hover/60 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
            spill.status === "historical"
              ? "border-border bg-surface text-text-secondary shadow-sm"
              : "border-red-500/50 bg-red-500/10 text-red-400 shadow-sm"
          }`}>
            <Droplets size={14} className={spill.status === "active" ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className={`font-mono text-[12px] font-bold tracking-wider uppercase ${
              spill.status === "historical" ? "text-text-secondary" : "text-red-400"
            }`}>
              {spill.status === "historical" ? "HISTORICAL OIL SPILL" : "OIL SPILL DETECTED"}
            </h3>
            <p className="font-mono text-[9.5px] text-text-muted">
              SPILL #{spill.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onCenterOnMap && (
            <button
              onClick={() => onCenterOnMap(spill.latitude, spill.longitude)}
              title="Center on Map"
              className="focus-ring rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <Maximize2 size={13} />
            </button>
          )}
          <button
            onClick={onClose}
            className="focus-ring rounded p-1 text-text-muted hover:bg-surface-hover hover:text-red-400 transition-colors"
            title="Close Panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Historical Incident Notice Banner */}
      {spill.status === "historical" && (
        <div className="flex items-center justify-center gap-1.5 border-b border-border bg-surface-hover/50 px-3 py-1 font-mono text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
          HISTORICAL VERIFIED INCIDENT — {spill.year}
        </div>
      )}

      {/* Simulated Banner for Active Demo */}
      {spill.isSimulatedDemo && (
        <div className="flex items-center justify-center gap-1.5 border-b border-red-500/20 bg-red-500/10 px-3 py-1 font-mono text-[9.5px] font-bold text-red-400 uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
          DEMO ACTIVE SPILL — SIMULATED
        </div>
      )}

      {/* Body Content */}
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-3 space-y-2.5 font-mono text-[11px]">
        {/* Status & Severity Badges */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg border p-2 ${statusColor}`}>
            <span className="text-[9px] uppercase tracking-wider text-text-muted block">
              STATUS
            </span>
            <span className="font-bold text-[11px] block mt-0.5">
              {statusText}
            </span>
          </div>
          <div className={`rounded-lg border p-2 ${severityColor}`}>
            <span className="text-[9px] uppercase tracking-wider text-text-muted block">
              SEVERITY
            </span>
            <span className="font-bold text-[11px] block mt-0.5 uppercase">
              {spill.severity} RISK
            </span>
          </div>
        </div>

        {/* Primary Telemetry Grid */}
        <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">INCIDENT NAME:</span>
            <span className="font-bold text-text-primary">{spill.name}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">LOCATION:</span>
            <span className="font-semibold text-text-primary">{spill.locationName}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">LATITUDE:</span>
            <span className="font-bold text-text-primary">{latFormatted}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">LONGITUDE:</span>
            <span className="font-bold text-text-primary">{lngFormatted}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">DETECTION DATE:</span>
            <span className="font-medium text-text-primary">{spill.date}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">DETECTION TIME:</span>
            <span className="font-medium text-text-primary">{spill.time}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">AFFECTED AREA:</span>
            <span className="font-bold text-text-primary">{spill.estimatedAreaKm2} km²</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">AI CONFIDENCE:</span>
            <span className="font-bold text-emerald-400">{spill.confidence ?? 98.4}%</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">DETECTION SOURCE:</span>
            <span className="font-medium text-text-primary">{spill.detectionSource ?? "Sentinel-1 SAR Radar"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">LAST UPDATED:</span>
            <span className="font-medium text-text-primary">{spill.lastUpdated ?? "Live Sentinel Sweep"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted text-[10.5px]">ESTIMATED VOLUME:</span>
            <span className="font-bold text-red-400">{spill.estimatedVolumeTonnes}</span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-text-muted text-[10.5px]">OIL TYPE:</span>
            <span className="font-semibold text-text-primary">{spill.oilType}</span>
          </div>
        </div>

        {/* Location / Vessel details */}
        <div className="rounded-lg border border-border bg-surface-hover/30 p-2 text-[10.5px] leading-relaxed">
          <div className="text-text-muted text-[9.5px] uppercase font-bold">
            SECTOR / SOURCE
          </div>
          <div className="text-text-primary font-medium mt-0.5">
            {spill.locationName}
          </div>
          {spill.vesselInvolved && (
            <div className="text-text-secondary text-[10px] mt-0.5">
              Source: <span className="text-text-primary font-medium">{spill.vesselInvolved}</span>
            </div>
          )}
          <p className="mt-1 text-[10px] text-text-muted leading-normal">
            {spill.description}
          </p>
        </div>

        {/* Nearby Waterships Section */}
        <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-text-primary uppercase">
              <Ship size={13} />
              NEARBY WATERSHIPS ({nearbyWaterships.length})
            </span>
            <span className="text-[9px] text-text-muted">PROXIMITY VIEW</span>
          </div>

          {nearbyWaterships.length === 0 ? (
            <p className="text-[10px] text-text-muted italic py-1 text-center">
              No active waterships detected in current tactical quadrant.
            </p>
          ) : (
            <div className="space-y-1.5 pt-0.5">
              {nearbyWaterships.map(({ ship, distanceNM, distanceKM, bearing }) => {
                const isClose = distanceNM <= 80;
                return (
                  <div
                    key={ship.id}
                    className="flex items-center justify-between rounded border border-border bg-surface p-1.5 hover:border-text-muted transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isClose ? "bg-red-400 animate-pulse" : "bg-text-secondary"
                        }`}
                      />
                      <div>
                        <div className="font-bold text-text-primary text-[10.5px]">
                          {ship.name}
                        </div>
                        <div className="text-[9.5px] text-text-muted">
                          {ship.vesselType || "Cargo"} · {ship.callsign}
                        </div>
                      </div>
                    </div>

                    <div className="text-right leading-tight">
                      <div
                        className={`font-bold ${
                          isClose ? "text-red-400" : "text-text-primary"
                        }`}
                      >
                        {distanceNM} NM
                      </div>
                      <div className="text-[9px] text-text-muted">
                        {bearing}°T · {distanceKM} km
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tactical Actions (Requirement 7: Map <-> Incident <-> Report) */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          {onGenerateReport && (
            <button
              onClick={() => onGenerateReport(spill)}
              className="focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-text-primary text-background px-3 py-1.5 text-[11px] font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>📄 Generate Report</span>
            </button>
          )}

          {onCenterOnMap && (
            <button
              onClick={() => onCenterOnMap(spill.latitude, spill.longitude)}
              className="focus-ring flex items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-text-primary hover:bg-surface-hover transition-colors"
              title="Center on Map"
            >
              <Maximize2 size={12} />
              <span>Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
