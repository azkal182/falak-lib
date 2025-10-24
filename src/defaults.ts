// src/defaults.ts
import type { AsrMadhhab, MethodId } from "./types";

export const DEFAULTS = {
  altitude: 0,
  method: "KemenagRI" as MethodId,
  asrMadhhab: "shafii" as AsrMadhhab,
  ihtiyathMinutes: 0,
  sunriseSunsetAngle: -0.833,
  imsakOffsetMinutes: 10,
  dhuhaAngleDeg: 4.5,
  dhuhaEndMarginMinutes: 2,
};

export type FalakDefaults = typeof DEFAULTS;

let RUNTIME_DEFAULTS: FalakDefaults = { ...DEFAULTS };

export function setFalakDefaults(patch: Partial<FalakDefaults>) {
  RUNTIME_DEFAULTS = { ...RUNTIME_DEFAULTS, ...patch };
}

export function getFalakDefaults(): FalakDefaults {
  return { ...RUNTIME_DEFAULTS };
}
