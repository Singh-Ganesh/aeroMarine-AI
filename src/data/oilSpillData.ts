import type { ItopfYearStat, OilSpillIncident } from "../types/oilSpill";
import { historicalOilSpillIncidents } from "./historicalOilSpills";

export { historicalOilSpillIncidents };

function createIrregularSlickPolygon(
  centerLat: number,
  centerLng: number,
  radiusLatKm: number,
  radiusLngKm: number,
  irregularFactors: number[]
): [number, number][] {
  const KM_PER_LAT = 111.0;
  const kmPerLng = 111.0 * Math.cos((centerLat * Math.PI) / 180);
  const n = irregularFactors.length;

  return irregularFactors.map((factor, i) => {
    const angle = (i / n) * 2 * Math.PI;
    const rLat = (radiusLatKm * factor) / KM_PER_LAT;
    const rLng = (radiusLngKm * factor) / kmPerLng;

    const lat = centerLat + Math.sin(angle) * rLat;
    const lng = centerLng + Math.cos(angle) * rLng;
    return [Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000];
  });
}

const ORGANIC_SLICK_LOBES_1 = [
  1.0, 1.25, 1.4, 1.15, 0.9, 0.75, 1.1, 1.35, 1.5, 1.2, 0.85, 0.7, 0.95, 1.3, 1.1, 0.8,
];
const ORGANIC_SLICK_LOBES_2 = [
  1.1, 0.85, 0.7, 1.05, 1.3, 1.45, 1.2, 0.9, 0.75, 0.95, 1.25, 1.4, 1.15, 0.8, 0.95, 1.2,
];
const ORGANIC_SLICK_LOBES_3 = [
  1.3, 1.45, 1.1, 0.8, 0.65, 0.9, 1.2, 1.4, 1.15, 0.75, 0.85, 1.1, 1.35, 1.2, 0.95, 1.15,
];

