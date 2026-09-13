export function interpolateRoute(
  route: { x: number; y: number }[],
  t: number
): { x: number; y: number; heading: number } {
  if (route.length < 2) return { x: route[0]?.x ?? 0, y: route[0]?.y ?? 0, heading: 0 };
  const clamped = Math.min(1, Math.max(0, t));
  const segments = route.length - 1;
  const scaled = clamped * segments;
  const idx = Math.min(segments - 1, Math.floor(scaled));
  const localT = scaled - idx;
  const a = route[idx];
  const b = route[idx + 1];
  const x = a.x + (b.x - a.x) * localT;
  const y = a.y + (b.y - a.y) * localT;
  const heading = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90;
  return { x, y, heading };
}

export function routeToPath(route: { x: number; y: number }[]) {
  return route.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}
