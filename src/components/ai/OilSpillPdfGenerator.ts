import { jsPDF } from "jspdf";
import type { MaritimeAsset } from "../../types/maritime";
import { calculateDistanceAndBearing } from "../map/geo";
import { oilSpillIncidents } from "../../data/oilSpillData";

export type ReportType =
  | "initial"
  | "detailed"
  | "environmental"
  | "monitoring"
  | "response"
  | "final";

export interface ReportTypeOption {
  id: ReportType;
  title: string;
  description: string;
  focus: string;
}

export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  {
    id: "initial",
    title: "Initial Detection Report",
    description: "Urgent flash report on first satellite radar/optical detection",
    focus: "First detection timestamp, coordinates, confidence, initial area, detection method",
  },
  {
    id: "detailed",
    title: "Detailed Incident Report",
    description: "Comprehensive operational report with all telemetry & vessel data",
    focus: "Full multi-parameter incident dossier, AIS forensics, environmental & fleet telemetry",
  },
  {
    id: "environmental",
    title: "Environmental Impact Report",
    description: "Ecological vulnerability, sensitive coastline, and drift impact",
    focus: "Affected area, estimated volume, ecological risk, coastal sanctuary proximity, plume drift",
  },
  {
    id: "monitoring",
    title: "Monitoring / Progress Report",
    description: "Spreading dynamics, slick area change, and temporal updates",
    focus: "Current vs previous area, spreading rate, latest coordinates, tidal drift progress",
  },
  {
    id: "response",
    title: "Response & Action Report",
    description: "Containment deployment, nearby waterships, and tactical interventions",
    focus: "Nearby response fleet, distances, booming operations, dispersant status, actions taken",
  },
  {
    id: "final",
    title: "Final / Resolution Report",
    description: "Post-incident review, containment resolution, and complete chronology",
    focus: "Full chronology, total area impacted, containment outcome, post-spill verification",
  },
];

export interface OilSpillReportData {
  reportId: string;
  reportType: ReportType;
  reportTypeName: string;
  incidentId: string;
  title: string;
  vesselName: string;
  vesselImo: string;
  vesselMmsi: string;
  vesselType: string;
  vesselFlag: string;
  vesselSpeed: string;
  vesselHeading: string;
  status: "Active" | "Monitoring" | "Resolved" | string;
  severity: "critical" | "high" | "medium" | "low" | string;
  reportedDate: string;
  reportedTime: string;
  generationDate: string;
  generationTime: string;
  generationTimestampIso: string;
  locationName: string;
  latitude: number;
  longitude: number;
  areaKm2: string | number;
  previousAreaKm2?: string | number;
  areaDeltaKm2?: string | number;
  spreadRate?: string;
  estimatedVolume: string;
  oilType: string;
  confidence: number | string;
  source: string;
  modelName: string;
  modelArchitecture: string;
  detectionMethod: string;
  environmentalRisk: string;
  coastalProximity: string;
  potentialImpact: string;
  description: string;
  currentResponse: string;
  responseStatus: string;
  actionsTaken: string[];
  recommendedActions: string[];
  timeline: { time: string; event: string; status?: string }[];
  nearbyWaterships: {
    name: string;
    type: string;
    distanceNM: number;
    distanceKM: number;
    bearing: number;
    callsign: string;
  }[];
  isSimulatedDemo: boolean;
}

export interface GeneratedReportRecord {
  id: string; // Report ID
  reportType: ReportType;
  reportTypeName: string;
  incidentId: string;
  incidentTitle: string;
  generatedDate: string;
  generatedTime: string;
  timestamp: string; // e.g., "09 Sep 2026 • 09:15 UTC"
  area: string;
  severity: string;
  status: string;
  filename: string;
  reportData: OilSpillReportData;
}

/**
 * Generates an SVG Tactical Map snapshot Data URI for jsPDF rendering
 */