export const activeAndMonitoringSpills: OilSpillIncident[] = [
  // =========================================================================
  // 1. ACTIVE / CURRENTLY SPREADING SPILLS (RED - SIMULATED DEMO DATA)
  // =========================================================================
  {
    id: "OS-2026-BOB-01",
    name: "Oil Spill — Bay of Bengal",
    status: "active",
    severity: "high",
    latitude: 16.42,
    longitude: 82.85,
    estimatedAreaKm2: 12.4,
    estimatedVolumeTonnes: "320 tonnes",
    date: "4 Sep 2026",
    time: "10:24 UTC",
    oilType: "Marine Gasoil & Bunker Sludge",
    year: 2026,
    locationName: "Bay of Bengal Offshore Sector (Visakhapatnam EEZ)",
    vesselInvolved: "MV Seabreeze (Flag: Marshall Islands [MH], IMO 8765432)",
    description:
      "Active spreading slick detected by Sentinel-1 SAR reconnaissance along primary Bay of Bengal shipping corridor. Tidal spreading eastward toward international shipping channel.",
    isSimulatedDemo: true,
    nearestCoast: "38.2 NM West-Northwest of Kakinada shoreline",
    environmentalRisk: "CRITICAL HAZARD: Coastal mangrove sanctuary and sea turtle breeding corridor within 38 NM.",
    responseStatus: "Tier-2 Regional Response Mobilized; containment booms deployed by patrol cutter RV Samudra Explorer.",
    detectionSource: "Sentinel-1 SAR Radar & AIS Anomaly Detection",
    confidence: 96,
    spreadRate: "0.85 km²/hr (East-Northeast drift)",
    lastUpdated: "4 Sep 2026, 14:00 UTC",
    polygonCoordinates: createIrregularSlickPolygon(
      16.42,
      82.85,
      2.7,
      3.9,
      ORGANIC_SLICK_LOBES_2
    ),
  },
  {
    id: "OS-2026-MUM-02",
    name: "Oil Spill — Mumbai Coast",
    status: "active",
    severity: "critical",
    latitude: 18.89,
    longitude: 72.48,
    estimatedAreaKm2: 24.8,
    estimatedVolumeTonnes: "540 tonnes",
    date: "5 Sep 2026",
    time: "07:15 UTC",
    oilType: "Heavy Crude & Sludge Residue",
    year: 2026,
    locationName: "Indian Ocean near Mumbai Coast (Jawaharlal Nehru Port Approach)",
    vesselInvolved: "MT Arabian Pioneer (Flag: Liberia [LR], IMO 9412389)",
    description:
      "Heavy crude oil discharge detected at outer anchorage fairway following hull breach during anchor dragging in heavy swells. Immediate containment booms deployed.",
    isSimulatedDemo: true,
    nearestCoast: "14.5 NM West of Alibaug & Mumbai Harbor",
    environmentalRisk: "CRITICAL RISK: High threat to estuarine fishing grounds, Elephanta coastal ecosystem, and Mumbai port approaches.",
    responseStatus: "Tier-1 Port Emergency Deployed; skimming vessels and boom barriers deployed by Mumbai Port Trust.",
    detectionSource: "Sentinel-1 SAR Radar & Optical Sentinel-2 Verification",
    confidence: 98,
    spreadRate: "1.2 km²/hr (North-Northeast drift)",
    lastUpdated: "5 Sep 2026, 12:30 UTC",
    polygonCoordinates: createIrregularSlickPolygon(
      18.89,
      72.48,
      3.2,
      4.8,
      ORGANIC_SLICK_LOBES_1
    ),
  },
  {
    id: "OS-2026-KUTCH-03",
    name: "Oil Spill — Gulf of Kutch",
    status: "active",
    severity: "high",
    latitude: 22.58,
    longitude: 69.32,
    estimatedAreaKm2: 16.5,
    estimatedVolumeTonnes: "290 tonnes",
    date: "6 Sep 2026",
    time: "14:50 UTC",
    oilType: "Very Low Sulphur Fuel Oil (VLSFO)",
    year: 2026,
    locationName: "Gulf of Kutch Marine Sanctuary Approach (Vadinar Terminal)",
    vesselInvolved: "MV Indus Trader (Flag: Panama [PA], IMO 9184520)",
    description:
      "Bunker fuel discharge during ship-to-ship transfer in Vadinar tanker fairway. Slick trajectory drifting southeast toward coral reefs of Marine National Park.",
    isSimulatedDemo: true,
    nearestCoast: "9.2 NM Northwest of Marine National Park, Jamnagar",
    environmentalRisk: "EXTREME BIODIVERSITY RISK: Marine National Park corals and mangrove buffers within 10 NM.",
    responseStatus: "Tier-2 Response Active; Indian Coast Guard pollution response vessel ICGS Samudra Paheredar on scene.",
    detectionSource: "U-Net Satellite Segmentation & Coastal Surveillance Radar",
    confidence: 95,
    spreadRate: "0.65 km²/hr (Southeast tidal current)",
    lastUpdated: "6 Sep 2026, 18:20 UTC",
    polygonCoordinates: createIrregularSlickPolygon(
      22.58,
      69.32,
      2.5,
      3.6,
      ORGANIC_SLICK_LOBES_3
    ),
  },
  {
    id: "OS-2024-001",
    name: "Oil Spill — Singapore Strait",
    status: "active",
    severity: "critical",
    latitude: 1.264,
    longitude: 103.82,
    estimatedAreaKm2: 42.6,
    estimatedVolumeTonnes: "850 tonnes",
    date: "14 June 2024",
    time: "08:42 UTC",
    oilType: "Fuel Oil (Heavy VLSFO)",
    year: 2024,
    locationName: "Singapore Strait / South China Sea Gateway",
    vesselInvolved: "Simulated Tanker Collision (DEMO)",
    description:
      "Active uncontained fuel oil discharge spreading eastward along tidal currents in the international fairway. Booming operations deployed; skimming vessels requested.",
    isSimulatedDemo: true,
    nearestCoast: "6.5 NM South of Sentosa & Pasir Panjang",
    environmentalRisk: "HIGH RISK: International maritime fairway and nearby coastal resort beaches.",
    responseStatus: "Tier-3 International Response; MPA Singapore crisis center active.",
    detectionSource: "Sentinel-1 SAR Radar & AIS Anomaly Detection",
    confidence: 97,
    spreadRate: "1.4 km²/hr (Eastward tidal drift)",
    lastUpdated: "14 June 2024, 16:00 UTC",
    polygonCoordinates: createIrregularSlickPolygon(
      1.264,
      103.82,
      3.8,
      5.6,
      ORGANIC_SLICK_LOBES_1
    ),
  },

  // =========================================================================
  // 2. RECENT / UNDER MONITORING SPILLS (ORANGE - SIMULATED / REAL DATA)
  // =========================================================================
  {
    id: "OS-2026-CHN-04",
    name: "Oil Spill — Chennai Coast",
    status: "monitoring",
    severity: "medium",
    latitude: 13.22,
    longitude: 80.36,
    estimatedAreaKm2: 8.9,
    estimatedVolumeTonnes: "140 tonnes",
    date: "7 Sep 2026",
    time: "04:30 UTC",
    oilType: "Refined Light Petroleum Sheen",
    year: 2026,
    locationName: "Chennai / Bay of Bengal Coast (Ennore Port Channel)",
    vesselInvolved: "MT Coral Dawn (Flag: India [IN], IMO 9256741)",
    description:
      "Residual light sheen under continuous containment monitoring following localized bilge runoff. Tidal booming deployed across Ennore creek mouth to prevent inland intrusion.",
    isSimulatedDemo: true,
    nearestCoast: "4.8 NM East of Ennore Thermal & Creek Estuary",
    environmentalRisk: "MODERATE RISK: Ennore creek artisanal fisheries and Pulicat lagoon bird sanctuary 18 NM north.",
    responseStatus: "Containment booms holding; sorbent sweeps active; monitoring natural solar weathering.",
    detectionSource: "Sentinel-1 SAR Radar & Coastal AIS Patrol",
    confidence: 94,
    spreadRate: "0.2 km²/hr (plume concentration diminishing)",
    lastUpdated: "7 Sep 2026, 11:00 UTC",
    polygonCoordinates: createIrregularSlickPolygon(
      13.22,
      80.36,
      1.8,
      2.6,
      ORGANIC_SLICK_LOBES_2
    ),
  },
  {
    id: "OS-2026-KOC-05",
    name: "Oil Spill — Kochi Coast",
    status: "monitoring",
    severity: "medium",
    latitude: 9.95,
    longitude: 76.12,
    estimatedAreaKm2: 7.2,
    estimatedVolumeTonnes: "110 tonnes",
    date: "7 Sep 2026",
    time: "16:20 UTC",
    oilType: "Medium Marine Diesel Oil (MDO)",
    year: 2026,
    locationName: "Kochi / Arabian Sea Coast (Wellington Island Fairway)",
    vesselInvolved: "MV Eastern Wind (Flag: Singapore [SG], IMO 9345123)",
    description:
      "Treated diesel slick undergoing secondary recovery and dispersant observation. 75% of volatile sheen evaporated; residual containment barriers in place.",
    isSimulatedDemo: true,
    nearestCoast: "5.2 NM West of Fort Kochi entrance channel",
    environmentalRisk: "LOCALIZED RISK: Kochi backwaters inlet and coastal tourism shoreline.",
    responseStatus: "Secondary Skimming in Progress; Marine Police & Port Trust monitoring perimeter.",
    detectionSource: "Sentinel-1 SAR Radar & Drone Surveillance",
    confidence: 93,
    spreadRate: "0.15 km²/hr (dissipating)",
    lastUpdated: "8 Sep 2026, 08:30 UTC",
    polygonCoordinates: createIrregularSlickPolygon(
      9.95,
      76.12,
      1.6,
      2.4,
      ORGANIC_SLICK_LOBES_1
    ),
  },
  {
    id: "OS-2026-MON-01",
    name: "Oil Spill — Arabian Sea Deepwater",
    status: "monitoring",
    severity: "medium",
    latitude: 21.8,
    longitude: 64.5,
    estimatedAreaKm2: 14.2,
    estimatedVolumeTonnes: "180 tonnes",
    date: "6 Sep 2026",
    time: "09:10 UTC",
    oilType: "Refined Petroleum Sheen",
    year: 2026,
    locationName: "Open Arabian Sea Deepwater Corridor",
    vesselInvolved: "MT Arabian Transporter (Cleared Quarantine)",
    description:
      "Residual light petroleum sheen under active tracking in international waters. Natural weathering, wave turbulence, and solar evaporation reducing plume concentration.",
    isSimulatedDemo: false,
    nearestCoast: "120 NM South of Pakistani EEZ / 180 NM West of Gujarat",
    environmentalRisk: "LOW COASTAL RISK: Deepwater pelagic environment; far from continental coastline.",
    responseStatus: "Satellite Orbit Tracking Active; natural weathering reducing slick volume.",
    detectionSource: "Sentinel-1 Synthetic Aperture Radar Reconnaissance",
    confidence: 96,
    spreadRate: "0.3 km²/hr (Weathering / Dispersing)",
    lastUpdated: "6 Sep 2026, 15:45 UTC",
    polygonCoordinates: createIrregularSlickPolygon(
      21.8,
      64.5,
      2.4,
      3.4,
      ORGANIC_SLICK_LOBES_3
    ),
  },
];

