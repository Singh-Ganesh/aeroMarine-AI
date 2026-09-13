import L from "leaflet";
import type { MaritimeAsset, AssetStatus } from "../../types/maritime";

const colors: Record<AssetStatus, string> = { active: "#ffffff", warning: "#f8fafc", inactive: "#94a3b8" };

export function createMaritimeDivIcon(asset: MaritimeAsset, isSelected: boolean, _currentZoom?: number): L.DivIcon {
  const size = isSelected ? 38 : 28;
  const color = colors[asset.status] || "#f8fafc";
  const strokeColor = "#0f172a";
  // ONLY show label if the ship is explicitly selected by the user
  const showLabel = isSelected;
  return L.divIcon({
    className: "aerospace-marker-div",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="aerospace-marker-wrapper relative flex flex-col items-center" style="width:${size}px;height:${size}px"><div style="width:${size}px;height:${size}px;transform:rotate(${asset.heading}deg)"><svg width="${size}" height="${size}" viewBox="0 0 28 32" fill="${color}" stroke="${strokeColor}" stroke-width="1.8" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.5))"><path d="M14 2 C16.5 4.5 19 9 19 22 C19 26 16.8 28.5 14 29 C11.2 28.5 9 26 9 22 C9 9 11.5 4.5 14 2 Z"/><rect x="11.5" y="15" width="5" height="6" rx="1" fill="#0f172a"/></svg></div>${showLabel ? `<div class="absolute top-full mt-1.5 whitespace-nowrap rounded bg-[var(--map-ui-bg)] border border-[var(--border-strong)] px-1.5 py-0.5 text-[9.5px] font-mono text-[var(--text-primary)] shadow-md"><span class="font-semibold">${asset.name}</span><span class="text-[var(--text-muted)] ml-1">[${asset.speed} kts · ${asset.heading}°]</span></div>` : ""}</div>`
  });
}