function createTacticalMapSvgDataUri(data: OilSpillReportData): string {
  const width = 540;
  const height = 150;
  const cx = width / 2;
  const cy = height / 2;

  const latStr = `${Math.abs(data.latitude).toFixed(3)}°${data.latitude >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(data.longitude).toFixed(3)}°${data.longitude >= 0 ? "E" : "W"}`;

  // Watership radar markers relative to center
  const shipMarkers = data.nearbyWaterships.slice(0, 4).map((ship) => {
    const angleRad = ((ship.bearing - 90) * Math.PI) / 180;
    const distPx = Math.min(100, Math.max(35, ship.distanceNM * 1.8));
    const sx = Math.round(cx + Math.cos(angleRad) * distPx);
    const sy = Math.round(cy + Math.sin(angleRad) * (distPx * 0.55));
    return `
      <circle cx="${sx}" cy="${sy}" r="3.5" fill="#f8fafc" stroke="#090d16" stroke-width="1.5" />
      <text x="${sx + 6}" y="${sy + 3}" font-family="monospace" font-size="8" fill="#cbd5e1">${ship.name} (${ship.distanceNM}NM)</text>
    `;
  }).join("");

  const isDemo = data.isSimulatedDemo ? "DEMO / SIMULATED MAP TELEMETRY" : "VERIFIED SATELLITE RADAR GRID";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#0b0f19" rx="6" stroke="#334155" stroke-width="1" />
      
      <!-- Coordinate Grid lines -->
      <line x1="0" y1="40" x2="${width}" y2="40" stroke="#1e293b" stroke-dasharray="3,3" />
      <line x1="0" y1="75" x2="${width}" y2="75" stroke="#334155" stroke-width="1" stroke-dasharray="4,4" />
      <line x1="0" y1="110" x2="${width}" y2="110" stroke="#1e293b" stroke-dasharray="3,3" />
      
      <line x1="135" y1="0" x2="135" y2="${height}" stroke="#1e293b" stroke-dasharray="3,3" />
      <line x1="270" y1="0" x2="270" y2="${height}" stroke="#334155" stroke-width="1" stroke-dasharray="4,4" />
      <line x1="405" y1="0" x2="405" y2="${height}" stroke="#1e293b" stroke-dasharray="3,3" />

      <!-- Range Rings -->
      <circle cx="${cx}" cy="${cy}" r="35" fill="none" stroke="#1e293b" stroke-width="1" />
      <circle cx="${cx}" cy="${cy}" r="65" fill="none" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />

      <!-- Spill Slick Polygon representation -->
      <ellipse cx="${cx}" cy="${cy}" rx="28" ry="16" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" stroke-width="1.8" />
      <ellipse cx="${cx + 4}" cy="${cy - 2}" rx="14" ry="8" fill="rgba(239, 68, 68, 0.45)" />
      <circle cx="${cx}" cy="${cy}" r="3" fill="#ef4444" />

      <!-- Spill Label -->
      <text x="${cx + 18}" y="${cy - 10}" font-family="monospace" font-size="9" font-weight="bold" fill="#ef4444">SPILL CORE (${data.areaKm2} km²)</text>
      <text x="${cx + 18}" y="${cy}" font-family="monospace" font-size="8" fill="#94a3b8">${latStr}, ${lngStr}</text>

      <!-- Waterships -->
      ${shipMarkers}

      <!-- Grid HUD Tags -->
      <rect x="8" y="8" width="170" height="18" fill="#090d16" rx="3" stroke="#334155" stroke-width="0.5" />
      <text x="14" y="20" font-family="monospace" font-size="7.5" fill="#94a3b8">SECTOR: ${data.locationName.slice(0, 26)}</text>
      
      <rect x="${width - 180}" y="8" width="172" height="18" fill="#090d16" rx="3" stroke="#334155" stroke-width="0.5" />
      <text x="${width - 174}" y="20" font-family="monospace" font-size="7.5" fill="#38bdf8">${isDemo}</text>

      <text x="8" y="${height - 8}" font-family="monospace" font-size="7" fill="#64748b">RADAR OVERLAY: SENTINEL-1 SAR CO-POL & AIS LIVE TRACKING</text>
      <text x="${width - 130}" y="${height - 8}" font-family="monospace" font-size="7" fill="#64748b">SCALE: 10 NM / DIV</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Builds dynamic data structure for any incident combined with active oil spill database and waterships
 */
export function buildOilSpillReportData(
  incident: {
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
  },
  assets: MaritimeAsset[] = [],
  reportType: ReportType = "detailed"
): OilSpillReportData {
  const now = new Date();
  const dateNum = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const reportId = `AM-OSR-${dateNum}-${randomSuffix}`;

  // 1. Strictly look up matching incident by ID, or coordinates, or title
  const matchedSpill = oilSpillIncidents.find(
    (s) =>
      s.id === incident.id ||
      (incident.latitude !== undefined && Math.abs(s.latitude - incident.latitude) < 0.05 && Math.abs(s.longitude - (incident.longitude || 0)) < 0.05) ||
      s.name.toLowerCase() === incident.title.toLowerCase() ||
      s.locationName.toLowerCase().includes(incident.title.toLowerCase())
  );

  const targetLat = incident.latitude ?? matchedSpill?.latitude ?? 16.42;
  const targetLng = incident.longitude ?? matchedSpill?.longitude ?? 82.85;
  const locationName = incident.locationName || matchedSpill?.locationName || incident.title;

  const nearbyWaterships = assets.map((ship) => {
    const calc = calculateDistanceAndBearing({ lat: targetLat, lng: targetLng }, { lat: ship.latitude, lng: ship.longitude });
    return {
      name: ship.name,
      callsign: ship.callsign || "VT-882",
      type: ship.vesselType || "Watership",
      distanceNM: calc.distanceNM,
      distanceKM: calc.distanceKM,
      bearing: calc.bearing,
    };
  }).sort((a, b) => a.distanceNM - b.distanceNM).slice(0, 4);

  const reportedParts = incident.reported ? incident.reported.split(",") : [matchedSpill?.date || "4 Sep 2026", matchedSpill?.time || "10:24 UTC"];
  const reportedDate = reportedParts[0]?.trim() || matchedSpill?.date || "4 Sep 2026";
  const reportedTime = reportedParts[1]?.trim() || matchedSpill?.time || "10:24 UTC";

  const genDateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const genTimeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }) + " UTC";

  let currentAreaNum = 12.4;
  if (incident.area !== undefined && incident.area !== "—") {
    currentAreaNum = typeof incident.area === "number" ? incident.area : parseFloat(String(incident.area).replace(/[^0-9.]/g, "")) || 12.4;
  } else if (matchedSpill?.estimatedAreaKm2) {
    currentAreaNum = matchedSpill.estimatedAreaKm2;
  }

  const prevAreaNum = Math.max(1.0, parseFloat((currentAreaNum * 0.76).toFixed(1)));
  const deltaNum = parseFloat((currentAreaNum - prevAreaNum).toFixed(1));

  const typeConfig = REPORT_TYPE_OPTIONS.find((t) => t.id === reportType) || REPORT_TYPE_OPTIONS[1];

  const nearestCoast = matchedSpill?.nearestCoast || `Approx. 25 NM from nearest coastal baseline near ${locationName}`;
  const envRisk = matchedSpill?.environmentalRisk || `ECOLOGICAL ALERT: Marine habitat and local fisheries near ${locationName}.`;
  const respStatus = matchedSpill?.responseStatus || `Tier-2 Response Active; maritime containment dispatched to ${locationName}.`;
  const spreadRate = matchedSpill?.spreadRate || "0.75 km²/hr (Tidal surface drift)";

  return {
    reportId,
    reportType,
    reportTypeName: typeConfig.title,
    incidentId: incident.id,
    title: incident.title,
    vesselName: incident.vessel || matchedSpill?.vesselInvolved || "Identified / Flagged Vessel",
    vesselImo: "IMO 8765432",
    vesselMmsi: "538090123",
    vesselType: "Commercial Watership",
    vesselFlag: "International Maritime Registry",
    vesselSpeed: "11.8 kts",
    vesselHeading: "210° true",
    status: incident.status || matchedSpill?.status || "Active",
    severity: incident.severity || matchedSpill?.severity || "high",
    reportedDate,
    reportedTime,
    generationDate: genDateStr,
    generationTime: genTimeStr,
    generationTimestampIso: now.toISOString(),
    locationName,
    latitude: targetLat,
    longitude: targetLng,
    areaKm2: currentAreaNum.toFixed(1),
    previousAreaKm2: prevAreaNum.toFixed(1),
    areaDeltaKm2: `+${deltaNum.toFixed(1)}`,
    spreadRate,
    estimatedVolume: matchedSpill?.estimatedVolumeTonnes || `${Math.round(currentAreaNum * 22)} tonnes`,
    oilType: matchedSpill?.oilType || "Heavy Marine Fuel Oil (VLSFO)",
    confidence: matchedSpill?.confidence || 96,
    source: matchedSpill?.detectionSource || "Sentinel-1 SAR Radar & AIS Anomaly Detection",
    modelName: "best_model.h5 (U-Net Multi-Layer Segmentation)",
    modelArchitecture: "SAR-OilNet v3.2 (256x256x3 -> 256x256x1)",
    detectionMethod: "Synthetic Aperture Radar (SAR) Deep Backscatter Inversion + Optical Contrast CLAHE",
    environmentalRisk: envRisk,
    coastalProximity: nearestCoast,
    potentialImpact: `Impact threatening coastal biodiversity, artisanal fisheries, and shoreline ecology in the ${locationName} maritime sector.`,
    description: matchedSpill?.description || `Oil slick detected by satellite radar observation in ${locationName}. Active containment underway.`,
    currentResponse: respStatus,
    responseStatus: respStatus,
    actionsTaken: [
      `Initial high-confidence SAR radar pass flagged backscatter anomaly in ${locationName}.`,
      "Nearby watership AIS deviation cross-referenced against historical transit corridors.",
      "Maritime rescue coordination center (MRCC) alerted; Notice to Mariners (NOTMAR) broadcast.",
      "Emergency high-buoyancy ocean containment booms deployed by patrol cutter on station.",
      "Continuous radar & drone aerial telemetry logging active.",
    ],
    recommendedActions: [
      "Maintain continuous Sentinel-1 and Sentinel-2 satellite recon passes at 12-hour intervals.",
      `Enforce 15 NM exclusion zone around spill core in ${locationName} for non-emergency traffic.`,
      "Mobilize high-volume vacuum skimmers to intercept trailing slick arm.",
      "Deploy shoreline protection booms at nearest estuarine inlets.",
    ],
    timeline: [
      { time: `${reportedDate}, ${reportedTime}`, event: `Initial high-confidence SAR slick signature flagged in ${locationName}.`, status: "Detected" },
      { time: `${reportedDate}, 10:48 UTC`, event: "AIS telemetry deviation logged for vessel near coordinates; automated anomaly alert triggered.", status: "Flagged" },
      { time: `${reportedDate}, 11:20 UTC`, event: "Spill spreading trajectory model initiated; nearby response waterships alerted.", status: "Dispatched" },
      { time: `${reportedDate}, 14:00 UTC`, event: "Containment booms deployed; continuous radar & drone aerial telemetry logging ongoing.", status: "Active" },
      { time: `${genDateStr}, ${genTimeStr}`, event: `Official ${typeConfig.title} compiled by aeroMarine-Ai intelligence system.`, status: "Logged" },
    ],
    nearbyWaterships,
    isSimulatedDemo: matchedSpill?.isSimulatedDemo ?? true,
  };
}

