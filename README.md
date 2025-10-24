# falak-lib

Perpustakaan TypeScript untuk **hisab waktu sholat**, **imsak**, **waktu dhuha**, dan **arah kiblat**.  
Dirancang modular, ESM-first, dengan preset metode umum seperti MWL, Egyptian, Karachi, ISNA, Umm al-Qura, dan Kemenag RI.

[![GitHub release](https://img.shields.io/github/v/release/azkal182/falak-lib?logo=github)](https://github.com/azkal182/falak-lib/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

---

## ✨ Fitur
- Waktu: **Imsak, Fajr, Sunrise, Dhuha (start–end), Dhuhr, Asr, Maghrib, Isha**
- Arah Kiblat (bearing dari utara, searah jarum jam)
- Preset metode perhitungan (Kemenag RI, MWL, ISNA, dll)
- Altitude correction dan opsi ihtiyath (buffer waktu)
- Asr madhhab: Shafi‘i / Hanafi
- Dukungan penuh TypeScript
- Build **ESM + CJS** dengan definisi tipe `.d.ts`

---

## 📦 Instalasi

### Dari npm (setelah publish)
```bash
npm i falak-lib
```

### Dari GitHub langsung (tanpa publish)
```bash
npm i github:azkal182/falak-lib#v0.2.0
```

Pastikan `dist/` sudah tersedia di repo.

---

## 🚀 Pemakaian Dasar

```ts
import { computePrayerTimes } from 'falak-lib';

const times = computePrayerTimes({
  date: { year: 2025, month: 10, day: 24 },
  latitude: -6.2,
  longitude: 106.8,
  tzOffset: 7
});

console.log('Fajr   :', times.fajr?.toLocaleTimeString());
console.log('Isha   :', times.isha?.toLocaleTimeString());
console.log('Qibla  :', times.meta.qiblaBearingDeg.toFixed(2), '°');
```

---

## ⚙️ API Referensi

### `computePrayerTimes(options: PrayerCalcOptions): PrayerTimesResult`

#### Parameter wajib
| Field | Tipe | Keterangan |
|--------|------|------------|
| `date` | `Date` / `{ year, month, day }` | Tanggal |
| `latitude` | `number` | Lintang (derajat desimal) |
| `longitude` | `number` | Bujur (derajat desimal) |
| `tzOffset` | `number` | Offset UTC (contoh `7` untuk WIB) |

#### Parameter opsional (punya default)
| Field | Default | Keterangan |
|--------|----------|------------|
| `altitude` | 0 | Ketinggian tempat (meter) |
| `method` | "KemenagRI" | Preset metode perhitungan |
| `asrMadhhab` | "shafii" | Madhhab Asr |
| `ihtiyathMinutes` | 0 | Tambahan menit pada Fajr/Dhuhr/Asr/Isha |
| `sunriseSunsetAngle` | -0.833 | Sudut matahari terbit/terbenam |
| `imsakOffsetMinutes` | 10 | Selisih menit sebelum Fajr |
| `dhuhaAngleDeg` | 4.5 | Awal dhuha (derajat ketinggian matahari) |
| `dhuhaEndMarginMinutes` | 2 | Menit sebelum Dhuhr (akhir dhuha) |

#### Keluaran (`PrayerTimesResult`)
```ts
{
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
```

---

## 🕌 Metode Preset
| Nama | Fajr (°) | Isha | Keterangan |
|------|-----------|------|------------|
| MWL | 18 | 17 | Muslim World League |
| Egyptian | 19.5 | 17.5 | Egyptian General Authority |
| Karachi | 18 | 18 | University of Karachi |
| ISNA | 15 | 15 | Islamic Society of North America |
| UmmAlQura | 18.5 | Interval 90m | Saudi Arabia |
| KemenagRI | **20** | **18** | Indonesia |

---

## 🧭 Fungsi Tambahan

### `qiblaBearing(lat: number, lon: number): number`
Menghitung arah kiblat dari utara (clockwise).

```ts
import { qiblaBearing } from 'falak-lib';
console.log(qiblaBearing(-6.2, 106.8)); // ~295.15°
```

---

## 🔧 Override Default Global
```ts
import { setFalakDefaults } from 'falak-lib';

setFalakDefaults({
  ihtiyathMinutes: 2,
  imsakOffsetMinutes: 12
});
```

---

## 🧪 Development

### Jalankan secara lokal
```bash
git clone https://github.com/azkal182/falak-lib
cd falak-lib
npm i
npm run build
npm run test
```

### Jalankan contoh
```bash
npm run example
```

---

## 🧩 Struktur Proyek
```
src/
  math.ts
  solar.ts
  qibla.ts
  methods.ts
  defaults.ts
  types.ts
  prayer.ts
  index.ts
test/
  prayer.test.ts
example/
  index.ts
dist/
```

---

## 🛠️ Skrip Penting
| Skrip | Deskripsi |
|--------|------------|
| `npm run build` | Build library (ESM + CJS + d.ts) |
| `npm run test` | Jalankan unit test (Vitest) |
| `npm run example` | Jalankan contoh |
| `npm run pack` | Buat file tarball untuk uji install |
| `npm run typecheck` | Periksa tipe tanpa build |

---

## 🧮 Catatan Teknis
- Menggunakan pendekatan **NOAA Solar Approximation**
- Koreksi ketinggian hanya diterapkan pada sunrise/sunset
- Belum mendukung aturan lintang tinggi (akan ditambahkan)
- TZ ditentukan manual lewat `tzOffset`, bukan `Intl`

---

## 🤝 Kontribusi
1. Fork repo
2. Buat branch baru (`feat/...` atau `fix/...`)
3. Jalankan test sebelum commit
4. Buka Pull Request

---

## 📜 Lisensi
[MIT License](./LICENSE)

(c) 2025 azkal — Bebas digunakan untuk keperluan pribadi, penelitian, dan proyek open-source.
