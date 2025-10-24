import { d2r, r2d, normalizeDeg, clamp } from "./math";

export function solarDeclinationAndEoT(jd: number): {
  dec: number;
  eotMin: number;
} {
  const n = jd - 2451545.0;
  const L = d2r(normalizeDeg(280.46 + 0.9856474 * n));
  const g = d2r(normalizeDeg(357.528 + 0.9856003 * n));
  const lam = L + d2r(1.915) * Math.sin(g) + d2r(0.02) * Math.sin(2 * g);
  const eps = d2r(23.439 - 0.0000004 * n);
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  let E = normalizeDeg(r2d(L) - r2d(ra));
  if (E > 180) E -= 360;
  return { dec, eotMin: 4 * E };
}

export function hourAngleForAltitude(
  latRad: number,
  dec: number,
  h0Deg: number
): number {
  const h0 = d2r(h0Deg);
  const cosH =
    (Math.sin(h0) - Math.sin(latRad) * Math.sin(dec)) /
    (Math.cos(latRad) * Math.cos(dec));
  return r2d(Math.acos(clamp(cosH, -1, 1)));
}

export function hourAngleForAsr(
  latRad: number,
  dec: number,
  factor: number
): number {
  const phi = Math.abs(r2d(latRad - dec));
  const hAsrDeg = r2d(Math.atan(1 / (factor + Math.tan(d2r(phi)))));
  return hourAngleForAltitude(latRad, dec, hAsrDeg);
}

export const solarNoonHours = (tz: number, lonDeg: number, eotMin: number) =>
  12 + tz - lonDeg / 15 - eotMin / 60;
