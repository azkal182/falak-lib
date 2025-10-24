// src/prayer.ts
import { d2r, r2d, jdFromDate, hoursToDate } from "./math";
import {
  solarDeclinationAndEoT,
  hourAngleForAltitude,
  hourAngleForAsr,
  solarNoonHours,
} from "./solar";
import { qiblaBearing } from "./qibla";
import { resolveMethod } from "./methods";
import { getFalakDefaults } from "./defaults";
import type { PrayerCalcOptions, PrayerTimesResult } from "./types";

export function computePrayerTimes(opts: PrayerCalcOptions): PrayerTimesResult {
  // Merge defaults untuk semua opsi opsional
  const merged = { ...getFalakDefaults(), ...opts };

  const {
    // wajib
    date,
    latitude,
    longitude,
    tzOffset,
    // opsional (sudah ada default dari merged)
    altitude,
    method: mOpt,
    asrMadhhab,
    ihtiyathMinutes,
    sunriseSunsetAngle,
    imsakOffsetMinutes,
    dhuhaAngleDeg,
    dhuhaEndMarginMinutes,
  } = merged;

  const { y, m, d } = toYMD(date);
  const method = resolveMethod(mOpt);
  const latR = d2r(latitude);

  // JD 0h UTC
  const jd = jdFromDate(y, m, d);

  // 2-pass sekitar zawaal
  let { dec, eotMin } = solarDeclinationAndEoT(jd);
  let noonH = solarNoonHours(tzOffset, longitude, eotMin);
  const jdNoonApprox = jd + (noonH - tzOffset) / 24;
  ({ dec, eotMin } = solarDeclinationAndEoT(jdNoonApprox));
  noonH = solarNoonHours(tzOffset, longitude, eotMin);

  // koreksi horizon karena altitude
  const altCorrDeg = -r2d(Math.acos(6371000 / (6371000 + altitude)));
  const h0_sun = sunriseSunsetAngle - altCorrDeg;

  // Sunrise/Sunset
  const H_sun = hourAngleForAltitude(latR, dec, h0_sun);
  const sunriseH = noonH - H_sun / 15;
  const sunsetH = noonH + H_sun / 15;

  // Dhuhr
  const dhuhrH = noonH;

  // Fajr / Isha
  const H_fajr = hourAngleForAltitude(latR, dec, -method.fajr);
  const fajrH = noonH - H_fajr / 15;

  let ishaH: number;
  if (method.isha.interval) {
    ishaH = sunsetH + (method.isha.interval as number) / 60;
  } else {
    const H_isha = hourAngleForAltitude(
      latR,
      dec,
      -(method.isha.angle as number)
    );
    ishaH = noonH + H_isha / 15;
  }

  // Asr
  const asrFactor = asrMadhhab === "hanafi" ? 2 : 1;
  const H_asr = hourAngleForAsr(latR, dec, asrFactor);
  const asrH = noonH + H_asr / 15;

  // Imsak (offset dari Fajr)
  const imsakH = fajrH - imsakOffsetMinutes / 60;

  // Dhuha (awal pada +dhuhaAngleDeg, akhir mendekati Dhuhr)
  const H_dhuhaStart = hourAngleForAltitude(latR, dec, +dhuhaAngleDeg);
  const dhuhaStartH = Math.max(sunriseH, noonH - H_dhuhaStart / 15);
  const dhuhaEndH = Math.max(dhuhaStartH, dhuhrH - dhuhaEndMarginMinutes / 60);

  const addMin = (t: number, m: number) => t + m / 60;
  const base = { y, m, d };
  const mk = (h: number | null | undefined) =>
    isFiniteNum(h) ? hoursToDate(base, h!, tzOffset) : null;

  return {
    imsak: mk(imsakH),
    fajr: mk(addMin(fajrH, ihtiyathMinutes)),
    sunrise: mk(sunriseH),
    dhuhaStart: mk(dhuhaStartH),
    dhuhaEnd: mk(dhuhaEndH),
    dhuhr: mk(addMin(dhuhrH, ihtiyathMinutes)),
    asr: mk(addMin(asrH, ihtiyathMinutes)),
    maghrib: mk(sunsetH),
    isha: mk(addMin(ishaH, ihtiyathMinutes)),
    meta: {
      methodName: method.name,
      usedIhtiyath: ihtiyathMinutes > 0,
      sunriseSetAngle: h0_sun,
      qiblaBearingDeg: qiblaBearing(latitude, longitude),
      notes: [
        `Imsak = Fajr - ${imsakOffsetMinutes} menit`,
        `DhuhaStart pada +${dhuhaAngleDeg}°; DhuhaEnd ${dhuhaEndMarginMinutes} menit sebelum Dhuhr`,
      ],
    },
  };
}

function toYMD(date: PrayerCalcOptions["date"]) {
  if (date instanceof Date)
    return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
  return { y: date.year, m: date.month, d: date.day };
}
function isFiniteNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}
