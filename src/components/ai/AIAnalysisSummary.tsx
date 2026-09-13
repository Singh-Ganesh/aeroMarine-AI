import { ArrowRight, Sparkles } from "lucide-react";

const tags = [
  { label: "#OilSpill", accent: "text-text-primary bg-surface-hover border border-border" },
  { label: "#MVSeabreeze", accent: "text-text-primary bg-surface-hover border border-border" },
  { label: "#BayOfBengal", accent: "text-text-primary bg-surface-hover border border-border" },
  { label: "#HighRisk", accent: "text-red-400 bg-red-500/10 border border-red-500/20" },
];

export default function AIAnalysisSummary() {
  return (
    <div className="glass-panel animate-fade-in rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
          <Sparkles size={15} className="text-text-primary" />
          AI Analysis Summary
        </h2>
        <button className="focus-ring flex items-center gap-1 text-[11px] font-medium text-text-primary hover:underline">
          View Report <ArrowRight size={12} />
        </button>
      </div>

      <p className="text-[12.5px] leading-relaxed text-text-secondary">
        A potential oil spill of <span className="font-semibold text-text-primary">12.4 km²</span> was detected
        using SAR imagery. Vessel <span className="font-semibold text-text-primary">MV Seabreeze (IMO: 8765432)</span>{" "}
        was identified as high-risk based on trajectory analysis, timing, and behavioral patterns. Confidence
        level: <span className="font-semibold text-text-primary">96%</span>.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t.label} className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${t.accent}`}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
