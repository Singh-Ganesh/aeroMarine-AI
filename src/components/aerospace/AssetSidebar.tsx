import {
  Crosshair,
  Ship,
  X,
} from "lucide-react";
import type { AerospaceAsset } from "../../types/aerospace";
import AssetDetails from "./AssetDetails";

interface AssetSidebarProps {
  asset: AerospaceAsset | null;
  onClose: () => void;
  onCenterOnMap?: (asset: AerospaceAsset) => void;
}

function getTypeIcon() { return <Ship size={18} className="text-[var(--text-primary)]" />; }

export default function AssetSidebar({ asset, onClose, onCenterOnMap }: AssetSidebarProps) {
  if (!asset) {
    return (
      <div className="glass-panel flex h-full flex-col items-center justify-center rounded-xl p-6 text-center text-[var(--text-muted)]">
        <Crosshair size={36} className="text-[var(--text-muted)] opacity-50" />
        <p className="mt-3 text-[14px] font-medium text-[var(--text-primary)]">No Asset Target Selected</p>
        <p className="mt-1 max-w-xs text-[12px] text-[var(--text-secondary)] leading-relaxed">
          Select a watership track on the global map to view live
          tactical intelligence, telemetry, and route data.
        </p>
      </div>
    );
  }

  const { name, callsign, type, status, id, lastUpdate } = asset;

  return (
    <aside className="glass-panel flex h-full flex-col overflow-hidden rounded-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] shadow-sm">
            {getTypeIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-bold text-[var(--text-primary)] tracking-tight">{callsign}</h3>
              <span
                className={`flex h-2.5 w-2.5 rounded-full ${
                  status === "warning"
                    ? "bg-amber-500 animate-ping"
                    : status === "active"
                    ? "bg-emerald-500"
                    : "bg-[var(--text-muted)]"
                }`}
              />
            </div>
            <p className="truncate text-[12px] font-medium text-[var(--text-secondary)]">{name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onCenterOnMap && (
            <button
              onClick={() => onCenterOnMap(asset)}
              title="Lock Camera on Asset"
              className="focus-ring rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Crosshair size={18} />
            </button>
          )}

          <button
            onClick={onClose}
            className="focus-ring rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close intelligence panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Sub-header meta strip */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-hover)] px-4 py-2 text-[10.5px] font-mono text-[var(--text-muted)]">
        <span>ID: {id}</span>
        <span className="capitalize">{type} Target</span>
        <span className="text-[var(--text-primary)]">{lastUpdate}</span>
      </div>

      {/* Scrollable details body */}
      <div className="flex-1 overflow-y-auto p-4">
        <AssetDetails asset={asset} onCenterOnMap={onCenterOnMap} />
      </div>
    </aside>
  );
}
