import L from "leaflet";
import type { AerospaceAsset } from "../../types/aerospace";

const VESSEL_COLOR = "#94a3b8";
const VESSEL_COLOR_SELECTED = "#f8fafc";


export function renderAssetRoutes(
  layerGroup: L.LayerGroup,
  assets: AerospaceAsset[],
  selectedAssetId: string | null,
  showAllRoutes: boolean = true
) {
  layerGroup.clearLayers();

  assets.forEach((asset) => {
    const isSelected = asset.id === selectedAssetId;

    // If showAllRoutes is false, only render the route for the selected asset
    if (!showAllRoutes && !isSelected) return;

    const baseColor = isSelected ? VESSEL_COLOR_SELECTED : VESSEL_COLOR;

    // 1. If real AIS position history exists, render the actual chronological track
    if (asset.positions && asset.positions.length >= 2) {
      // Filter out invalid coords, sort by timestamp ascending, deduplicate
      const sortedPositions = [...asset.positions]
        .filter((p) => typeof p.lat === "number" && typeof p.lng === "number" && !isNaN(p.lat) && !isNaN(p.lng))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Deduplicate consecutive identical points
      const uniquePoints: [number, number][] = [];
      for (const p of sortedPositions) {
        if (
          uniquePoints.length === 0 ||
          Math.abs(uniquePoints[uniquePoints.length - 1][0] - p.lat) > 0.0001 ||
          Math.abs(uniquePoints[uniquePoints.length - 1][1] - p.lng) > 0.0001
        ) {
          uniquePoints.push([p.lat, p.lng]);
        }
      }

      if (uniquePoints.length >= 2) {
        L.polyline(uniquePoints, {
          color: baseColor,
          weight: isSelected ? 3.5 : 2,
          opacity: isSelected ? 0.95 : 0.65,
          className: isSelected ? "aerospace-route-selected" : "aerospace-route-completed",
        }).addTo(layerGroup);
      }
      return;
    }

    // 2. Tactical corridor waypoints fallback
    const coords = asset.routeCoordinates;
    if (!coords || coords.length < 2) return;

    const currIdx = asset.currentWaypointIndex;

    // Completed coordinates: 0..currIdx plus current interpolated position
    const completedLatLngs: [number, number][] = coords
      .slice(0, currIdx + 1)
      .map((c) => [c.lat, c.lng]);
    completedLatLngs.push([asset.latitude, asset.longitude]);

    // Future coordinates: current interpolated position plus remaining waypoints
    const futureLatLngs: [number, number][] = [
      [asset.latitude, asset.longitude],
      ...coords.slice(currIdx + 1).map((c) => [c.lat, c.lng] as [number, number]),
    ];

    // Solid line for completed path
    if (completedLatLngs.length >= 2) {
      L.polyline(completedLatLngs, {
        color: baseColor,
        weight: isSelected ? 3.5 : 2,
        opacity: isSelected ? 0.95 : 0.6,
        className: isSelected ? "aerospace-route-selected" : "aerospace-route-completed",
      }).addTo(layerGroup);
    }

    // Dashed line for future route
    if (futureLatLngs.length >= 2) {
      L.polyline(futureLatLngs, {
        color: baseColor,
        weight: isSelected ? 2.5 : 1.5,
        opacity: isSelected ? 0.8 : 0.4,
        dashArray: isSelected ? "8, 6" : "5, 7",
        className: "aerospace-route-future",
      }).addTo(layerGroup);
    }

    // If selected, add waypoint markers and destination marker
    if (isSelected) {
      coords.forEach((wp, i) => {
        const isPast = i <= currIdx;
        const isDestination = i === coords.length - 1;

        if (isDestination) {
          // Destination icon / beacon
          L.circleMarker([wp.lat, wp.lng], {
            radius: 6,
            color: "#ffffff",
            fillColor: "#0f172a",
            fillOpacity: 0.9,
            weight: 2,
          })
            .bindTooltip(`Destination: ${wp.label || asset.destination}`, {
              direction: "top",
              className: "vessel-tooltip",
              offset: [0, -8],
            })
            .addTo(layerGroup);
        } else {
          // Intermediate waypoint
          L.circleMarker([wp.lat, wp.lng], {
            radius: isPast ? 3 : 3.5,
            color: isPast ? baseColor : "#7f93b0",
            fillColor: isPast ? baseColor : "#060e1f",
            fillOpacity: isPast ? 0.9 : 0.6,
            weight: 1.2,
          })
            .bindTooltip(`WP ${i + 1}: ${wp.label || `Waypoint ${i + 1}`}`, {
              direction: "right",
              className: "vessel-tooltip",
              offset: [6, 0],
            })
            .addTo(layerGroup);
        }
      });
    }
  });
}
