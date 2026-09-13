export type OilSpillStatus = "active" | "monitoring" | "historical";

export type OilSpillSeverity = "critical" | "high" | "medium" | "low";

export interface OilSpillIncident {
  id: string;
  name: string;
  status: OilSpillStatus;
  severity: OilSpillSeverity;
  latitude: number;
  longitude: number;
  estimatedAreaKm2: number;
  estimatedVolumeTonnes: string;
  date: string;
  time: string;
  oilType: string;
  year: number;
  description: string;
  vesselInvolved?: string;
  locationName: string;
  isSimulatedDemo?: boolean;
  nearestCoast?: string;
  environmentalRisk?: string;
  responseStatus?: string;
  detectionSource?: string;
  confidence?: number;
  spreadRate?: string;
  lastUpdated?: string;
  /**
   * Array of [lat, lng] coordinates forming an irregular, organic-shaped oil slick polygon
   */
  polygonCoordinates: [number, number][];
}

export interface ItopfYearStat {
  year: number;
  tankerSpillsGte7T: number;
  approxVolumeTonnes?: string;
  keyNote: string;
}

export type OilSpillTimelineFilter =
  | { mode: "active" }
  | { mode: "historical"; year: number | "all" };
