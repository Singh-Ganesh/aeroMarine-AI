import { useState } from "react";
import { AlertTriangle, Droplets, MapPin, Radio } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import TrackingMap from "../components/aerospace/TrackingMap";
import AIAnalysisSummary from "../components/ai/AIAnalysisSummary";
import SpillAnalyzer from "../components/ai/SpillAnalyzer";
import { useMaritimeSimulation } from "../hooks/useMaritimeSimulation";
import { oilSpillIncidents } from "../data/oilSpillData";

export default function OilSpillDetection() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const { assets } = useMaritimeSimulation();
  const activeSpills = oilSpillIncidents.filter((spill) => spill.status === "active");
  const totalArea = activeSpills.reduce((sum, spill) => sum + spill.estimatedAreaKm2, 0).toFixed(1);
  return <div className="animate-fade-in space-y-4 px-4 pb-8 pt-4 md:px-6">
    <PageHeader title="Oil Spill Detection & Tactical Monitoring" subtitle="AI-detected ocean spill regions, spreading simulation, and fleet response" />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Active Spreading Spills" value={`${activeSpills.length} detected`} accent="text-red-400" icon={AlertTriangle} />
      <Stat label="Estimated Spreading Area" value={`${totalArea} km²`} accent="text-text-primary" icon={Droplets} />
      <Stat label="Primary Hazard Sector" value="1.264°N, 103.820°E" accent="text-text-primary" icon={MapPin} />
      <Stat label="Fleet Surveillance" value={`${assets.length} Waterships`} accent="text-text-secondary" icon={Radio} />
    </div>
    <div className="h-[520px] w-full xl:h-[620px]"><TrackingMap assets={assets} selectedAssetId={selectedAssetId} onSelectAsset={setSelectedAssetId} className="h-full w-full" /></div>
    <SpillAnalyzer /><AIAnalysisSummary />
  </div>;
}
function Stat({ label, value, accent, icon: Icon }: { label: string; value: string; accent: string; icon: typeof Droplets }) { 
  return (
    <div className="glass-panel flex items-center gap-3 rounded-xl p-3.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-hover">
        <Icon size={20} className={accent} />
      </div>
      <div>
        <p className="text-[11px] text-text-secondary">{label}</p>
        <p className="text-[14px] font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  ); 
}
