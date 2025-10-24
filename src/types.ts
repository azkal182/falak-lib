// src/types.ts
export type AsrMadhhab = "shafii" | "hanafi";

export interface MethodDef {
  name: string;
  fajr: number; // derajat (mis. 18 => -18°)
  isha: { angle?: number; interval?: number }; // salah satu wajib
}

export type MethodId =
  | "MWL"
  | "Egyptian"
  | "Karachi"
  | "ISNA"
  | "UmmAlQura"
  | "KemenagRI";

export interface PrayerCalcOptions {
  // WAJIB (tanpa default):
  date: Date | { year: number; month: number; day: number };
  latitude: number;
  longitude: number;
  tzOffset: number; // contoh 7 untuk WIB

  // OPSIONAL (semua punya default):
  altitude?: number; // default 0 (meter)
  method?: MethodId | MethodDef; // default 'KemenagRI'
  asrMadhhab?: AsrMadhhab; // default 'shafii'
  ihtiyathMinutes?: number; // default 0
  sunriseSunsetAngle?: number; // default -0.833
  imsakOffsetMinutes?: number; // default 10 (menit sebelum Fajr)
  dhuhaAngleDeg?: number; // default 4.5 (awal dhuha pada +4.5°)
  dhuhaEndMarginMinutes?: number; // default 2 (menit sebelum Dhuhr)
}

export interface PrayerTimesResult {
  imsak: Date | null;
  fajr: Date | null;
  sunrise: Date | null;
  dhuhaStart: Date | null;
  dhuhaEnd: Date | null;
  dhuhr: Date | null;
  asr: Date | null;
  maghrib: Date | null;
  isha: Date | null;
  meta: {
    methodName: string;
    usedIhtiyath: boolean;
    sunriseSetAngle: number;
    qiblaBearingDeg: number;
    notes: string[];
  };
}

export interface MonthScheduleOptions extends Omit<PrayerCalcOptions, "date"> {
  year: number; // tahun, mis. 2025
  month: number; // 1..12
}

export interface DayPrayerRow extends PrayerTimesResult {
  date: { year: number; month: number; day: number }; // tanggal lokal
}

export interface MonthScheduleResult {
  year: number;
  month: number; // 1..12
  rows: DayPrayerRow[]; // urut 1..n
}
