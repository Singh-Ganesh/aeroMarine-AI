import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MaritimeAsset, MaritimeKpiSummary } from "../types/maritime";
import { initialMaritimeAssets } from "../data/maritimeAssets";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

function interpolateLatLng(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  t: number
): { lat: number; lng: number } {
  // Linear interpolation for small steps
  const lat = p1.lat + (p2.lat - p1.lat) * t;
  let lng = p1.lng + (p2.lng - p1.lng) * t;

  // Handle antimeridian crossing (-180 / 180)
  if (Math.abs(p2.lng - p1.lng) > 180) {
    if (p2.lng > p1.lng) {
      lng = (p1.lng + (p2.lng - 360 - p1.lng) * t + 360) % 360;
    } else {
      lng = (p1.lng + (p2.lng + 360 - p1.lng) * t + 360) % 360;
    }
  }

  return { lat, lng };
}

export function useMaritimeSimulation() {
  const [assets, setAssets] = useState<MaritimeAsset[]>(initialMaritimeAssets);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [tickCount, setTickCount] = useState<number>(0);
  const lastTickTime = useRef<number>(0);

  const tick = useCallback(() => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        if (asset.status === "inactive" || asset.routeCoordinates.length < 2) {
          return asset;
        }

        const coords = asset.routeCoordinates;
        let idx = asset.currentWaypointIndex;
        let progress = asset.routeProgress;

        const stepRate = 0.006 * speed;

        progress += stepRate;

        if (progress >= 1.0) {
          progress = progress - 1.0;
          idx = (idx + 1) % coords.length;
        }

        const nextIdx = (idx + 1) % coords.length;
        const currentWp = coords[idx];
        const nextWp = coords[nextIdx];

        const { lat, lng } = interpolateLatLng(currentWp, nextWp, progress);
        const heading = Math.round(calculateBearing(lat, lng, nextWp.lat, nextWp.lng));

        // Dynamic battery/fuel variation
        let newFuel = asset.telemetry.fuelOrBatteryPct;
        if (Math.random() < 0.2) {
          newFuel = Math.max(5, Math.round((newFuel - 0.05 * speed) * 10) / 10);
        }

        return {
          ...asset,
          latitude: Math.round(lat * 10000) / 10000,
          longitude: Math.round(lng * 10000) / 10000,
          heading: isNaN(heading) ? asset.heading : heading,
          currentWaypointIndex: idx,
          routeProgress: progress,
          lastUpdate: "Just now",
          telemetry: {
            ...asset.telemetry,
            headingDeg: isNaN(heading) ? asset.telemetry.headingDeg : heading,
            fuelOrBatteryPct: newFuel,
            speedKts: Math.round((asset.telemetry.speedKts + (Math.random() - 0.5) * 0.2) * 10) / 10,
          },
        };
      })
    );
    setTickCount((c) => c + 1);
    lastTickTime.current = Date.now();
  }, [speed]);

  // Periodic fetch / refresh from FastAPI backend /api/vessels
  useEffect(() => {
    let isMounted = true;

    async function fetchBackendVessels() {
      try {
        const res = await fetch("/api/vessels");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setAssets((prev) => {
              // Map backend vessels while preserving live interpolation progression if existing
              return data.map((bv: any) => {
                const existing = prev.find((p) => p.id === bv.id || p.id === bv.vesselId);
                return {
                  ...bv,
                  currentWaypointIndex: existing ? existing.currentWaypointIndex : 0,
                  routeProgress: existing ? existing.routeProgress : (bv.routeProgress || 0.1),
                  telemetry: existing?.telemetry || {
                    headingDeg: bv.heading,
                    fuelOrBatteryPct: 88,
                    signalStrengthDbm: -61,
                    transponderCode: `AIS Class-A / MMSI ${bv.mmsi}`,
                    systemHealth: "Optimal",
                    cabinOrInternalTempC: 27,
                    downlinkSpeedMbps: 22,
                    speedKts: bv.speed,
                  },
                  missionInfo: existing?.missionInfo || {
                    missionName: `${bv.name} Voyage`,
                    agencyOrOperator: bv.flag ? `${bv.flag} Maritime Registry` : "Commercial Fleet",
                    classification: "Commercial",
                    launchOrDepartureTime: "2026-09-07T08:00:00Z",
                    estimatedArrivalOrDecay: bv.eta || "2026-09-12T18:00:00Z",
                    missionPhase: "Ocean Navigation",
                    payloadSummary: "Contextual maritime shipping corridor tracking",
                  },
                };
              });
            });
          }
        }
      } catch {
        // gracefully fall back to local assets
      }
    }

    fetchBackendVessels();
    // Auto-refresh every 30 seconds
    const refreshTimer = setInterval(fetchBackendVessels, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(tick, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, tick]);

  const resetSimulation = useCallback(() => {
    setAssets(initialMaritimeAssets);
    setTickCount(0);
  }, []);

  const kpis: MaritimeKpiSummary = useMemo(() => {
    return {
      vessels: assets.filter((a) => a.type === "vessel").length,
      activeVessels: assets.filter((a) => a.status === "active").length,
      alerts: assets.filter((a) => a.status === "warning").length,
      activeOilSpills: 0,
    };
  }, [assets]);

  return {
    assets,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    tickCount,
    stepSimulation: tick,
    resetSimulation,
    kpis,
  };
}