export const oilSpillIncidents: OilSpillIncident[] = [
  ...activeAndMonitoringSpills,
  ...historicalOilSpillIncidents,
];

export const itopfAnnualStats: Record<number, ItopfYearStat> = {
  2016: {
    year: 2016,
    tankerSpillsGte7T: 5,
    approxVolumeTonnes: "~6,000 tonnes",
    keyNote: "5 tanker spills ≥7 tonnes globally.",
  },
  2017: {
    year: 2017,
    tankerSpillsGte7T: 6,
    approxVolumeTonnes: "~7,000 tonnes",
    keyNote: "6 tanker spills ≥7 tonnes globally.",
  },
  2018: {
    year: 2018,
    tankerSpillsGte7T: 7,
    approxVolumeTonnes: "~116,000 tonnes",
    keyNote:
      "7 tanker spills ≥7 tonnes globally. Total strongly affected by Sanchi (~113,000 tonnes).",
  },
  2019: {
    year: 2019,
    tankerSpillsGte7T: 3,
    approxVolumeTonnes: "~1,000 tonnes",
    keyNote: "3 tanker spills ≥7 tonnes globally. One of the lowest volume years on record.",
  },
  2020: {
    year: 2020,
    tankerSpillsGte7T: 4,
    approxVolumeTonnes: "~3,000 tonnes",
    keyNote: "4 tanker spills ≥7 tonnes globally (including Wakashio and New Diamond).",
  },
  2021: {
    year: 2021,
    tankerSpillsGte7T: 6,
    approxVolumeTonnes: "~10,000 tonnes",
    keyNote: "6 tanker spills ≥7 tonnes globally (including X-Press Pearl).",
  },
  2022: {
    year: 2022,
    tankerSpillsGte7T: 7,
    approxVolumeTonnes: "~15,000 tonnes",
    keyNote: "7 tanker spills ≥7 tonnes globally (~15,000 tonnes total volume reported by ITOPF).",
  },
  2023: {
    year: 2023,
    tankerSpillsGte7T: 10,
    approxVolumeTonnes: "~2,000 tonnes",
    keyNote: "10 tanker spills ≥7 tonnes globally (~2,000 tonnes total volume reported by ITOPF).",
  },
  2024: {
    year: 2024,
    tankerSpillsGte7T: 10,
    approxVolumeTonnes: "~10,000 tonnes",
    keyNote: "10 tanker spills ≥7 tonnes globally (~10,000 tonnes total volume reported by ITOPF).",
  },
  2025: {
    year: 2025,
    tankerSpillsGte7T: 6,
    approxVolumeTonnes: "~4,000 tonnes",
    keyNote: "6 tanker spills ≥7 tonnes globally (~4,000 tonnes total volume reported by ITOPF).",
  },
};

export const ITOPF_DISCLAIMER =
  "These annual statistics represent tanker/combined-carrier/barge incidents and should NOT be presented as every oil spill occurring in the world's oceans.";
