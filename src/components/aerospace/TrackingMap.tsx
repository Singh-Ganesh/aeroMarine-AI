import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  Clock,
  Crosshair,
  Droplets,
  Layers,
  Radio,
  RotateCcw,
} from "lucide-react";
import type { MaritimeAsset } from "../../types/maritime";
import type { OilSpillTimelineFilter } from "../../types/oilSpill";
import { oilSpillIncidents } from "../../data/oilSpillData";
import { createMaritimeDivIcon } from "./AssetMarker";
import { renderAssetRoutes } from "./RouteLayer";
import { renderOilSpills } from "./OilSpillLayer";
import OilSpillTimelineControl from "./OilSpillTimelineControl";
import OilSpillDetailsModal from "./OilSpillDetailsModal";
import OilSpillReportModal from "../ai/OilSpillReportModal";
import { buildOilSpillReportData, type OilSpillReportData } from "../ai/OilSpillPdfGenerator";
import MapLegend from "./MapLegend";

export type MapStyle = "dark" | "imagery" | "hybrid";

interface TrackingMapProps {
  assets: MaritimeAsset[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string | null) => void;
  onSelectSpill?: (spillId: string | null) => void;
  className?: string;
}

const GLOBAL_CENTER: [number, number] = [20, 10];
const GLOBAL_DEFAULT_ZOOM = 2.4;

