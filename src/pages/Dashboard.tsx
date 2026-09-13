import { useEffect, useMemo, useState } from "react";
import { Radio } from "lucide-react";
import { useMaritimeSimulation } from "../hooks/useMaritimeSimulation";
import AnalyticsCards from "../components/aerospace/AnalyticsCards";
import SearchFilters from "../components/aerospace/SearchFilters";
import TrackingMap from "../components/aerospace/TrackingMap";
import AssetSidebar from "../components/aerospace/AssetSidebar";
import AssetList from "../components/aerospace/AssetList";
import type { AssetStatusFilter, AssetTypeFilter } from "../types/aerospace";
import { oilSpillIncidents } from "../data/oilSpillData";

interface DashboardProps {
  targetAssetId?: string | null;
  targetSpillId?: string | null;
}

export default function Dashboard({ targetAssetId, targetSpillId }: DashboardProps = {}) {
  const simulation = useMaritimeSimulation();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<AssetStatusFilter>("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(targetAssetId ?? null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!!targetAssetId);

  // Sync prop changes if user clicks an alert
  useEffect(() => {
    if (targetAssetId) {
      setSelectedAssetId(targetAssetId);
      setSidebarOpen(true);
    }
  }, [targetAssetId]);

  useEffect(() => {
    if (targetSpillId) {
      setSelectedAssetId(null);
      setSidebarOpen(false);
    }
  }, [targetSpillId]);

  // All matching assets for the search field
  const matchingAssets = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return simulation.assets;
    return simulation.assets.filter((asset) => {
      const matchName = asset.name?.toLowerCase().includes(query);
      const matchId = asset.id?.toLowerCase().includes(query);
      const matchCallsign = asset.callsign?.toLowerCase().includes(query);
      const matchType = asset.vesselType?.toLowerCase().includes(query);
      const matchImo = asset.imo?.toLowerCase().includes(query);
      const matchMmsi = asset.mmsi?.toLowerCase().includes(query);
      const matchDest = asset.destination?.toLowerCase().includes(query);
      return matchName || matchId || matchCallsign || matchType || matchImo || matchMmsi || matchDest;
    });
  }, [simulation.assets, searchQuery]);

  // Filtered assets applying domain and status pills
  const assets = useMemo(() => {
    return matchingAssets.filter((asset) => {
      if (typeFilter !== "all" && asset.type !== typeFilter) return false;
      if (statusFilter !== "all" && asset.status !== statusFilter) return false;
      return true;
    });
  }, [matchingAssets, statusFilter, typeFilter]);

  const activeSpills = useMemo(() => oilSpillIncidents.filter((spill) => spill.status === "active"), []);
  const activeSpillsCount = activeSpills.length;
  const totalAffectedAreaKm2 = useMemo(() => activeSpills.reduce((sum, s) => sum + s.estimatedAreaKm2, 0).toFixed(1), [activeSpills]);
  const criticalAlertsCount = useMemo(() => activeSpills.filter((s) => s.severity === "critical" || s.severity === "high").length, [activeSpills]);

  const selectedAsset = simulation.assets.find((asset) => asset.id === selectedAssetId) ?? null;
  const selectAsset = (id: string | null) => {
    setSelectedAssetId(id);
    setSidebarOpen(!!id);
  };

  return (
    <div className="space-y-4 px-4 pb-8 pt-4 md:px-6">
      {/* Top Oil Spill KPIs */}
      <AnalyticsCards
        activeSpillsCount={activeSpillsCount}
        totalAffectedAreaKm2={totalAffectedAreaKm2}
        criticalAlertsCount={criticalAlertsCount}
        selectedFilter={typeFilter}
        onSelectFilter={setTypeFilter}
      />

      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isPlaying={simulation.isPlaying}
        onTogglePlay={() => simulation.setIsPlaying((playing) => !playing)}
        speed={simulation.speed}
        onSpeedChange={simulation.setSpeed}
        onResetSimulation={simulation.resetSimulation}
        totalFiltered={assets.length}
        matchingAssets={matchingAssets}
        onSelectVessel={(id) => selectAsset(id)}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="h-[520px] xl:h-[620px]">
            <TrackingMap
              assets={assets}
              selectedAssetId={selectedAssetId}
              onSelectAsset={selectAsset}
              onSelectSpill={() => {
                setSelectedAssetId(null);
                setSidebarOpen(false);
              }}
              className="h-full w-full"
            />
          </div>
          <AssetList
            assets={assets}
            selectedAssetId={selectedAssetId}
            onSelectAsset={selectAsset}
          />
        </div>

        <div className="h-full">
          {sidebarOpen && selectedAsset ? (
            <div className="h-[520px] xl:h-[620px] sticky top-20">
              <AssetSidebar
                asset={selectedAsset}
                onClose={() => {
                  setSelectedAssetId(null);
                  setSidebarOpen(false);
                }}
                onCenterOnMap={(asset) => setSelectedAssetId(asset.id)}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                if (assets[0]) {
                  setSelectedAssetId(assets[0].id);
                  setSidebarOpen(true);
                }
              }}
              className="glass-panel flex w-full items-center justify-center gap-2 rounded-xl py-4 text-[13px] font-medium text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Radio size={16} />
              Open Intelligence Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
