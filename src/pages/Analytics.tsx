import { AlertTriangle, Cpu, Droplets, Flame, History } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import KpiCard from "../components/dashboard/KpiCard";
import { kpiData } from "../data/kpi";
import { oilSpillIncidents, itopfAnnualStats } from "../data/oilSpillData";

export default function Analytics() {
  const activeSpills = oilSpillIncidents.filter((s) => s.status === "active");
  const monitoringSpills = oilSpillIncidents.filter((s) => s.status === "monitoring");
  const historicalSpills = oilSpillIncidents.filter((s) => s.status === "historical");

  const totalActiveArea = activeSpills.reduce((acc, s) => acc + s.estimatedAreaKm2, 0).toFixed(1);

  const criticalSeverityCount = oilSpillIncidents.filter((s) => s.severity === "critical").length;
  const highSeverityCount = oilSpillIncidents.filter((s) => s.severity === "high").length;
  const mediumSeverityCount = oilSpillIncidents.filter((s) => s.severity === "medium").length;
  const lowSeverityCount = oilSpillIncidents.filter((s) => s.severity === "low").length;

  const totalIncidents = oilSpillIncidents.length;

  return (
    <div className="animate-fade-in space-y-4 px-4 pb-6 pt-4 md:px-6">
      <PageHeader title="Analytics & AI" subtitle="Oil spill detection trends, severity distribution, and model metrics" />

      {/* Top KPI Cards focused strictly on Oil Spill Detection */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiData.map((k) => (
          <KpiCard key={k.id} data={k} />
        ))}
      </div>

      {/* OIL SPILL DETECTION ANALYSIS SECTION (Replaces old Vessel Risk section) */}
      <div className="glass-panel rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Droplets size={17} className="text-text-primary" />
            <h2 className="text-[14px] font-bold tracking-wide text-text-primary">
              OIL SPILL DETECTION ANALYSIS
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-text-secondary">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" /> Active: {activeSpills.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Monitoring: {monitoringSpills.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Historical: {historicalSpills.length}
            </span>
          </div>
        </div>

        {/* Severity Distribution & Category Breakdown */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-hover/50 p-4 space-y-3">
            <h3 className="text-[12.5px] font-semibold text-text-primary flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-text-primary" />
              Spill Severity Distribution
            </h3>
            <div className="space-y-2.5 font-mono text-[11.5px]">
              <div>
                <div className="flex justify-between text-text-secondary mb-1">
                  <span className="text-text-primary font-bold">Critical Severity</span>
                  <span>{criticalSeverityCount} incident(s) ({((criticalSeverityCount / totalIncidents) * 100).toFixed(0)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-text-primary rounded-full" style={{ width: `${(criticalSeverityCount / totalIncidents) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-text-secondary mb-1">
                  <span className="text-red-400 font-bold">High Severity</span>
                  <span>{highSeverityCount} incident(s) ({((highSeverityCount / totalIncidents) * 100).toFixed(0)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${(highSeverityCount / totalIncidents) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-text-secondary mb-1">
                  <span className="text-text-secondary font-bold">Medium Severity</span>
                  <span>{mediumSeverityCount} incident(s) ({((mediumSeverityCount / totalIncidents) * 100).toFixed(0)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-text-secondary rounded-full" style={{ width: `${(mediumSeverityCount / totalIncidents) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-text-secondary mb-1">
                  <span className="text-text-muted font-bold">Low Severity</span>
                  <span>{lowSeverityCount} incident(s) ({((lowSeverityCount / totalIncidents) * 100).toFixed(0)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-text-muted rounded-full" style={{ width: `${(lowSeverityCount / totalIncidents) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Current Active Spills Detail */}
          <div className="rounded-xl border border-border bg-surface-hover/50 p-4 space-y-3">
            <h3 className="text-[12.5px] font-semibold text-text-primary flex items-center gap-1.5">
              <Flame size={15} className="text-red-400" />
              Current Active Spreading Incidents
            </h3>
            <div className="space-y-2 font-mono text-[11.5px]">
              {activeSpills.map((spill) => (
                <div key={spill.id} className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-red-300">{spill.name}</span>
                    <span className="text-[10px] bg-red-500/30 px-1.5 py-0.5 rounded text-red-200">
                      {spill.estimatedAreaKm2} km²
                    </span>
                  </div>
                  <p className="text-[10.5px] text-text-secondary truncate">{spill.locationName}</p>
                  <p className="text-[10px] text-text-muted mt-1">Est. Volume: {spill.estimatedVolumeTonnes} · {spill.date}</p>
                </div>
              ))}
              <div className="rounded-lg border border-border bg-surface p-2 flex justify-between text-text-secondary text-[11px]">
                <span>Combined Active Surface Area:</span>
                <span className="font-bold text-text-primary">{totalActiveArea} km²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Year-wise Historical Statistics (ITOPF Tanker Spills) */}
        <div className="rounded-xl border border-border bg-surface-hover/50 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[12.5px] font-semibold text-text-primary flex items-center gap-1.5">
              <History size={15} className="text-text-primary" />
              Historical Tanker Spill Frequency Trends (ITOPF Verified Records)
            </h3>
            <span className="text-[10px] text-text-muted font-mono">Spills ≥ 7 tonnes</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 pt-1 font-mono text-center">
            {Object.entries(itopfAnnualStats).map(([yr, stat]) => (
              <div key={yr} className="rounded-lg border border-border bg-surface p-2">
                <p className="text-[11px] text-text-muted">{yr}</p>
                <p className="text-[14px] font-bold text-text-primary mt-0.5">{stat.tankerSpillsGte7T}</p>
                <p className="text-[8.5px] text-text-secondary truncate mt-0.5">{stat.approxVolumeTonnes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETECTION MODEL SECTION */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
            <Cpu size={15} className="text-text-primary" />
            Detection Model Architecture
          </h2>
          <span className="rounded bg-surface-hover border border-border px-2 py-0.5 text-[9.5px] font-mono font-bold text-text-primary">
            DEMO / SIMULATED INFERENCE
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-[12.5px] sm:grid-cols-5">
          <Metric label="Model Architecture" value="SAR-OilNet v3.2 (U-Net)" />
          <Metric label="Precision" value="97.1%" />
          <Metric label="Recall" value="96.4%" />
          <Metric label="Average Latency" value="4.2 s" />
          <Metric label="Confidence Threshold" value="95.0% (Validated)" />
        </dl>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-text-muted text-[11px]">{label}</dt>
      <dd className="font-semibold text-text-primary mt-0.5">{value}</dd>
    </div>
  );
}
