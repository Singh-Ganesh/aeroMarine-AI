import type {
  MaritimeAsset,
  AssetStatus,
  AssetTypeFilter,
  AssetStatusFilter,
  TelemetryOverview,
} from "./maritime";

export type AerospaceAsset = MaritimeAsset;
export type AerospaceKpiSummary = {
  waterships: number;
  activeWaterships: number;
  alerts: number;
  activeOilSpills: number;
};
export type { AssetStatus, AssetTypeFilter, AssetStatusFilter, TelemetryOverview };
