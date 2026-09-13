export type AssetStatus = "active" | "inactive" | "warning";
export type VesselType = "Cargo" | "Tanker" | "Container" | "LNG" | "Bulk Carrier" | "Research Vessel";

export interface LatLng { lat: number; lng: number; label?: string; }
export interface MissionInfo {
  missionName: string; agencyOrOperator: string; classification: "Civilian" | "Commercial" | "Scientific" | "Surveillance";
  launchOrDepartureTime: string; estimatedArrivalOrDecay: string; missionPhase: string; payloadSummary: string;
}
export interface TelemetryOverview {
  headingDeg: number; fuelOrBatteryPct: number; signalStrengthDbm: number;
  transponderCode: string; systemHealth: "Optimal" | "Nominal" | "Degraded" | "Alert"; cabinOrInternalTempC: number;
  downlinkSpeedMbps: number; speedKts: number;
}
export interface AisPosition {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  course?: number;
}

export interface MaritimeAsset {
  id: string;
  name: string;
  callsign: string;
  type: "vessel";
  vesselType: VesselType;
  imo: string;
  mmsi: string;
  flag?: string;
  eta?: string;
  draftMeters?: number;
  beamMeters?: number;
  latitude: number;
  longitude: number;
  speed: number;
  speedUnit?: string;
  heading: number;
  status: AssetStatus;
  destination: string;
  origin?: string;
  lastUpdate: string;
  routeCoordinates: LatLng[];
  positions?: AisPosition[];
  currentWaypointIndex: number;
  routeProgress: number;
  completedDistanceKm?: number;
  totalDistanceKm?: number;
  missionInfo: MissionInfo;
  telemetry: TelemetryOverview;
  warningDetails?: string;
  dataSource?: string;
  isSimulatedDemo?: boolean;
  trackPointsCount?: number;
  trackStart?: string;
  trackEnd?: string;
}
export type AssetTypeFilter = "all" | "vessel";
export type AssetStatusFilter = "all" | AssetStatus;
export interface MaritimeKpiSummary { vessels: number; activeVessels: number; alerts: number; activeOilSpills: number; }
