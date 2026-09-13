import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Cpu, Loader2, ServerOff, UploadCloud } from "lucide-react";
import { checkBackendHealth, detectSpill, getModelStatus, type ModelStatus, type SpillDetectionResult } from "../../lib/api";

type Status = "idle" | "checking" | "offline" | "ready";

export default function SpillAnalyzer() {
  const [backendStatus, setBackendStatus] = useState<Status>("checking");
  const [modelInfo, setModelInfo] = useState<ModelStatus | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverageAreaKm2, setCoverageAreaKm2] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpillDetectionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkBackendHealth().then((ok) => {
      setBackendStatus(ok ? "ready" : "offline");
      if (ok) {
        getModelStatus().then((info) => setModelInfo(info));
      }
    });
  }, []);

  function handleFile(f: File | null) {
    setFile(f);
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await detectSpill(file, coverageAreaKm2);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel animate-fade-in rounded-xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
            <UploadCloud size={15} className="text-text-primary" />
            Analyze Satellite / Drone Image (SAR & Optical AI)
          </h2>
          {modelInfo?.loaded && (
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-muted">
              <Cpu size={12} className="text-text-secondary" />
              Active Model: <span className="font-mono text-text-primary font-medium">{modelInfo.model_name}</span> (Input: {modelInfo.input_shape?.slice(1).join("×")}, Output: {modelInfo.output_shape?.slice(1).join("×")})
            </p>
          )}
        </div>
        <BackendBadge status={backendStatus} />
      </div>

      {backendStatus === "offline" && (
        <p className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-surface-hover px-3 py-2 text-[11.5px] text-text-secondary">
          <ServerOff size={14} />
          Backend not reachable at the configured API URL. Start it with{" "}
          <code className="rounded bg-border px-1">uvicorn main:app --reload</code> in the{" "}
          <code className="rounded bg-border px-1">server/</code> folder.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <button
            onClick={() => inputRef.current?.click()}
            className="focus-ring flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-text-muted hover:border-text-primary hover:text-text-primary transition-colors"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected capture" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <>
                <UploadCloud size={22} />
                <span className="text-[11.5px]">Click to upload Satellite SAR or Aerial/Drone Optical image</span>
                <span className="text-[10px] text-text-muted">Supports PNG, JPG, JPEG with auto contrast enhancement</span>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/bmp,image/tiff"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <label className="mt-3 flex items-center justify-between gap-3 text-[11.5px] text-text-secondary">
            Coverage area of this image (km²)
            <input
              type="number"
              min={1}
              value={coverageAreaKm2}
              onChange={(e) => setCoverageAreaKm2(Number(e.target.value) || 1)}
              className="focus-ring w-24 rounded-lg border border-border bg-surface-hover px-2 py-1 text-right text-text-primary"
            />
          </label>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading || backendStatus !== "ready"}
            className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-3 py-2 text-[12.5px] font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition-opacity"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {loading ? "Running model…" : "Run Detection"}
          </button>

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-red-400">
              <AlertTriangle size={13} />
              {error}
            </p>
          )}
        </div>

        <div className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-hover/40">
          {!result && !loading && (
            <p className="px-4 text-center text-[11.5px] text-text-muted">
              Result overlay from the trained U-Net segmentation model will appear here.
            </p>
          )}
          {loading && <Loader2 size={22} className="animate-spin text-text-primary" />}
          {result && previewUrl && (
            <>
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              <img
                src={`data:image/png;base64,${result.overlayPngBase64}`}
                alt="Detected spill overlay"
                className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
              />
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface-hover/50 px-3 py-1.5 text-[11px] text-text-secondary">
            <span>Input Type: <strong className="text-text-primary font-medium">{result.imageType || "Analyzed"}</strong></span>
            <span>Pipeline: <strong className="text-text-primary font-medium">{result.enhancementApplied || "Adaptive CLAHE"}</strong></span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Spill Detected" value={result.spillDetected ? "Yes" : "No"} accent={result.spillDetected ? "text-red-400 font-bold" : "text-text-primary"} />
            <Stat label="Estimated Area" value={`${result.areaKm2} km²`} accent="text-text-primary" />
            <Stat label="Model Confidence" value={`${result.confidence}%`} accent="text-text-primary" />
            <Stat label="Pixel Coverage" value={`${(result.spillPixelFraction * 100).toFixed(2)}%`} accent="text-text-secondary" />
          </div>
        </div>
      )}
    </div>
  );
}

function BackendBadge({ status }: { status: Status }) {
  const map: Record<Status, { text: string; cls: string }> = {
    idle: { text: "Idle", cls: "text-text-muted" },
    checking: { text: "Checking backend…", cls: "text-text-muted" },
    offline: { text: "Backend offline", cls: "text-red-400" },
    ready: { text: "Model online", cls: "text-text-primary font-medium" },
  };
  const { text, cls } = map[status];
  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-medium ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "ready" ? "bg-text-primary" : status === "offline" ? "bg-red-400" : "bg-text-muted"}`} />
      {text}
    </span>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-border p-2.5 text-center bg-surface">
      <p className="text-[10.5px] text-text-secondary">{label}</p>
      <p className={`text-[15px] font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
