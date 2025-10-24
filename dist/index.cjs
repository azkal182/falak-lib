'use strict';

// src/math.ts
var d2r = (d) => Math.PI / 180 * d;
var r2d = (r) => 180 / Math.PI * r;
var normalizeDeg = (x) => (x % 360 + 360) % 360;
var clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function jdFromDate(y, m, d) {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
function hoursToDate(base, hours, tzOffset) {
  const date = new Date(Date.UTC(base.y, base.m - 1, base.d, 0, 0, 0));
  const h = (hours % 24 + 24) % 24;
  date.setUTCHours(h - tzOffset, Math.round(h % 1 * 60), 0, 0);
  return date;
}

// src/solar.ts
function solarDeclinationAndEoT(jd) {
  const n = jd - 2451545;
  const L = d2r(normalizeDeg(280.46 + 0.9856474 * n));
  const g = d2r(normalizeDeg(357.528 + 0.9856003 * n));
  const lam = L + d2r(1.915) * Math.sin(g) + d2r(0.02) * Math.sin(2 * g);
  const eps = d2r(23.439 - 4e-7 * n);
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  let E = normalizeDeg(r2d(L) - r2d(ra));
  if (E > 180) E -= 360;
  return { dec, eotMin: 4 * E };
}
function hourAngleForAltitude(latRad, dec, h0Deg) {
  const h0 = d2r(h0Deg);
  const cosH = (Math.sin(h0) - Math.sin(latRad) * Math.sin(dec)) / (Math.cos(latRad) * Math.cos(dec));
  return r2d(Math.acos(clamp(cosH, -1, 1)));
}
function hourAngleForAsr(latRad, dec, factor) {
  const phi = Math.abs(r2d(latRad - dec));
  const hAsrDeg = r2d(Math.atan(1 / (factor + Math.tan(d2r(phi)))));
  return hourAngleForAltitude(latRad, dec, hAsrDeg);
}
var solarNoonHours = (tz, lonDeg, eotMin) => 12 + tz - lonDeg / 15 - eotMin / 60;

// src/qibla.ts
function qiblaBearing(latDeg, lonDeg) {
  const \u03C61 = d2r(latDeg), \u03BB1 = d2r(lonDeg);
  const \u03C62 = d2r(21.4225), \u03BB2 = d2r(39.8262);
  const y = Math.sin(\u03BB2 - \u03BB1) * Math.cos(\u03C62);
  const x = Math.cos(\u03C61) * Math.sin(\u03C62) - Math.sin(\u03C61) * Math.cos(\u03C62) * Math.cos(\u03BB2 - \u03BB1);
  return normalizeDeg(r2d(Math.atan2(y, x)));
}

// src/methods.ts
var METHODS = {
  MWL: { name: "MWL", fajr: 18, isha: { angle: 17 } },
  Egyptian: { name: "Egyptian", fajr: 19.5, isha: { angle: 17.5 } },
  Karachi: { name: "Karachi", fajr: 18, isha: { angle: 18 } },
  ISNA: { name: "ISNA", fajr: 15, isha: { angle: 15 } },
  UmmAlQura: { name: "Umm al-Qura", fajr: 18.5, isha: { interval: 90 } },
  KemenagRI: { name: "Kemenag RI", fajr: 20, isha: { angle: 18 } }
};
function resolveMethod(m) {
  if (!m) return METHODS.KemenagRI;
  return typeof m === "string" ? METHODS[m] : m;
}

// src/defaults.ts
var DEFAULTS = {
  altitude: 0,
  method: "KemenagRI",
  asrMadhhab: "shafii",
  ihtiyathMinutes: 0,
  sunriseSunsetAngle: -0.833,
  imsakOffsetMinutes: 10,
  dhuhaAngleDeg: 4.5,
  dhuhaEndMarginMinutes: 2
};
var RUNTIME_DEFAULTS = { ...DEFAULTS };
function setFalakDefaults(patch) {
  RUNTIME_DEFAULTS = { ...RUNTIME_DEFAULTS, ...patch };
}
function getFalakDefaults() {
  return { ...RUNTIME_DEFAULTS };
}

// src/prayer.ts
function computePrayerTimes(opts) {
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
    dhuhaEndMarginMinutes
  } = merged;
  const { y, m, d } = toYMD(date);
  const method = resolveMethod(mOpt);
  const latR = d2r(latitude);
  const jd = jdFromDate(y, m, d);
  let { dec, eotMin } = solarDeclinationAndEoT(jd);
  let noonH = solarNoonHours(tzOffset, longitude, eotMin);
  const jdNoonApprox = jd + (noonH - tzOffset) / 24;
  ({ dec, eotMin } = solarDeclinationAndEoT(jdNoonApprox));
  noonH = solarNoonHours(tzOffset, longitude, eotMin);
  const altCorrDeg = -r2d(Math.acos(6371e3 / (6371e3 + altitude)));
  const h0_sun = sunriseSunsetAngle - altCorrDeg;
  const H_sun = hourAngleForAltitude(latR, dec, h0_sun);
  const sunriseH = noonH - H_sun / 15;
  const sunsetH = noonH + H_sun / 15;
  const dhuhrH = noonH;
  const H_fajr = hourAngleForAltitude(latR, dec, -method.fajr);
  const fajrH = noonH - H_fajr / 15;
  let ishaH;
  if (method.isha.interval) {
    ishaH = sunsetH + method.isha.interval / 60;
  } else {
    const H_isha = hourAngleForAltitude(
      latR,
      dec,
      -method.isha.angle
    );
    ishaH = noonH + H_isha / 15;
  }
  const asrFactor = asrMadhhab === "hanafi" ? 2 : 1;
  const H_asr = hourAngleForAsr(latR, dec, asrFactor);
  const asrH = noonH + H_asr / 15;
  const imsakH = fajrH - imsakOffsetMinutes / 60;
  const H_dhuhaStart = hourAngleForAltitude(latR, dec, +dhuhaAngleDeg);
  const dhuhaStartH = Math.max(sunriseH, noonH - H_dhuhaStart / 15);
  const dhuhaEndH = Math.max(dhuhaStartH, dhuhrH - dhuhaEndMarginMinutes / 60);
  const addMin = (t, m2) => t + m2 / 60;
  const base = { y, m, d };
  const mk = (h) => isFiniteNum(h) ? hoursToDate(base, h, tzOffset) : null;
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
        `DhuhaStart pada +${dhuhaAngleDeg}\xB0; DhuhaEnd ${dhuhaEndMarginMinutes} menit sebelum Dhuhr`
      ]
    }
  };
}
function toYMD(date) {
  if (date instanceof Date)
    return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
  return { y: date.year, m: date.month, d: date.day };
}
function isFiniteNum(x) {
  return typeof x === "number" && Number.isFinite(x);
}

exports.METHODS = METHODS;
exports.computePrayerTimes = computePrayerTimes;
exports.getFalakDefaults = getFalakDefaults;
exports.qiblaBearing = qiblaBearing;
exports.setFalakDefaults = setFalakDefaults;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map