// Converts the app's original stylized 1000x600 scene coordinates into real
// Bay of Bengal lat/lon, so vessel routes and the spill polygon plot onto an
// actual map without needing to hand-place every point.

const LAT_MAX = 18.6;
const LAT_MIN = 15.2;
const LON_MIN = 80.6;
const LON_MAX = 85.2;

export interface LatLng {
  lat: number;
  lng: number;
}

export function sceneToLatLng(x: number, y: number): LatLng {
  return {
    lat: LAT_MAX - (y / 600) * (LAT_MAX - LAT_MIN),
    lng: LON_MIN + (x / 1000) * (LON_MAX - LON_MIN),
  };
}

export const MAP_CENTER: [number, number] = [17.1, 82.6];
export const MAP_DEFAULT_ZOOM = 8;

export const REAL_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
  { name: "Kakinada", lat: 16.9891, lng: 82.2475 },
  { name: "Rajahmundry", lat: 17.0005, lng: 81.804 },
];

export const MONITORING_CENTER: { name: string; lat: number; lng: number } = {
  name: "Visakhapatnam Maritime Ops Center",
  lat: 17.6868,
  lng: 83.2185,
};

export function calculateDistanceAndBearing(
  center: { lat: number; lng: number },
  target: { lat: number; lng: number }
) {
  const R_NM = 3440.065; // Earth radius in nautical miles
  const R_KM = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLat = toRad(target.lat - center.lat);
  const dLng = toRad(target.lng - center.lng);
  const lat1 = toRad(center.lat);
  const lat2 = toRad(target.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceNM = Math.round(R_NM * c * 10) / 10;
  const distanceKM = Math.round(R_KM * c * 10) / 10;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = Math.round((toDeg(Math.atan2(y, x)) + 360) % 360);

  return { distanceNM, distanceKM, bearing };
}

