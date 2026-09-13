import {
  AlertTriangle,
  Radio,
  Ship,
} from "lucide-react";
import type { AerospaceAsset } from "../../types/aerospace";

interface AssetListProps {
  assets: AerospaceAsset[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
}

function getTypeIcon() { return <Ship size={15} className="text-[var(--text-primary)]" />; }

export default function AssetList({
  assets,
  selectedAssetId,
  onSelectAsset,
}: AssetListProps) {
  if (assets.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center text-text-muted">
        <Ship size={28} className="mx-auto mb-2 text-[var(--text-muted)] animate-pulse" />
        <p className="text-[13px] font-medium text-text-primary">No waterships match your search/filter criteria</p>
        <p className="text-[11.5px] text-text-secondary mt-1">Try broadening your domain or status filters</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-[var(--text-primary)]" />
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Live Watership Directory</h3>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          Showing {assets.length} tracked entities
        </span>
      </div>

      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-hover)] text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)] backdrop-blur-md">
            <tr>
              <th className="px-3 py-2.5">Asset / Callsign</th>
              <th className="px-3 py-2.5">Domain / Type</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Altitude / Draft</th>
              <th className="px-3 py-2.5">Speed</th>
              <th className="px-3 py-2.5">Heading</th>
              <th className="px-3 py-2.5">Destination / Task</th>
              <th className="px-3 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {assets.map((asset) => {
              const isSelected = asset.id === selectedAssetId;

              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[var(--card)] text-[var(--text-primary)] shadow-[inset_3px_0_0_0_var(--text-primary)]"
                      : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)]">
                        {getTypeIcon()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[var(--text-primary)]">{asset.callsign}</span>
                          {asset.status === "warning" && (
                            <AlertTriangle size={12} className="text-amber-500" />
                          )}
                        </div>
                        <p className="truncate text-[10.5px] text-[var(--text-muted)]">{asset.name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 font-medium text-[11.5px]">
                    <span className="rounded bg-[var(--surface-hover)] border border-[var(--border)] px-2 py-0.5 text-[11px] font-mono text-[var(--text-primary)]">
                      {asset.vesselType || "Watership"}
                    </span>
                  </td>

                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        asset.status === "active"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                          : asset.status === "warning"
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400 animate-pulse"
                          : "border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          asset.status === "active"
                            ? "bg-emerald-500"
                            : asset.status === "warning"
                            ? "bg-amber-500"
                            : "bg-[var(--text-muted)]"
                        }`}
                      />
                      {asset.status}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-[var(--text-primary)]">
                    {`${asset.draftMeters || 11.5}m draft`}
                  </td>

                  <td className="px-3 py-2.5 font-mono text-[11.5px]">
                    {asset.speed} <span className="text-[10px] text-[var(--text-muted)]">{asset.speedUnit}</span>
                  </td>

                  <td className="px-3 py-2.5 font-mono text-[11.5px]">
                    {asset.heading}°
                  </td>

                  <td className="px-3 py-2.5 max-w-xs truncate text-[11.5px]">
                    {asset.destination}
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(asset.id);
                      }}
                      className="focus-ring rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