export default function TrackingMap({
  assets,
  selectedAssetId,
  onSelectAsset,
  onSelectSpill,
  className = "h-[560px] w-full",
}: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showOilSpills, setShowOilSpills] = useState<boolean>(true);
  const [showSpillTimeline, setShowSpillTimeline] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [spillTimelineFilter, setSpillTimelineFilter] = useState<OilSpillTimelineFilter>({
    mode: "active",
  });
  const [selectedSpillId, setSelectedSpillId] = useState<string | null>(null);
  const [reportModalData, setReportModalData] = useState<OilSpillReportData | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(GLOBAL_DEFAULT_ZOOM);

  const layersRef = useRef<{
    dark: L.TileLayer;
    imagery: L.TileLayer;
    labels: L.TileLayer;
    markers: L.LayerGroup;
    routes: L.LayerGroup;
    oilSpills: L.LayerGroup;
  } | null>(null);

  const onSelectAssetRef = useRef(onSelectAsset);
  useEffect(() => {
    onSelectAssetRef.current = onSelectAsset;
  }, [onSelectAsset]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: GLOBAL_CENTER,
      zoom: GLOBAL_DEFAULT_ZOOM,
      minZoom: 1.8,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });
    mapRef.current = map;

    // Dark command center tiles
    const dark = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Command Map",
        maxZoom: 16,
      }
    );

    const imagery = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri, Maxar",
        maxZoom: 19,
      }
    );

    // Reference labels & borders
    const labels = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, pane: "overlayPane" }
    );

    dark.addTo(map);

    const routes = L.layerGroup().addTo(map);
    const markers = L.layerGroup().addTo(map);
    const oilSpills = L.layerGroup().addTo(map);

    layersRef.current = { dark, imagery, labels, markers, routes, oilSpills };

    // Scale control
    L.control.scale({ metric: true, imperial: true, position: "bottomright" }).addTo(map);

    // Map events
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000,
      });
    });

    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  // Handle Tile Style Switching
  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    [layers.dark, layers.imagery, layers.labels].forEach((l) => map.removeLayer(l));

    if (mapStyle === "dark") {
      layers.dark.addTo(map);
    } else if (mapStyle === "imagery") {
      layers.imagery.addTo(map);
    } else {
      layers.imagery.addTo(map);
      layers.labels.addTo(map);
    }
  }, [mapStyle]);

  // Render Routes
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    renderAssetRoutes(layers.routes, assets, selectedAssetId, showRoutes);
  }, [assets, selectedAssetId, showRoutes]);

  const onSelectSpillRef = useRef(onSelectSpill);
  useEffect(() => {
    onSelectSpillRef.current = onSelectSpill;
  }, [onSelectSpill]);

  // Handle map background click to clear any selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // If clicking directly on map canvas/tiles
      const target = e.originalEvent?.target as HTMLElement | null;
      if (target && (target.classList.contains("leaflet-tile") || target.classList.contains("leaflet-container"))) {
        setSelectedSpillId(null);
        onSelectAssetRef.current(null);
        onSelectSpillRef.current?.(null);
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, []);

  // Filtered Oil Spills (Active spills always show when showOilSpills is true; Historical spills show when showSpillTimeline is true)
  const filteredSpills = useMemo(() => {
    // 1. Active & Monitoring spills
    const active = oilSpillIncidents.filter(
      (s) => s.status === "active" || s.status === "monitoring"
    );

    // 2. If Spill History is NOT toggled on, show active/monitoring spills only
    if (!showSpillTimeline) {
      return active;
    }

    // 3. If Spill History is toggled on, include historical spills based on the timeline filter
    let historical = oilSpillIncidents.filter((s) => s.status === "historical");
    if (spillTimelineFilter.mode === "historical" && spillTimelineFilter.year !== "all") {
      historical = historical.filter((s) => s.year === spillTimelineFilter.year);
    }

    return [...active, ...historical];
  }, [showSpillTimeline, spillTimelineFilter]);

  const selectedSpill = useMemo(() => {
    return oilSpillIncidents.find((s) => s.id === selectedSpillId) || null;
  }, [selectedSpillId]);

  // Render Oil Spills
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    renderOilSpills(
      layers.oilSpills,
      filteredSpills,
      selectedSpillId,
      (spill) => {
        // Mutual exclusion: when selecting a spill, clear selected asset
        setSelectedSpillId(spill.id);
        onSelectAssetRef.current(null);
        onSelectSpillRef.current?.(spill.id);
      },
      showOilSpills
    );
  }, [filteredSpills, selectedSpillId, showOilSpills]);

  // Render Asset Markers
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.markers.clearLayers();

    assets.forEach((asset) => {
      const isSelected = asset.id === selectedAssetId;
      const icon = createMaritimeDivIcon(asset, isSelected, currentZoom);

      const marker = L.marker([asset.latitude, asset.longitude], {
        icon,
        zIndexOffset: isSelected ? 1000 : asset.status === "warning" ? 500 : 100,
      });

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        // Mutual exclusion: when selecting a vessel, clear selected spill
        setSelectedSpillId(null);
        onSelectSpillRef.current?.(null);
        onSelectAssetRef.current(asset.id);
      });

      marker.addTo(layers.markers);
    });
  }, [assets, selectedAssetId, currentZoom]);

  // Fly-to selected asset
  const prevSelectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAssetId) return;

    // Only fly if selection actually changed
    if (prevSelectedIdRef.current !== selectedAssetId) {
      prevSelectedIdRef.current = selectedAssetId;
      const selected = assets.find((a) => a.id === selectedAssetId);
      if (selected) {
      const targetZoom = 5;
        map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), targetZoom), {
          duration: 1.4,
        });
      }
    }
  }, [selectedAssetId, assets]);

  function resetView() {
    if (mapRef.current) {
      mapRef.current.flyTo(GLOBAL_CENTER, GLOBAL_DEFAULT_ZOOM, { duration: 1.2 });
    }
  }

  function zoomIn() {
    mapRef.current?.zoomIn();
  }

  function zoomOut() {
    mapRef.current?.zoomOut();
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-deep)] shadow-2xl ${className}`}>
      {/* Leaflet container */}
      <div ref={containerRef} className="h-full w-full select-none" />

      {/* Top Left: Map Controls Toolbar */}
      <div className="absolute left-3 top-3 z-[500] flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--map-ui-bg)] p-1.5 backdrop-blur-md shadow-lg">
        {/* Map Style Pills */}
        <div className="flex items-center rounded-lg bg-[var(--surface-hover)] p-0.5 text-[11px] font-medium border border-[var(--border)]">
          <button
            onClick={() => setMapStyle("dark")}
            className={`rounded px-2 py-1 transition-colors ${
              mapStyle === "dark" ? "bg-[var(--card)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-strong)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Dark Vector
          </button>
          <button
            onClick={() => setMapStyle("imagery")}
            className={`rounded px-2 py-1 transition-colors ${
              mapStyle === "imagery" ? "bg-[var(--card)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-strong)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Imagery
          </button>
          <button
            onClick={() => setMapStyle("hybrid")}
            className={`rounded px-2 py-1 transition-colors ${
              mapStyle === "hybrid" ? "bg-[var(--card)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-strong)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Hybrid
          </button>
        </div>

        <div className="h-4 w-px bg-[var(--border)]" />

        {/* Routes Toggle */}
        <button
          onClick={() => setShowRoutes((v) => !v)}
          className={`focus-ring flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
            showRoutes
              ? "border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-primary)] shadow-sm"
              : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          title="Toggle Trajectory Routes"
        >
          <Radio size={12} />
          <span>Routes</span>
        </button>

        {/* Oil Spill Layer Toggle - Preserving RED oil-spill data status */}
        <button
          onClick={() => setShowOilSpills((v) => !v)}
          className={`focus-ring flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
            showOilSpills
              ? "border-red-500/50 bg-red-500/15 text-red-500 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)]"
              : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          title="Toggle Oil Spill Monitoring Layer"
        >
          <Droplets size={12} className={showOilSpills ? "animate-pulse" : ""} />
          <span>Oil Spills</span>
          <span className="rounded bg-red-500/25 px-1 py-0.2 text-[9px] font-bold text-red-600 dark:text-red-300">
            {filteredSpills.length}
          </span>
        </button>

        {/* Oil Spill History & Timeline Toggle */}
        <button
          onClick={() => setShowSpillTimeline((v) => !v)}
          className={`focus-ring flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
            showSpillTimeline
              ? "border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-primary)] shadow-sm"
              : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          title="Toggle Oil Spill History & ITOPF Timeline"
        >
          <Clock size={12} />
          <span>Spill History</span>
        </button>

        {/* Map Legend Toggle */}
        <button
          onClick={() => setShowLegend((v) => !v)}
          className={`focus-ring flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
            showLegend
              ? "border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-primary)] shadow-sm"
              : "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          title="Toggle Map Legend"
        >
          <Layers size={12} />
          <span>Legend</span>
        </button>
      </div>

      {/* Floating Oil Spill History & Timeline Scrubber */}
      {showSpillTimeline && showOilSpills && !selectedSpill && (
        <div className="absolute top-14 right-3 z-[500] max-w-sm w-full pointer-events-auto">
          <OilSpillTimelineControl
            filter={spillTimelineFilter}
            onChangeFilter={setSpillTimelineFilter}
            onSelectIncident={(id) => {
              setSelectedSpillId(id);
              const found = oilSpillIncidents.find((s) => s.id === id);
              if (found && mapRef.current) {
                mapRef.current.flyTo([found.latitude, found.longitude], 6.5, {
                  duration: 1.2,
                });
              }
            }}
          />
        </div>
      )}

      {/* Floating Oil Spill Details Modal (Opened on Spill Click) */}
      {selectedSpill && (
        <OilSpillDetailsModal
          spill={selectedSpill}
          assets={assets}
          onClose={() => setSelectedSpillId(null)}
          onCenterOnMap={(lat, lng) => {
            mapRef.current?.flyTo([lat, lng], 7, { duration: 1.2 });
          }}
          onGenerateReport={(spill) => {
            const data = buildOilSpillReportData(
              {
                id: spill.id,
                title: spill.name,
                vessel: spill.vesselInvolved || "Tactical AIS Surveillance",
                reported: `${spill.date}, ${spill.time || "12:00 UTC"}`,
                area: `${spill.estimatedAreaKm2} km²`,
                severity: spill.severity,
                status: spill.status === "active" ? "Active" : spill.status === "monitoring" ? "Investigating" : "Resolved",
                locationName: spill.locationName,
                latitude: spill.latitude,
                longitude: spill.longitude,
              },
              assets,
              "detailed"
            );
            setReportModalData(data);
          }}
        />
      )}

      {/* Floating Report Generation Modal */}
      {reportModalData && (
        <OilSpillReportModal
          initialData={reportModalData}
          assets={assets}
          rawIncident={{
            id: reportModalData.incidentId,
            title: reportModalData.title,
            vessel: reportModalData.vesselName,
            reported: `${reportModalData.reportedDate}, ${reportModalData.reportedTime}`,
            area: `${reportModalData.areaKm2} km²`,
            severity: reportModalData.severity,
            status: reportModalData.status,
            locationName: reportModalData.locationName,
            latitude: reportModalData.latitude,
            longitude: reportModalData.longitude,
          }}
          previewOnly={false}
          onClose={() => setReportModalData(null)}
        />
      )}

      {/* Floating Map Legend */}
      {showLegend && (
        <div className="absolute bottom-11 right-3 z-[500] pointer-events-auto">
          <MapLegend />
        </div>
      )}

      {/* Top Right: Camera Reset */}
      <div className="absolute right-3 top-3 z-[500] flex flex-col items-center gap-2">
        <button
          onClick={resetView}
          title="Reset Global Camera View"
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--map-ui-bg)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] backdrop-blur-md shadow-lg transition-colors"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Bottom Right: Tactical Zoom Buttons */}
      <div className="absolute bottom-6 right-3 z-[500] flex flex-col gap-1">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--map-ui-bg)] text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] backdrop-blur-md shadow-md"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--map-ui-bg)] text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] backdrop-blur-md shadow-md"
        >
          −
        </button>
      </div>

      {/* Bottom Left: Real-time Cursor Coordinates Readout */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--map-ui-bg)] px-2.5 py-1 text-[10.5px] font-mono text-[var(--text-secondary)] backdrop-blur-md shadow-lg">
        <Crosshair size={12} className="text-[var(--text-primary)]" />
        <span>
          {cursorCoords
            ? `CURSOR: ${Math.abs(cursorCoords.lat).toFixed(4)}°${cursorCoords.lat >= 0 ? "N" : "S"}, ${Math.abs(
                cursorCoords.lng
              ).toFixed(4)}°${cursorCoords.lng >= 0 ? "E" : "W"}`
            : "MARITIME GRID"}
        </span>
        <span className="text-[var(--text-muted)]">| Z:{currentZoom.toFixed(1)}</span>
      </div>
    </div>
  );
}
