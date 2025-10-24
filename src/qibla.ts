import { d2r, r2d, normalizeDeg } from "./math";

export function qiblaBearing(latDeg: number, lonDeg: number): number {
  const φ1 = d2r(latDeg),
    λ1 = d2r(lonDeg);
  const φ2 = d2r(21.4225),
    λ2 = d2r(39.8262); // Ka'bah
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return normalizeDeg(r2d(Math.atan2(y, x)));
}
