import type { KpiDatum } from "../types";

export const kpiData: KpiDatum[] = [
  {
    id: "active-incidents",
    label: "Active Spills",
    value: "2",
    delta: "+0",
    deltaDirection: "flat",
    accent: "magenta",
    icon: "flame",
  },
  {
    id: "spill-area",
    label: "Active Slick Area",
    value: "61.1 km²",
    delta: "+14%",
    deltaDirection: "up",
    accent: "purple",
    icon: "waves",
  },
  {
    id: "detection-accuracy",
    label: "AI Model Precision",
    value: "97.1%",
    accent: "cyan",
    icon: "cpu",
  },
  {
    id: "historical-recorded",
    label: "Verified Incidents",
    value: "12",
    accent: "green",
    icon: "ship",
  },
];

export const weather = {
  temp: "28°C",
  condition: "Partly Cloudy",
};
