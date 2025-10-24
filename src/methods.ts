import type { MethodDef, MethodId } from "./types";

export const METHODS: Record<MethodId, MethodDef> = {
  MWL: { name: "MWL", fajr: 18, isha: { angle: 17 } },
  Egyptian: { name: "Egyptian", fajr: 19.5, isha: { angle: 17.5 } },
  Karachi: { name: "Karachi", fajr: 18, isha: { angle: 18 } },
  ISNA: { name: "ISNA", fajr: 15, isha: { angle: 15 } },
  UmmAlQura: { name: "Umm al-Qura", fajr: 18.5, isha: { interval: 90 } },
  KemenagRI: { name: "Kemenag RI", fajr: 20, isha: { angle: 18 } },
};

export function resolveMethod(m?: MethodId | MethodDef): MethodDef {
  if (!m) return METHODS.KemenagRI;
  return typeof m === "string" ? METHODS[m] : m;
}
