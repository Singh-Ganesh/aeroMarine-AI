import { Anchor, Globe, MapPin, Navigation, Radio, Route } from "lucide-react";
import type { AerospaceAsset } from "../../types/aerospace";

export default function AssetDetails({
  asset,
  onCenterOnMap,
}: {
  asset: AerospaceAsset;
  onCenterOnMap?: (asset: AerospaceAsset) => void;
}) {
  const hasRealTrack =
    !asset.isSimulatedDemo &&
    asset.positions &&
    asset.positions.length >= 2;

  return (
    <div className="space-y-4 text-[13px] text-[var(--text-primary)]">
      {/* 1. VESSEL DETAILS */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <div className="flex items-center gap-2">
            <Anchor size={16} className="text-[var(--text-primary)]" />
            <h4 className="font-bold text-[12.5px] uppercase tracking-wider text-[var(--text-primary)]">
              Vessel Details
            </h4>
          </div>
          <span className="rounded bg-[var(--card)] border border-[var(--border)] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-[var(--text-primary)]">
            {asset.flag || "International Flag"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">Vessel Name</span>
            <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{asset.name}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">Vessel Type</span>
            <span className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">{asset.vesselType || "Watership"}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">IMO</span>
            <span className="font-mono text-[12.5px] font-bold text-[var(--text-primary)]">{asset.imo || "N/A"}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">MMSI / SSVID</span>
            <span className="font-mono text-[12.5px] font-bold text-[var(--text-primary)]">{asset.mmsi || "N/A"}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">Callsign</span>
            <span className="font-mono text-[12.5px] font-semibold text-[var(--text-primary)]">{asset.callsign || "N/A"}</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] block">Draft</span>
            <span className="font-mono text-[12.5px] font-semibold text-[var(--text-primary)]">{asset.draftMeters ? `${asset.draftMeters} m` : "—"}</span>
          </div>
        </div>
      </section>

      {/* 2. CURRENT POSITION */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] p-3.5 space-y-2">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Globe size={16} className="text-[var(--text-primary)]" />
          <h4 className="font-bold text-[12.5px] uppercase tracking-wider text-[var(--text-primary)]">
            Current Position
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2.5">
            <span className="text-[10.5px] text-[var(--text-muted)] block">Latitude</span>
            <span className="text-[14px] font-bold text-[var(--text-primary)]">
              {Math.abs(asset.latitude).toFixed(4)}° {asset.latitude >= 0 ? "N" : "S"}
            </span>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2.5">
            <span className="text-[10.5px] text-[var(--text-muted)] block">Longitude</span>
            <span className="text-[14px] font-bold text-[var(--text-primary)]">
              {Math.abs(asset.longitude).toFixed(4)}° {asset.longitude >= 0 ? "E" : "W"}
            </span>
          </div>
        </div>
      </section>

      {/* 3. NAVIGATION */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] p-3.5 space-y-2">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Navigation size={16} className="text-[var(--text-primary)]" />
          <h4 className="font-bold text-[12.5px] uppercase tracking-wider text-[var(--text-primary)]">
            Navigation
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
            <span className="text-[10px] text-[var(--text-muted)] block">Speed</span>
            <span className="text-[14px] font-bold text-[var(--text-primary)]">
              {asset.speed} <span className="text-[10px] font-normal">{asset.speedUnit || "kts"}</span>
            </span>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
            <span className="text-[10px] text-[var(--text-muted)] block">Course</span>
            <span className="text-[14px] font-bold text-[var(--text-primary)]">{asset.heading}°</span>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
            <span className="text-[10px] text-[var(--text-muted)] block">Heading</span>
            <span className="text-[14px] font-bold text-[var(--text-primary)]">{asset.heading}° true</span>
          </div>
        </div>

        <div className="pt-2 text-[12px] space-y-1">
          <p className="text-[var(--text-secondary)]">
            Origin: <span className="font-medium text-[var(--text-primary)]">{asset.origin || "—"}</span>
          </p>
          <p className="text-[var(--text-secondary)]">
            Destination: <span className="font-bold text-[var(--text-primary)]">{asset.destination}</span>
          </p>
          {asset.eta && (
            <p className="text-[var(--text-muted)] font-mono text-[11px]">
              ETA: {asset.eta}
            </p>
          )}
        </div>
      </section>

      {/* 4. AIS */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] p-3.5 space-y-2">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[var(--text-primary)]" />
            <h4 className="font-bold text-[12.5px] uppercase tracking-wider text-[var(--text-primary)]">
              AIS Telemetry
            </h4>
          </div>
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active Feed
          </span>
        </div>

        <div className="space-y-1.5 pt-1 text-[12px]">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">AIS Timestamp:</span>
            <span className="font-mono text-[var(--text-primary)] font-medium">{asset.lastUpdate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Data Source:</span>
            <span className="font-mono text-[var(--text-primary)] font-semibold">
              {asset.dataSource || "Global Fishing Watch AIS"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Position Status:</span>
            <span className="font-mono text-[var(--text-primary)]">
              {asset.status === "active" ? "Under Way Using Engine" : asset.status === "warning" ? "Operating Near Advisory Zone" : "Moored / Stationary"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Transponder:</span>
            <span className="font-mono text-[11px] text-[var(--text-secondary)]">{asset.telemetry.transponderCode}</span>
          </div>
        </div>
      </section>

      {/* 5. ROUTE */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <div className="flex items-center gap-2">
            <Route size={16} className="text-[var(--text-primary)]" />
            <h4 className="font-bold text-[12.5px] uppercase tracking-wider text-[var(--text-primary)]">
              Route & Track
            </h4>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {hasRealTrack ? "Recent AIS Track" : "Corridor Status"}
          </span>
        </div>

        <div className="space-y-1.5 pt-1 text-[12px]">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Track Status:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {hasRealTrack ? "Recent AIS Track" : "Tactical Corridor"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Track Start:</span>
            <span className="font-mono text-[var(--text-primary)]">{asset.trackStart || "Origin Departure"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Track End:</span>
            <span className="font-mono text-[var(--text-primary)]">{asset.trackEnd || "Current Position"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Track Point Count:</span>
            <span className="font-mono font-bold text-[var(--text-primary)]">
              {asset.trackPointsCount || (asset.positions ? asset.positions.length : asset.routeCoordinates.length)} points
            </span>
          </div>
        </div>

        {/* Fallback notice if real track is unavailable */}
        {!hasRealTrack && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2.5 text-[11px] text-[var(--text-muted)] leading-relaxed">
            Track unavailable from current data source. Showing verified corridor for spill containment monitoring.
          </div>
        )}
      </section>

      {/* Center on map action */}
      {onCenterOnMap && (
        <button
          onClick={() => onCenterOnMap(asset)}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--card)] py-2.5 text-[13px] text-[var(--text-primary)] font-bold shadow-sm hover:bg-[var(--surface-hover)] transition-colors"
        >
          <MapPin size={16} />
          Center On Map
        </button>
      )}
    </div>
  );
}

