type AsrMadhhab = "shafii" | "hanafi";
interface MethodDef {
    name: string;
    fajr: number;
    isha: {
        angle?: number;
        interval?: number;
    };
}
type MethodId = "MWL" | "Egyptian" | "Karachi" | "ISNA" | "UmmAlQura" | "KemenagRI";
interface PrayerCalcOptions {
    date: Date | {
        year: number;
        month: number;
        day: number;
    };
    latitude: number;
    longitude: number;
    tzOffset: number;
    altitude?: number;
    method?: MethodId | MethodDef;
    asrMadhhab?: AsrMadhhab;
    ihtiyathMinutes?: number;
    sunriseSunsetAngle?: number;
    imsakOffsetMinutes?: number;
    dhuhaAngleDeg?: number;
    dhuhaEndMarginMinutes?: number;
}
interface PrayerTimesResult {
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

declare function computePrayerTimes(opts: PrayerCalcOptions): PrayerTimesResult;

declare const METHODS: Record<MethodId, MethodDef>;

declare function qiblaBearing(latDeg: number, lonDeg: number): number;

declare const DEFAULTS: {
    altitude: number;
    method: MethodId;
    asrMadhhab: AsrMadhhab;
    ihtiyathMinutes: number;
    sunriseSunsetAngle: number;
    imsakOffsetMinutes: number;
    dhuhaAngleDeg: number;
    dhuhaEndMarginMinutes: number;
};
type FalakDefaults = typeof DEFAULTS;
declare function setFalakDefaults(patch: Partial<FalakDefaults>): void;
declare function getFalakDefaults(): FalakDefaults;

export { type AsrMadhhab, METHODS, type MethodDef, type MethodId, type PrayerCalcOptions, type PrayerTimesResult, computePrayerTimes, getFalakDefaults, qiblaBearing, setFalakDefaults };
