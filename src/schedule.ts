import { computePrayerTimes } from "./prayer";
import type {
  MonthScheduleOptions,
  MonthScheduleResult,
  DayPrayerRow,
  PrayerCalcOptions,
} from "./types";

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function makeDailyOptions(
  base: MonthScheduleOptions,
  day: number
): PrayerCalcOptions {
  const {
    year,
    month,
    latitude,
    longitude,
    tzOffset,

    // opsional (bisa undefined)
    altitude,
    method,
    asrMadhhab,
    ihtiyathMinutes,
    sunriseSunsetAngle,
    imsakOffsetMinutes,
    dhuhaAngleDeg,
    dhuhaEndMarginMinutes,
  } = base;

  // Sertakan hanya jika terdefinisi (bukan undefined)
  return {
    date: { year, month, day },
    latitude,
    longitude,
    tzOffset,
    ...(altitude !== undefined ? { altitude } : {}),
    ...(method !== undefined ? { method } : {}),
    ...(asrMadhhab !== undefined ? { asrMadhhab } : {}),
    ...(ihtiyathMinutes !== undefined ? { ihtiyathMinutes } : {}),
    ...(sunriseSunsetAngle !== undefined ? { sunriseSunsetAngle } : {}),
    ...(imsakOffsetMinutes !== undefined ? { imsakOffsetMinutes } : {}),
    ...(dhuhaAngleDeg !== undefined ? { dhuhaAngleDeg } : {}),
    ...(dhuhaEndMarginMinutes !== undefined ? { dhuhaEndMarginMinutes } : {}),
  };
}

/** Generate jadwal 1 bulan penuh. */
export function computeMonthSchedule(
  options: MonthScheduleOptions
): MonthScheduleResult {
  const { year, month } = options;
  const n = daysInMonth(year, month);

  const rows: DayPrayerRow[] = [];
  for (let d = 1; d <= n; d++) {
    const daily = computePrayerTimes(makeDailyOptions(options, d));
    rows.push({
      ...daily,
      date: { year, month, day: d },
    });
  }

  return { year, month, rows };
}

/** (opsional) Export ke CSV sederhana. */
export function monthScheduleToCSV(
  ms: MonthScheduleResult,
  locale = "id-ID"
): string {
  const fmt = (dt: Date | null) =>
    dt
      ? dt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      : "";

  const header = [
    "Tanggal",
    "Imsak",
    "Fajr",
    "Sunrise",
    "DhuhaStart",
    "DhuhaEnd",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
    "Qibla(deg)",
    "Method",
  ].join(",");

  const lines = ms.rows.map((r) => {
    const d = `${r.date.year}-${String(r.date.month).padStart(2, "0")}-${String(
      r.date.day
    ).padStart(2, "0")}`;
    return [
      d,
      fmt(r.imsak),
      fmt(r.fajr),
      fmt(r.sunrise),
      fmt(r.dhuhaStart),
      fmt(r.dhuhaEnd),
      fmt(r.dhuhr),
      fmt(r.asr),
      fmt(r.maghrib),
      fmt(r.isha),
      r.meta.qiblaBearingDeg.toFixed(2),
      JSON.stringify(r.meta.methodName),
    ].join(",");
  });

  return [header, ...lines].join("\n");
}
