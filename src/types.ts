export type RiskLevel = "high" | "medium" | "low";

export interface Incident {
  id: string;
  title: string;
  area: number;
  confidence: number;
  detected: string;
  polygon: { x: number; y: number }[];
  center: { x: number; y: number };
  severity: RiskLevel;
}

export type NotificationSeverity = "critical" | "warning" | "info" | "success";

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  location?: string;
  incidentId?: string;
  vesselId?: string;
  targetSection?: SectionKey;
  isSimulatedDemo?: boolean;
}

export interface KpiDatum {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  sub?: string;
  accent: "cyan" | "magenta" | "purple" | "amber" | "green";
  icon: string;
}

export type SectionKey =
  | "live-monitor"
  | "oil-spill"
  | "incident-reports"
  | "analytics"
  | "settings";

export type Theme = "dark" | "light";

export * from "./types/maritime";

