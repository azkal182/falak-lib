import { computePrayerTimes, setFalakDefaults } from "../src";

setFalakDefaults({
  ihtiyathMinutes: 2,
  imsakOffsetMinutes: 10,
});

const res = computePrayerTimes({
  date: { year: 2025, month: 10, day: 24 },
  latitude: -6.2,
  longitude: 106.8,
  tzOffset: 7,
});

const fmt = (d: Date | null) =>
  d
    ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "-";

console.log("Imsak   :", fmt(res.imsak));
console.log("Fajr    :", fmt(res.fajr));
console.log("Sunrise :", fmt(res.sunrise));
console.log("Dhuha   :", fmt(res.dhuhaStart), "-", fmt(res.dhuhaEnd));
console.log("Dhuhr   :", fmt(res.dhuhr));
console.log("Asr     :", fmt(res.asr));
console.log("Maghrib :", fmt(res.maghrib));
console.log("Isha    :", fmt(res.isha));
console.log("Qibla   :", res.meta.qiblaBearingDeg.toFixed(2), "°");