/**
 * Main PDF Generation Engine
 */
export function generateOilSpillPdf(data: OilSpillReportData): { filename: string; reportId: string } {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header background bar (Black & White Monochrome Header with thin bottom rule)
  doc.setFillColor(15, 23, 42); // Dark slate near black
  doc.rect(0, 0, pageWidth, 28, "F");

  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("aeroMarine-Ai", margin, 12);

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.setFont("helvetica", "normal");
  doc.text("MARITIME INTELLIGENCE & ENVIRONMENTAL SPILL MONITORING", margin, 18);

  // Right-aligned report header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(data.reportTypeName.toUpperCase(), pageWidth - margin, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Report ID: ${data.reportId} | Ref: ${data.incidentId}`, pageWidth - margin, 18, { align: "right" });

  y = 33;

  // Status & Classification Banner
  const isActive = data.status.toLowerCase().includes("active");
  if (isActive) {
    doc.setFillColor(239, 68, 68); // Red for Active spill
    doc.roundedRect(margin, y, contentWidth, 7.5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("● CRITICAL MARITIME ALERT: ACTIVE SPREADING OIL SPILL", margin + 3.5, y + 5);
    doc.text(`SEVERITY: ${(data.severity || "HIGH").toUpperCase()} RISK`, pageWidth - margin - 3.5, y + 5, { align: "right" });
  } else {
    doc.setFillColor(30, 41, 59); // Dark grey
    doc.roundedRect(margin, y, contentWidth, 7.5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`● STATUS: ${data.status.toUpperCase()}`, margin + 3.5, y + 5);
    doc.text(`SEVERITY: ${(data.severity || "MEDIUM").toUpperCase()} RISK`, pageWidth - margin - 3.5, y + 5, { align: "right" });
  }
  y += 11;

  // Demo Banner if simulated
  if (data.isSimulatedDemo) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, "FD");
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("[ DEMO / SIMULATED INCIDENT DATA ] — Validated AI detection pipeline simulation for maritime authorities", margin + 3, y + 3.8);
    y += 8;
  }

  // Helper section title
  const drawSectionTitle = (title: string) => {
    doc.setFillColor(241, 245, 249); // Clean light surface
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 5.5, 0.8, 0.8, "FD");
    doc.setTextColor(15, 23, 42); // Black / Dark Slate
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(title, margin + 3, y + 3.9);
    y += 7.5;
  };

  // Helper key-value row
  const drawRow = (leftKey: string, leftVal: string, rightKey: string, rightVal: string) => {
    const colWidth = contentWidth / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(leftKey, margin + 2, y);
    doc.text(rightKey, margin + colWidth + 2, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(leftVal || "Not available", margin + 36, y);
    doc.text(rightVal || "Not available", margin + colWidth + 38, y);
    y += 4.5;
  };

  // 1. INCIDENT & GENERATION IDENTIFIERS
  drawSectionTitle("1. INCIDENT & GENERATION IDENTIFIERS");
  drawRow("Report ID:", data.reportId, "Incident ID:", data.incidentId);
  drawRow("Incident Title:", data.title, "Report Type:", data.reportTypeName);
  drawRow("Detection Date:", data.reportedDate, "Detection Time:", data.reportedTime);
  drawRow("Report Date:", data.generationDate, "Report Time:", data.generationTime);
  y += 1.5;

  // 2. GEOGRAPHIC & SPILL TELEMETRY
  const latStr = `${Math.abs(data.latitude).toFixed(4)}° ${data.latitude >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(data.longitude).toFixed(4)}° ${data.longitude >= 0 ? "E" : "W"}`;
  drawSectionTitle("2. LOCATION & SPILL TELEMETRY");
  drawRow("Latitude:", latStr, "Longitude:", lngStr);
  drawRow("Location Sector:", data.locationName, "Spill Status:", data.status);
  drawRow("Affected Area:", `${data.areaKm2} km²`, "Est. Volume:", data.estimatedVolume);
  drawRow("Oil Product Type:", data.oilType, "Spreading Dynamic:", data.spreadRate || "0.85 km²/hr");
  y += 1.5;

  // SPECIFIC SECTIONS BASED ON REPORT TYPE
  if (data.reportType === "initial") {
    // INITIAL DETECTION FOCUS
    drawSectionTitle("3. INITIAL DETECTION & AI RECONNAISSANCE");
    drawRow("Detection Method:", data.detectionMethod, "AI Model Name:", data.modelName);
    drawRow("AI Confidence:", `${data.confidence}% (Validated)`, "Model Arch:", data.modelArchitecture);
    drawRow("Initial Area Flagged:", `${data.areaKm2} km²`, "Initial Severity:", `${data.severity.toUpperCase()} RISK`);
    y += 1.5;

    drawSectionTitle("4. INITIAL OPERATIONAL SUMMARY");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const initialText = doc.splitTextToSize(
      `First orbital radar observation detected an abrupt backscatter anomaly along the maritime transit lane at ${data.reportedDate}, ${data.reportedTime}. Analysis by ${data.modelName} flagged a probable petroleum hydrocarbon discharge covering approximately ${data.areaKm2} km² with ${data.confidence}% confidence. Local maritime coordination center was immediately notified.`,
      contentWidth - 4
    );
    doc.text(initialText, margin + 2, y);
    y += initialText.length * 3.8 + 2;

  } else if (data.reportType === "environmental") {
    // ENVIRONMENTAL IMPACT FOCUS
    drawSectionTitle("3. ENVIRONMENTAL VULNERABILITY & ECOLOGICAL ASSESSMENT");
    drawRow("Ecological Risk:", `${(data.severity || "HIGH").toUpperCase()} HAZARD`, "Coastal Distance:", data.coastalProximity);
    drawRow("Est. Volume Spilled:", data.estimatedVolume, "Dispersal Current:", "East-Northeast Monsoon Tidal");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Environmental Hazard:", margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(185, 28, 28);
    doc.text(data.environmentalRisk, margin + 36, y);
    y += 4.5;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Impact Statement:", margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const envImpactLines = doc.splitTextToSize(data.potentialImpact, contentWidth - 40);
    doc.text(envImpactLines, margin + 36, y);
    y += envImpactLines.length * 3.8 + 2;

  } else if (data.reportType === "monitoring") {
    // MONITORING & PROGRESS FOCUS
    drawSectionTitle("3. SPILL SPREADING & TEMPORAL MONITORING DYNAMICS");
    drawRow("Current Affected Area:", `${data.areaKm2} km²`, "Previous Area:", `${data.previousAreaKm2} km²`);
    drawRow("Area Expansion Delta:", `${data.areaDeltaKm2} km²`, "Observed Spread Rate:", data.spreadRate || "0.85 km²/hr");
    drawRow("Drift Trajectory:", "065° ENE along tidal surface", "Monitoring Cycle:", "12-hour continuous SAR");
    y += 1.5;

    drawSectionTitle("4. WEATHERING & PLUME EVAPORATION");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const monText = doc.splitTextToSize(
      `Continuous satellite SAR monitoring confirms active surface spread from ${data.previousAreaKm2} km² to ${data.areaKm2} km² (${data.areaDeltaKm2} km² delta) over recent observational cycles. Volatile light fractions have undergone approximately 18% solar evaporation, leaving viscous heavy petroleum residue concentrated along the central leading edge.`,
      contentWidth - 4
    );
    doc.text(monText, margin + 2, y);
    y += monText.length * 3.8 + 2;

  } else if (data.reportType === "response") {
    // RESPONSE & ACTION FOCUS
    drawSectionTitle("3. FLEET MOBILIZATION & CONTAINMENT ACTIONS");
    drawRow("Response Status:", data.responseStatus, "MRCC Notification:", "Broadcast Confirmed");
    drawRow("Containment Method:", "High-buoyancy ocean booms", "Dispersant Status:", "Approved on standby");
    y += 1.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Operational Actions Executed:", margin + 2, y);
    y += 4;
    data.actionsTaken.slice(0, 4).forEach((act) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(`✓ ${act}`, margin + 4, y);
      y += 3.8;
    });
    y += 1.5;

  } else if (data.reportType === "final") {
    // FINAL / RESOLUTION FOCUS
    drawSectionTitle("3. INCIDENT RESOLUTION & POST-INCIDENT AUDIT");
    drawRow("Incident Resolution:", "Contained / Remediated", "Total Impacted Area:", `${data.areaKm2} km²`);
    drawRow("Total Volume Recovered:", "Estimated 72% contained", "Final Status:", "CLOSED & LOGGED");
    y += 1.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const finalText = doc.splitTextToSize(
      `All primary containment operations completed. The slick boundary has been successfully stabilized and neutral dispersant deployment confirmed complete degradation of surface sheens. Shoreline defenses reported zero oil landfall at designated ecological sanctuaries.`,
      contentWidth - 4
    );
    doc.text(finalText, margin + 2, y);
    y += finalText.length * 3.8 + 2;

  } else {
    // DETAILED INCIDENT REPORT (COMPLETE DOSSIER)
    drawSectionTitle("3. ASSOCIATED VESSEL IDENTIFICATION (AIS / SAR)");
    drawRow("Vessel Name:", data.vesselName, "Vessel Type:", data.vesselType);
    drawRow("IMO Number:", data.vesselImo, "MMSI Code:", data.vesselMmsi);
    drawRow("Flag State:", data.vesselFlag, "Speed / Heading:", `${data.vesselSpeed} · ${data.vesselHeading}`);
    y += 1.5;

    drawSectionTitle("4. AI DETECTION & SENSOR TELEMETRY");
    drawRow("Sensor Suite:", data.source, "AI Confidence:", `${data.confidence}% (High)`);
    drawRow("AI Model:", data.modelName, "Detection Pipeline:", data.detectionMethod);
    y += 1.5;
  }

  // NEARBY WATERSHIPS PROXIMITY TABLE
  drawSectionTitle("4. NEARBY WATERSHIPS & TACTICAL RESPONSE PROXIMITY");
  if (data.nearbyWaterships && data.nearbyWaterships.length > 0) {
    data.nearbyWaterships.slice(0, 3).forEach((ship, idx) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${ship.name} [${ship.callsign}]`, margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Type: ${ship.type} | Range: ${ship.distanceNM} NM (${ship.distanceKM} km) | Bearing: ${ship.bearing}°T`, margin + 52, y);
      y += 4;
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("No active waterships detected within immediate tactical quadrant.", margin + 3, y);
    y += 4;
  }
  y += 1.5;

  // CHRONOLOGICAL TIMELINE
  drawSectionTitle("5. INCIDENT TIMELINE CHRONOLOGY");
  data.timeline.slice(0, 4).forEach((ev) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(`• [${ev.time}]`, margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(ev.event, margin + 46, y);
    y += 4;
  });
  y += 2;

  // TACTICAL MAP SNAPSHOT
  drawSectionTitle("6. TACTICAL RADAR SNAPSHOT & SPATIAL SECTOR BOUNDS");
  const mapSvgDataUri = createTacticalMapSvgDataUri(data);
  try {
    // Embed SVG tactical image
    doc.addImage(mapSvgDataUri, "SVG", margin, y, contentWidth, 28);
    y += 31;
  } catch {
    // Fallback vector drawing if image rendering fails
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`TACTICAL SECTOR: ${data.locationName}`, margin + 4, y + 8);
    doc.setTextColor(239, 68, 68);
    doc.text(`SPILL COORDINATES: ${latStr}, ${lngStr} | SLICK AREA: ${data.areaKm2} km²`, margin + 4, y + 14);
    doc.setTextColor(203, 213, 225);
    doc.setFont("helvetica", "normal");
    doc.text("Waterships in proximity: RV Samudra Explorer, MT Arabian Pioneer", margin + 4, y + 19);
    y += 27;
  }

  // Footer note
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("CONFIDENTIAL & OPERATIONAL — Generated automatically by aeroMarine-Ai Maritime Intelligence Command.", margin, pageHeight - 7);
  doc.text("Page 1 of 1", pageWidth - margin, pageHeight - 7, { align: "right" });

  // Filename format: aeroMarine-[ReportType]-[IncidentID]-[Date].pdf
  const safeType = data.reportTypeName.replace(/[^a-zA-Z0-9]/g, "");
  const safeId = data.incidentId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeDate = new Date().toISOString().slice(0, 10);
  const filename = `aeroMarine-${safeType}-${safeId}-${safeDate}.pdf`;

  doc.save(filename);

  return { filename, reportId: data.reportId };
}
