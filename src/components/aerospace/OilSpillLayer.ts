import L from "leaflet";
import type { OilSpillIncident } from "../../types/oilSpill";

export function renderOilSpills(
  layerGroup: L.LayerGroup,
  incidents: OilSpillIncident[],
  selectedSpillId: string | null,
  onSelectSpill: (spill: OilSpillIncident) => void,
  showLayer: boolean = true
) {
  layerGroup.clearLayers();
  if (!showLayer) return;

  incidents.forEach((spill) => {
    const isSelected = spill.id === selectedSpillId;

    let baseClass = "oil-slick-historical";
    if (spill.status === "active") {
      baseClass = "oil-slick-active";
    } else if (spill.status === "monitoring") {
      baseClass = "oil-slick-monitoring";
    }

    const className = isSelected ? `${baseClass} oil-slick-selected` : baseClass;

    // 1. Render Irregular SVG Polygon Slick
    const polygon = L.polygon(spill.polygonCoordinates, {
      className,
      smoothFactor: 1.2,
      noClip: true,
    });

    polygon.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      onSelectSpill(spill);
    });

    // Tooltip on hover
    const statusBadge =
      spill.status === "active"
        ? "🔴 ACTIVE / SPREADING"
        : spill.status === "monitoring"
        ? "🟠 UNDER MONITORING"
        : "⚪ HISTORICAL INCIDENT";

    polygon.bindTooltip(
      `
      <div style="font-family: monospace; font-size: 11px; line-height: 1.35; padding: 2px 4px;">
        <div style="font-weight: bold; color: ${spill.status === "active" ? "#ef4444" : spill.status === "monitoring" ? "#f97316" : "#9ca3af"};">
          ${statusBadge}
        </div>
        <div style="color: #ffffff; font-weight: 600;">${spill.name}</div>
        <div style="color: #94a3b8; font-size: 10px;">Area: ${spill.estimatedAreaKm2} km² · Est: ${spill.estimatedVolumeTonnes}</div>
        <div style="color: #2dd4ee; font-size: 9.5px; margin-top: 2px;">[Click for Full Incident Intel]</div>
      </div>
      `,
      {
        sticky: true,
        className: "spill-tooltip",
        opacity: 0.95,
      }
    );

    polygon.addTo(layerGroup);

    // 2. For Active Spills: Add Center Spreading Indicator Core Dot (Without permanent cluttered text labels)
    if (spill.status === "active") {
      const beaconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; transform: translate(-50%, -50%); cursor: pointer;">
          <!-- Pulsing Ripple Waves -->
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(239, 68, 68, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 18px; height: 18px; border-radius: 9999px; background: rgba(239, 68, 68, 0.6); animation: pulse 1.6s ease-in-out infinite;"></div>
          <!-- Center Core Dot -->
          <div style="position: relative; width: 9px; height: 9px; border-radius: 9999px; background: #ffffff; border: 2px solid #ef4444; box-shadow: 0 0 10px #ef4444; z-index: 2;"></div>
        </div>
      `;

      const beaconIcon = L.divIcon({
        html: beaconHtml,
        className: "oil-spill-beacon",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const beaconMarker = L.marker([spill.latitude, spill.longitude], {
        icon: beaconIcon,
        zIndexOffset: 800,
      });

      beaconMarker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectSpill(spill);
      });

      beaconMarker.addTo(layerGroup);
    }
  });
}
