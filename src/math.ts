export const d2r = (d: number) => (Math.PI / 180) * d;
export const r2d = (r: number) => (180 / Math.PI) * r;
export const normalizeDeg = (x: number) => ((x % 360) + 360) % 360;
export const clamp = (x: number, a: number, b: number) =>
  Math.max(a, Math.min(b, x));

export function jdFromDate(y: number, m: number, d: number): number {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    B -
    1524.5
  );
}

export function hoursToDate(
  base: { y: number; m: number; d: number },
  hours: number,
  tzOffset: number
): Date {
  // "hours" adalah jam lokal (0..24). Konversi ke instan Date UTC.
  const date = new Date(Date.UTC(base.y, base.m - 1, base.d, 0, 0, 0));
  const h = ((hours % 24) + 24) % 24;
  date.setUTCHours(h - tzOffset, Math.round((h % 1) * 60), 0, 0);
  return date;
}
