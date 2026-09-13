import { useState } from "react";
import {
  FileText,
  Download,
  X,
  AlertTriangle,
  Ship,
  MapPin,
  Droplets,
  CheckCircle,
  Layers,
  Compass,
} from "lucide-react";
import type {
  OilSpillReportData,
  ReportType,
  GeneratedReportRecord,
} from "./OilSpillPdfGenerator";
import {
  generateOilSpillPdf,
  REPORT_TYPE_OPTIONS,
  buildOilSpillReportData,
} from "./OilSpillPdfGenerator";
import type { MaritimeAsset } from "../../types/maritime";

interface OilSpillReportModalProps {
  initialData: OilSpillReportData;
  assets?: MaritimeAsset[];
  rawIncident?: {
    id: string;
    title: string;
    vessel?: string;
    reported?: string;
    area?: string | number;
    severity?: string;
    status?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  onClose: () => void;
  onReportCreated?: (record: GeneratedReportRecord) => void;
  previewOnly?: boolean;
}

export default function OilSpillReportModal({
  initialData,
  assets = [],
  rawIncident,
  onClose,
  onReportCreated,
  previewOnly = false,
}: OilSpillReportModalProps) {
  const [selectedType, setSelectedType] = useState<ReportType>(initialData.reportType || "detailed");
  const [reportData, setReportData] = useState<OilSpillReportData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Switch report type dynamically
  const handleTypeChange = (type: ReportType) => {
    setSelectedType(type);
    if (rawIncident) {
      const updated = buildOilSpillReportData(rawIncident, assets, type);
      setReportData(updated);
    } else {
      const typeOpt = REPORT_TYPE_OPTIONS.find((t) => t.id === type);
      setReportData((prev) => ({
        ...prev,
        reportType: type,
        reportTypeName: typeOpt?.title || prev.reportTypeName,
      }));
    }
  };

  const handleGeneratePdf = () => {
    try {
      setIsGenerating(true);
      setError(null);
      const { filename, reportId } = generateOilSpillPdf(reportData);
      
      const record: GeneratedReportRecord = {
        id: reportId,
        reportType: reportData.reportType,
        reportTypeName: reportData.reportTypeName,
        incidentId: reportData.incidentId,
        incidentTitle: reportData.title,
        generatedDate: reportData.generationDate,
        generatedTime: reportData.generationTime,
        timestamp: `${reportData.generationDate} • ${reportData.generationTime.slice(0, 5)} UTC`,
        area: `${reportData.areaKm2} km²`,
        severity: reportData.severity,
        status: reportData.status,
        filename,
        reportData,
      };

      onReportCreated?.(record);
      setSuccessMsg(`Report generated: ${filename}`);
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1200);
    } catch (err) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : "Failed to generate PDF report.");
    }
  };

  const latFormatted = `${Math.abs(reportData.latitude).toFixed(3)}°${reportData.latitude >= 0 ? "N" : "S"}`;
  const lngFormatted = `${Math.abs(reportData.longitude).toFixed(3)}°${reportData.longitude >= 0 ? "E" : "W"}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-hover/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-text-primary tracking-wide">
                {previewOnly ? "View Oil Spill Report" : "Generate Oil Spill Report"}
              </h3>
              <p className="text-[11px] font-mono text-text-secondary">
                DOCUMENT ID: {reportData.reportId} · REF: {reportData.incidentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="focus-ring rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 font-mono text-[12px] max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* REPORT TYPE SELECTION (Requirement 3) */}
          {!previewOnly && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Select Report Type:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REPORT_TYPE_OPTIONS.map((opt) => {
                  const isSelected = selectedType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleTypeChange(opt.id)}
                      className={`focus-ring text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? "border-text-primary bg-text-primary text-background shadow-sm"
                          : "border-border bg-surface-hover/50 text-text-primary hover:border-text-secondary"
                      }`}
                    >
                      <p className="font-bold text-[11.5px] leading-tight">
                        {opt.title}
                      </p>
                      <p
                        className={`text-[9.5px] mt-1 line-clamp-2 leading-normal ${
                          isSelected ? "opacity-80" : "text-text-muted"
                        }`}
                      >
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Active Incident Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-3 gap-2">
            <div>
              <p className="text-[9.5px] text-text-muted uppercase">Selected Oil Spill Incident</p>
              <p className="text-[13px] font-bold text-text-primary">{reportData.title}</p>
              <p className="text-[10.5px] text-text-secondary">
                Detected: {reportData.reportedDate}, {reportData.reportedTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10.5px] font-bold text-red-400 animate-pulse">
                ● {reportData.status.toUpperCase()}
              </span>
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10.5px] font-mono text-text-primary font-bold">
                {reportData.reportTypeName}
              </span>
            </div>
          </div>

          {/* Telemetry Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5">
              <span className="text-[9.5px] text-text-muted flex items-center gap-1">
                <MapPin size={11} className="text-text-primary" /> Coordinates
              </span>
              <p className="font-semibold text-text-primary truncate mt-0.5 text-[11.5px]">
                {latFormatted}, {lngFormatted}
              </p>
              <p className="text-[9.5px] text-text-secondary truncate">{reportData.locationName}</p>
            </div>

            <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5">
              <span className="text-[9.5px] text-text-muted flex items-center gap-1">
                <Droplets size={11} className="text-red-400" /> Slick Area
              </span>
              <p className="font-semibold text-red-400 text-[13px] mt-0.5">
                {reportData.areaKm2} km²
              </p>
              <p className="text-[9.5px] text-text-secondary">Est. {reportData.estimatedVolume}</p>
            </div>

            <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5">
              <span className="text-[9.5px] text-text-muted flex items-center gap-1">
                <Ship size={11} className="text-text-primary" /> Source Vessel
              </span>
              <p className="font-semibold text-text-primary truncate mt-0.5 text-[11.5px]">
                {reportData.vesselName}
              </p>
              <p className="text-[9.5px] text-text-secondary">{reportData.vesselImo}</p>
            </div>

            <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5">
              <span className="text-[9.5px] text-text-muted flex items-center gap-1">
                <AlertTriangle size={11} className="text-text-primary" /> Risk & Confidence
              </span>
              <p className="font-semibold text-text-primary uppercase mt-0.5 text-[11.5px]">
                {reportData.severity} Risk
              </p>
              <p className="text-[9.5px] text-text-secondary">Confidence: {reportData.confidence}%</p>
            </div>
          </div>

          {/* Focused Scope Preview for Selected Type */}
          <div className="rounded-xl border border-border bg-surface-hover/25 p-3.5 space-y-2">
            <div className="flex items-center gap-2 border-b border-border pb-1.5">
              <Layers size={14} className="text-text-primary" />
              <h4 className="text-[11.5px] font-bold text-text-primary uppercase">
                Content Focus: {reportData.reportTypeName}
              </h4>
            </div>

            {selectedType === "initial" && (
              <div className="space-y-1 text-[11px] text-text-secondary">
                <p>• <strong className="text-text-primary">First Orbital Pass:</strong> {reportData.source}</p>
                <p>• <strong className="text-text-primary">Detection Method:</strong> {reportData.detectionMethod}</p>
                <p>• <strong className="text-text-primary">AI Inference Architecture:</strong> {reportData.modelArchitecture}</p>
                <p>• <strong className="text-text-primary">Initial Classification:</strong> {reportData.severity.toUpperCase()} Alert ({reportData.areaKm2} km²)</p>
              </div>
            )}

            {selectedType === "environmental" && (
              <div className="space-y-1 text-[11px] text-text-secondary">
                <p>• <strong className="text-red-400">Ecological Vulnerability:</strong> {reportData.environmentalRisk}</p>
                <p>• <strong className="text-text-primary">Coastal Proximity:</strong> {reportData.coastalProximity}</p>
                <p>• <strong className="text-text-primary">Hydrocarbon Profile:</strong> {reportData.oilType}</p>
                <p>• <strong className="text-text-primary">Predicted Drift:</strong> {reportData.spreadRate}</p>
              </div>
            )}

            {selectedType === "monitoring" && (
              <div className="space-y-1 text-[11px] text-text-secondary">
                <p>• <strong className="text-text-primary">Area Comparison:</strong> Current {reportData.areaKm2} km² (Previous: {reportData.previousAreaKm2} km²)</p>
                <p>• <strong className="text-text-primary">Surface Area Delta:</strong> {reportData.areaDeltaKm2} km² spreading increase</p>
                <p>• <strong className="text-text-primary">Spreading Velocity:</strong> {reportData.spreadRate}</p>
                <p>• <strong className="text-text-primary">Monitoring Cycle:</strong> Continuous 12-hr Sentinel-1 SAR telemetry passes</p>
              </div>
            )}

            {selectedType === "response" && (
              <div className="space-y-1 text-[11px] text-text-secondary">
                <p>• <strong className="text-text-primary">Response Tier:</strong> {reportData.responseStatus}</p>
                <p>• <strong className="text-text-primary">Containment Deployment:</strong> Emergency ocean containment booms on scene</p>
                <p>• <strong className="text-text-primary">Nearby Response Assets:</strong> {reportData.nearbyWaterships.length} waterships tracked in sector</p>
                <p>• <strong className="text-text-primary">Active Action:</strong> {reportData.actionsTaken[0]}</p>
              </div>
            )}

            {selectedType === "final" && (
              <div className="space-y-1 text-[11px] text-text-secondary">
                <p>• <strong className="text-text-primary">Resolution State:</strong> Spill boundary contained and stabilized</p>
                <p>• <strong className="text-text-primary">Total Impacted Area:</strong> {reportData.areaKm2} km² audited</p>
                <p>• <strong className="text-text-primary">Shoreline Impact:</strong> Zero shoreline landfall confirmed at sanctuary boundary</p>
                <p>• <strong className="text-text-primary">Remediation Status:</strong> Closed & documented under maritime registry</p>
              </div>
            )}

            {selectedType === "detailed" && (
              <div className="space-y-1 text-[11px] text-text-secondary">
                <p>• <strong className="text-text-primary">Scope:</strong> Full multi-parameter dossier combining all sensor, AIS, trajectory & response fields.</p>
                <p>• <strong className="text-text-primary">Vessel Telemetry:</strong> IMO {reportData.vesselImo} · MMSI {reportData.vesselMmsi} · Flag {reportData.vesselFlag}</p>
                <p>• <strong className="text-text-primary">AI Validation:</strong> Model {reportData.modelName} ({reportData.confidence}% confidence)</p>
                <p>• <strong className="text-text-primary">Tactical Snapshot:</strong> Includes 2D spatial coordinate grid & proximity radar</p>
              </div>
            )}
          </div>

          {/* Nearby Waterships Proximity */}
          <div className="rounded-lg border border-border bg-surface p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10.5px] font-bold text-text-primary">
              <span className="flex items-center gap-1.5">
                <Compass size={13} />
                Nearby Waterships in Sector ({reportData.nearbyWaterships.length})
              </span>
              <span className="text-[9.5px] text-text-muted">SAR / AIS PROXIMITY</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {reportData.nearbyWaterships.slice(0, 4).map((ship) => (
                <div key={ship.name} className="flex items-center justify-between p-1.5 rounded bg-surface-hover/40 border border-border/50 text-[10px]">
                  <div>
                    <span className="font-semibold text-text-primary block">{ship.name}</span>
                    <span className="text-text-muted">{ship.type} · {ship.callsign}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-text-primary">{ship.distanceNM} NM</span>
                    <span className="text-[9px] text-text-muted block">{ship.bearing}°T</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-[11.5px] text-red-400 flex items-center gap-1 font-semibold">
              <AlertTriangle size={13} /> {error}
            </p>
          )}

          {successMsg && (
            <p className="text-[11.5px] text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle size={14} /> {successMsg}
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border bg-surface-hover/50 px-5 py-3.5">
          <p className="text-[10px] text-text-muted font-mono hidden sm:block">
            FILENAME: aeroMarine-{reportData.reportTypeName.replace(/[^a-zA-Z0-9]/g, "")}-{reportData.incidentId}-YYYYMMDD.pdf
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="focus-ring rounded-lg border border-border px-3.5 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              {previewOnly ? "Close" : "Cancel"}
            </button>
            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="focus-ring flex items-center gap-2 rounded-lg bg-text-primary px-4 py-1.5 text-[12px] font-bold text-background hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isGenerating ? "Compiling PDF…" : "Generate PDF"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
