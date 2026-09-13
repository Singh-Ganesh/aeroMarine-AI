import { useState, useEffect } from "react";
import { AlertOctagon, FileText, FileWarning, CheckCircle, Download, Eye, Clock, ShieldCheck } from "lucide-react";
import { incidents } from "../data/incidents";
import PageHeader from "../components/common/PageHeader";
import { useMaritimeSimulation } from "../hooks/useMaritimeSimulation";
import OilSpillReportModal from "../components/ai/OilSpillReportModal";
import {
  buildOilSpillReportData,
  generateOilSpillPdf,
  type OilSpillReportData,
  type GeneratedReportRecord,
} from "../components/ai/OilSpillPdfGenerator";

const severityStyle: Record<string, string> = {
  high: "border-red-500/40 bg-red-500/10 text-red-400",
  medium: "border-border bg-surface-hover text-text-primary",
  low: "border-border bg-surface text-text-secondary",
};

const statusStyle: Record<string, string> = {
  Active: "text-red-400 font-semibold",
  Investigating: "text-amber-400 font-semibold",
  Resolved: "text-text-muted font-medium",
};

const STORAGE_KEY = "aeromarine_generated_reports";

export default function IncidentReports() {
  const [expanded, setExpanded] = useState<string | null>(incidents[0]?.id ?? null);
  const [modalReportData, setModalReportData] = useState<OilSpillReportData | null>(null);
  const [activeRawIncident, setActiveRawIncident] = useState<typeof incidents[0] | null>(null);
  const [previewOnlyMode, setPreviewOnlyMode] = useState<boolean>(false);
  const [latestReportGenerated, setLatestReportGenerated] = useState<string | null>(null);
  const [reportHistory, setReportHistory] = useState<GeneratedReportRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verify it doesn't just contain stale duplicate Bay of Bengal records
        if (Array.isArray(parsed) && parsed.length > 0) {
          const uniqueTitles = new Set(parsed.map((p: any) => p.incidentTitle || p.reportData?.locationName));
          if (uniqueTitles.size > 1 || parsed[0]?.reportData?.incidentId === "OS-2026-BOB-01") {
            return parsed;
          }
        }
      }
    } catch {
      // ignore
    }
    // Default initial demonstration reports with DISTINCT locations
    return [
      {
        id: "AM-OSR-20260909-001",
        reportType: "detailed",
        reportTypeName: "Detailed Incident Report",
        incidentId: "OS-2026-BOB-01",
        incidentTitle: "Oil Spill — Bay of Bengal Offshore Sector",
        generatedDate: "09 Sep 2026",
        generatedTime: "09:15 UTC",
        timestamp: "09 Sep 2026 • 09:15 UTC",
        area: "12.4 km²",
        severity: "high",
        status: "Active",
        filename: "aeroMarine-DetailedIncidentReport-OS-2026-BOB-01-2026-09-09.pdf",
        reportData: buildOilSpillReportData(incidents[0], [], "detailed"),
      },
      {
        id: "AM-OSR-20260909-002",
        reportType: "initial",
        reportTypeName: "Initial Detection Report",
        incidentId: "OS-2026-MUM-02",
        incidentTitle: "Oil Spill — Mumbai Coast",
        generatedDate: "09 Sep 2026",
        generatedTime: "09:10 UTC",
        timestamp: "09 Sep 2026 • 09:10 UTC",
        area: "24.8 km²",
        severity: "critical",
        status: "Active",
        filename: "aeroMarine-InitialDetectionReport-OS-2026-MUM-02-2026-09-09.pdf",
        reportData: buildOilSpillReportData(incidents[1], [], "initial"),
      },
    ];
  });

  const { assets } = useMaritimeSimulation();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportHistory));
    } catch {
      // ignore
    }
  }, [reportHistory]);

  const handleOpenReport = (e: React.MouseEvent, inc: typeof incidents[0]) => {
    e.stopPropagation();
    setActiveRawIncident(inc);
    const data = buildOilSpillReportData(inc, assets, "detailed");
    setModalReportData(data);
    setPreviewOnlyMode(false);
  };

  const handleViewReportRecord = (record: GeneratedReportRecord) => {
    setModalReportData(record.reportData);
    setPreviewOnlyMode(true);
  };

  const handleDownloadReportRecord = (record: GeneratedReportRecord) => {
    generateOilSpillPdf(record.reportData);
  };

  const handleReportCreated = (newRecord: GeneratedReportRecord) => {
    setReportHistory((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    setLatestReportGenerated(`${newRecord.generatedTime} (${newRecord.reportTypeName})`);
  };

  return (
    <div className="animate-fade-in space-y-5 px-4 pb-8 pt-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <PageHeader title="Incident Reports" subtitle={`${incidents.length} logged incidents this week`} />
        {latestReportGenerated && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-hover px-3 py-1 text-[11px] font-mono text-text-primary self-start sm:self-auto">
            <CheckCircle size={13} />
            <span>Latest Report: {latestReportGenerated}</span>
          </div>
        )}
      </div>

      {/* Main Incidents List */}
      <div className="space-y-3">
        {incidents.map((inc) => {
          const isOpen = expanded === inc.id;
          const isOilSpill = inc.title.toLowerCase().includes("oil spill") || inc.id.includes("inc-1");
          const isActive = inc.status === "Active";

          return (
            <div key={inc.id} className="glass-panel overflow-hidden rounded-xl">
              <button
                onClick={() => setExpanded(isOpen ? null : inc.id)}
                aria-expanded={isOpen}
                className="focus-ring flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${severityStyle[inc.severity]}`}>
                    <FileWarning size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-text-primary">{inc.title}</p>
                    <p className="text-[11px] text-text-secondary">{inc.vessel} &middot; {inc.reported}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Generate Report Button for Oil Spill Incidents */}
                  {isOilSpill && (
                    <button
                      onClick={(e) => handleOpenReport(e, inc)}
                      title="Generate Official Oil Spill Incident PDF Report"
                      className="focus-ring flex items-center gap-1.5 rounded-lg border border-border bg-surface-hover px-3 py-1.5 text-[11.5px] font-bold text-text-primary hover:bg-border/40 transition-all shadow-sm"
                    >
                      <FileText size={13} />
                      <span>{isActive ? "📄 Report" : "Generate Report"}</span>
                    </button>
                  )}
                  <span className={`text-[11.5px] ${statusStyle[inc.status]}`}>{inc.status}</span>
                </div>
              </button>

              {isOpen && (
                <div className="animate-fade-in border-t border-border px-4 py-3 text-[12px] text-text-secondary flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertOctagon size={14} className="text-red-400" />
                    Affected area: <span className="text-text-primary font-mono">{inc.area}</span>
                  </div>

                  {isOilSpill && (
                    <div className="flex items-center gap-2 text-[11px] text-text-muted">
                      <span>Telemetry source: Sentinel-1 SAR Radar & AIS</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GENERATED REPORTS SECTION (Requirement 6) */}
      <div className="glass-panel overflow-hidden rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border bg-surface-hover/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-text-primary" />
            <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wide">
              GENERATED REPORTS
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            {reportHistory.length} reports logged this session
          </span>
        </div>

        {reportHistory.length === 0 ? (
          <div className="p-6 text-center text-text-muted text-[12px]">
            No reports generated yet. Click [📄 Report] on an active oil spill to generate a report.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reportHistory.map((report) => {
              const latStr = `${Math.abs(report.reportData.latitude).toFixed(2)}°${report.reportData.latitude >= 0 ? "N" : "S"}`;
              const lngStr = `${Math.abs(report.reportData.longitude).toFixed(2)}°${report.reportData.longitude >= 0 ? "E" : "W"}`;
              return (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-hover/30 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    {/* Line 1: [Report Type] [Report ID] */}
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-bold text-text-primary">
                        {report.reportTypeName}
                      </h4>
                      <span className="rounded bg-surface-hover border border-border px-1.5 py-0.2 text-[9.5px] font-mono text-text-secondary">
                        {report.id}
                      </span>
                    </div>

                    {/* Line 2: Oil Spill — <Location> */}
                    <p className="text-[12px] text-text-primary font-semibold">
                      Oil Spill — {report.reportData.locationName}
                    </p>

                    {/* Line 3: Location: <actual coordinates> */}
                    <p className="text-[11px] font-mono text-text-secondary">
                      Location: {latStr}, {lngStr} ({report.reportData.coastalProximity})
                    </p>

                    {/* Line 4 & 5: Generated & Affected Area & Status */}
                    <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-text-muted font-mono pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Generated: {report.timestamp}
                      </span>
                      <span>&middot;</span>
                      <span>Affected Area: <strong className="text-text-primary">{report.area}</strong></span>
                      <span>&middot;</span>
                      <span>Status: <span className={statusStyle[report.status] || "text-text-primary"}>{report.status}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleViewReportRecord(report)}
                      title="Preview report details"
                      className="focus-ring flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      <Eye size={13} />
                      <span>View Report</span>
                    </button>

                    <button
                      onClick={() => handleDownloadReportRecord(report)}
                      title={`Download ${report.filename}`}
                      className="focus-ring flex items-center gap-1.5 rounded-lg border border-border bg-text-primary text-background px-3 py-1.5 text-[11.5px] font-bold hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Generation / View Modal */}
      {modalReportData && (
        <OilSpillReportModal
          initialData={modalReportData}
          assets={assets}
          rawIncident={activeRawIncident ?? incidents[0]}
          previewOnly={previewOnlyMode}
          onClose={() => {
            setModalReportData(null);
            setActiveRawIncident(null);
            setPreviewOnlyMode(false);
          }}
          onReportCreated={handleReportCreated}
        />
      )}
    </div>
  );
}
