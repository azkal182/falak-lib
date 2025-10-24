# falak-lib

Perpustakaan TypeScript untuk **hisab waktu sholat**, **imsak**, **waktu dhuha**, **arah kiblat**, dan **generator jadwal 1 bulan penuh**.
Desain **modular**, **ESM-first**, dengan preset metode umum: MWL, Egyptian, Karachi, ISNA, Umm al-Qura, dan Kemenag RI.

[![GitHub release](https://img.shields.io/github/v/release/azkal182/falak-lib?logo=github)](https://github.com/azkal182/falak-lib/releases)
[![CI](https://github.com/azkal182/falak-lib/actions/workflows/ci.yml/badge.svg)](https://github.com/azkal182/falak-lib/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#lisensi)

---

## ✨ Fitur
- Waktu: **Imsak, Fajr, Sunrise, Dhuha (start–end), Dhuhr, Asr, Maghrib, Isha**.
- **Arah Kiblat** (bearing dari utara, searah jarum jam).
- **Preset metode**: MWL, Egyptian, Karachi, ISNA, Umm al-Qura, **Kemenag RI**.
- **Altitude correction**, **ihtiyath**, **Asr madhhab** (Shafi‘i/Hanafi), **sunrise/sunset angle**.
- **Generator 1 bulan penuh** + helper **CSV export**.
- **Runtime defaults**: set sekali, berlaku global (`setFalakDefaults`).
- Build **ESM + CJS** dengan `.d.ts`, siap **tree-shaking**.

---

## 📦 Instalasi

### A. Dari npm (jika sudah dipublish)
```bash
npm i falak-lib
```

### B. Langsung dari GitHub (tanpa npm registry)
**Disarankan mengunci ke _tag_ rilis** agar stabil:
```jsonc
// package.json (proyek konsumen)
{
  "dependencies": {
    "falak-lib": "github:azkal182/falak-lib#v0.2.0"
  }
}
```
Alternatif:
```jsonc
"falak-lib": "github:azkal182/falak-lib#main"        // branch latest (tidak stabil)
"falak-lib": "azkal182/falak-lib#<commit-sha>"       // commit spesifik (stabil)
"falak-lib": "git+https://github.com/azkal182/falak-lib.git#v0.2.0"
```

> **Penting:** Pastikan repo berisi `dist/` **atau** instalasi dari git menjalankan build via `prepare` (lihat catatan di bawah).

### C. Tarball dari GitHub Release
```jsonc
"falak-lib": "https://codeload.github.com/azkal182/falak-lib/tar.gz/refs/tags/v0.2.0"
```

#### Catatan Build saat Install dari Git
- Opsi **paling andal**: *commit `dist/`* ke repo (pastikan `.gitignore` tidak mengabaikannya).
- Jika **tanpa commit `dist/`**, maka di `package.json` library harus memiliki:
  ```json
  { "scripts": { "prepare": "npm run build" } }
  ```
  dan dependency build (`tsup`, `typescript`) harus tersedia pada saat install (ini bisa lambat/rapuh).

---

## 🚀 Pemakaian Dasar

```ts
import { computePrayerTimes } from 'falak-lib';

const res = computePrayerTimes({
  date: { year: 2025, month: 10, day: 24 },
  latitude: -6.2,
  longitude: 106.8,
  tzOffset: 7
});

const fmt = (d: Date | null) =>
  d ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

console.log('Imsak   :', fmt(res.imsak));
console.log('Fajr    :', fmt(res.fajr));
console.log('Sunrise :', fmt(res.sunrise));
console.log('Dhuha   :', fmt(res.dhuhaStart), '-', fmt(res.dhuhaEnd));
console.log('Dhuhr   :', fmt(res.dhuhr));
console.log('Asr     :', fmt(res.asr));
console.log('Maghrib :', fmt(res.maghrib));
console.log('Isha    :', fmt(res.isha));
console.log('Qibla   :', res.meta.qiblaBearingDeg.toFixed(2), '°');
```

---

## 📚 API Referensi

### `computePrayerTimes(options: PrayerCalcOptions): PrayerTimesResult`

**Parameter wajib**
| Field | Tipe | Keterangan |
|------|------|------------|
| `date` | `Date` / `{ year, month, day }` | Tanggal (month: 1..12) |
| `latitude` | `number` | Lintang (derajat desimal) |
| `longitude` | `number` | Bujur (derajat desimal) |
| `tzOffset` | `number` | Offset UTC (mis. `7` untuk WIB) |

**Parameter opsional (memiliki default)**
| Field | Default | Keterangan |
|------|---------|------------|
| `altitude` | `0` | Meter di atas permukaan laut |
| `method` | `"KemenagRI"` | Lihat *Preset Metode* |
| `asrMadhhab` | `"shafii"` | `"shafii"` \| `"hanafi"` |
| `ihtiyathMinutes` | `0` | Tambahan menit ke Fajr/Dhuhr/Asr/Isha |
| `sunriseSunsetAngle` | `-0.833` | Sudut sunrise/sunset (refraksi + semi-diameter) |
| `imsakOffsetMinutes` | `10` | Menit sebelum Fajr |
| `dhuhaAngleDeg` | `4.5` | Awal dhuha saat altitude matahari +4.5° |
| `dhuhaEndMarginMinutes` | `2` | Menjelang Dhuhr (menit) |

**Keluaran**
```ts
type PrayerTimesResult = {
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
};
```

### `qiblaBearing(lat: number, lon: number): number`
Mengembalikan **bearing** 0..360° dari **utara** menuju Ka'bah (searah jarum jam).
```ts
import { qiblaBearing } from 'falak-lib';
console.log(qiblaBearing(-6.2, 106.8)); // contoh output: 295.1°
```

### Preset Metode
| Kunci       | Fajr (°) | Isha                 |
|-------------|----------|----------------------|
| `MWL`       | 18       | angle: 17            |
| `Egyptian`  | 19.5     | angle: 17.5          |
| `Karachi`   | 18       | angle: 18            |
| `ISNA`      | 15       | angle: 15            |
| `UmmAlQura` | 18.5     | **interval: 90 menit** |
| `KemenagRI` | **20**   | **angle: 18**        |

---

## 🗓️ Generator Jadwal 1 Bulan

### `computeMonthSchedule(options: MonthScheduleOptions): MonthScheduleResult`

**Parameter**
```ts
type MonthScheduleOptions = Omit<PrayerCalcOptions, 'date'> & {
  year: number;  // contoh 2025
  month: number; // 1..12
};
```
> Semua opsi opsional mewarisi **default** dari `computePrayerTimes`.

**Keluaran**
```ts
type MonthScheduleResult = {
  year: number;
  month: number; // 1..12
  rows: Array<DayPrayerRow>;
};

type DayPrayerRow = PrayerTimesResult & {
  date: { year: number; month: number; day: number };
};
```

**Contoh**
```ts
import { computeMonthSchedule } from 'falak-lib';

const m = computeMonthSchedule({
  year: 2025,
  month: 11,
  latitude: -6.2,
  longitude: 106.8,
  tzOffset: 7,
  method: 'KemenagRI'
});

console.log(m.rows.length); // 30 (untuk Nov 2025)
console.log(m.rows[0].fajr); // Date untuk tanggal 1
```

### `monthScheduleToCSV(result: MonthScheduleResult, locale = 'id-ID'): string`
Helper untuk ekspor CSV (jam lokal `HH:mm`).
```ts
import { monthScheduleToCSV } from 'falak-lib';
const csv = monthScheduleToCSV(m);
console.log(csv.split('\n').slice(0,5).join('\n')); // preview 5 baris
```

---

## 🔧 Default Global

```ts
import { setFalakDefaults, getFalakDefaults } from 'falak-lib';

setFalakDefaults({
  ihtiyathMinutes: 2,
  imsakOffsetMinutes: 12,
  dhuhaAngleDeg: 5.0
});

console.log(getFalakDefaults());
```

---

## 🧪 Development

```bash
git clone https://github.com/azkal182/falak-lib
cd falak-lib
npm i
npm run typecheck
npm run test
npm run build
npm run example
```

**Skrip penting**
| Skrip | Deskripsi |
|------|-----------|
| `build` | Build ESM + CJS + d.ts |
| `test` | Jalankan Vitest |
| `coverage` | Laporan coverage |
| `typecheck` | Periksa tipe tanpa build |
| `example` | Jalankan contoh |
| `pack` | Buat tarball untuk uji instal |

---

## ⚙️ Konfigurasi TypeScript (ringkas)

**`tsconfig.json` (library build)**
```jsonc
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020"],
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist","node_modules","test","**/*.config.ts","vitest.config.ts","tsup.config.ts","example"]
}
```

**Troubleshooting umum**
- **TS2835**: jika pakai `NodeNext`, impor relatif wajib memakai ekstensi `.js`. Solusi cepat: gunakan `"moduleResolution": "Bundler"`.
- **`exactOptionalPropertyTypes:true`**: jangan sertakan properti opsional dengan nilai `undefined`. Gunakan conditional spread:
  ```ts
  const obj = { ...(altitude !== undefined ? { altitude } : {}) };
  ```

---

## 📌 Catatan Teknis & Akurasi
- Menggunakan **aproksimasi NOAA** untuk posisi Matahari (umum dan cepat).
- **Altitude correction** diterapkan untuk sunrise/sunset; untuk Dhuha (altitude > 0°) diabaikan karena efek kecil.
- High-latitude rules (angle-based/midnight/nearest latitude) **belum** diimplementasi.
- `tzOffset` wajib (tidak membaca zona waktu dari lingkungan) agar deterministik lintas platform.

---

## 🤝 Kontribusi
PR & isu sangat dipersilakan. Sebelum PR:
1. `npm run typecheck`
2. `npm run test`
3. Tambahkan test bila mengubah logika inti.

---

## 📝 Perubahan
- `v0.2.0`: penambahan **Imsak**, **Dhuha**, **runtime defaults**, **month schedule** + **CSV export**, dokumentasi & workflow CI.

---

## 📜 Lisensi
Lihat [LICENSE](./LICENSE) (MIT).
