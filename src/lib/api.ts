// Empty string = same-origin relative requests. Used when the backend serves
// the built frontend itself (single host/port). Override with
// VITE_API_BASE_URL at build time to point at a separately-hosted backend.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export interface SpillDetectionResult {
  spillDetected: boolean;
  spillPixelFraction: number;
  areaKm2: number;
  confidence: number;
  imageType?: string;
  enhancementApplied?: string;
  polygons: [number, number][][];
  overlayPngBase64: string;
  originalSize: { width: number; height: number };
  modelInputSize: number;
}

export async function detectSpill(file: File, coverageAreaKm2 = 100): Promise<SpillDetectionResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(
    `${API_BASE}/api/detect-spill?coverage_area_km2=${encodeURIComponent(coverageAreaKm2)}`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Detection failed (${res.status})`);
  }

  return res.json();
}

export interface ModelStatus {
  model_name: string;
  model_path: string;
  loaded: boolean;
  input_shape: (number | null)[];
  output_shape: (number | null)[];
  input_dtype: string;
  output_dtype: string;
  keras_version?: string;
  layers_count: number;
  error?: string | null;
}

export async function getModelStatus(): Promise<ModelStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/api/model-status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}

