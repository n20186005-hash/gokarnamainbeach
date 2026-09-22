// Server-side weather helper for Gokarna Main Beach.
// Data source: Open-Meteo forecast API (public, no access key required).
// Results are cached so the upstream is not hit on every request.

export const BEACH_LAT = 14.543854;
export const BEACH_LON = 74.313712;

export type Lang = 'kn' | 'en';

export interface WeatherNow {
  temp: number;
  apparent: number;
  humidity: number;
  wind: number;
  windLevel: number;
  precip: number;
  precipProb: number;
  uv: number;
  wave: number | null;
  code: number;
  label: string;
  icon: string;
  umbrella: boolean;
}

export interface WeatherDay {
  /** ISO date, e.g. 2026-09-22 */
  date: string;
  weekday: string;
  code: number;
  label: string;
  icon: string;
  tmax: number;
  tmin: number;
  precipProb: number;
  umbrella: boolean;
}

export interface WeatherAdvice {
  /** 出行穿搭 / Outfit */
  outfit: string[];
  /** 游玩安排 (beach-aware) / Activity */
  activity: string[];
  /** 随身物品 / Items */
  items: string[];
  /** 风险提醒 — empty when no severe condition / Risk */
  risk: string[];
}

export interface WeatherData {
  now: WeatherNow;
  days: WeatherDay[];
  advice: WeatherAdvice;
  /** epoch ms when this snapshot was produced */
  fetched: number;
}

const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: 'ಸ್ಪಷ್ಟ ಆಕಾಶ', icon: '☀️' },
  1: { label: 'ಬಹುತೇಕ ಸ್ಪಷ್ಟ', icon: '🌤️' },
  2: { label: 'ಅರೆ ಮೋಡ', icon: '⛅' },
  3: { label: 'ಮೋಡದ ಆವರಣ', icon: '☁️' },
  45: { label: 'ಮಂಜು', icon: '🌫️' },
  48: { label: 'ಮಂಜಿನ ಪೊರೆ', icon: '🌫️' },
  51: { label: 'ಸ್ವಲ್ಪ ಮಂಜುಮಳೆ', icon: '🌦️' },
  53: { label: 'ಮಂಜುಮಳೆ', icon: '🌦️' },
  55: { label: 'ಕಟ್ಟು ಮಂಜುಮಳೆ', icon: '🌧️' },
  56: { label: 'ಹಿಮ ಮಂಜುಮಳೆ', icon: '🌧️' },
  57: { label: 'ಹಿಮ ಮಂಜುಮಳೆ', icon: '🌧️' },
  61: { label: 'ಸ್ವಲ್ಪ ಮಳೆ', icon: '🌧️' },
  63: { label: 'ಮಳೆ', icon: '🌧️' },
  65: { label: 'ಭಾರಿ ಮಳೆ', icon: '⛈️' },
  66: { label: 'ಹಿಮ ಮಳೆ', icon: '🌧️' },
  67: { label: 'ಹಿಮ ಮಳೆ', icon: '🌧️' },
  71: { label: 'ಸ್ವಲ್ಪ ಹಿಮಪಾತ', icon: '🌨️' },
  73: { label: 'ಹಿಮಪಾತ', icon: '🌨️' },
  75: { label: 'ಭಾರಿ ಹಿಮಪಾತ', icon: '❄️' },
  77: { label: 'ಹಿಮ ಕಣಗಳು', icon: '🌨️' },
  80: { label: 'ಮಳೆ ಸುರಿತ', icon: '🌦️' },
  81: { label: 'ಮಳೆ ಸುರಿತ', icon: '🌧️' },
  82: { label: 'ತೀವ್ರ ಮಳೆ ಸುರಿತ', icon: '⛈️' },
  85: { label: 'ಹಿಮ ಸುರಿತ', icon: '🌨️' },
  86: { label: 'ಭಾರಿ ಹಿಮ ಸುರಿತ', icon: '❄️' },
  95: { label: 'ಮಿಂಚು ಮಳೆ', icon: '⛈️' },
  96: { label: 'ಆಲಿಕಲ್ಲು ಮಿಂಚು ಮಳೆ', icon: '⛈️' },
  99: { label: 'ಆಲಿಕಲ್ಲು ಮಿಂಚು ಮಳೆ', icon: '⛈️' },
};

const EN_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};

const WMO_EN: Record<number, { label: string; icon: string }> = Object.fromEntries(
  Object.entries(WMO).map(([k, v]) => [Number(k), { label: EN_LABELS[Number(k)] ?? v.label, icon: v.icon }]),
) as Record<number, { label: string; icon: string }>;

const RAINY = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);
const LIGHT_RAIN = new Set([51, 53, 55, 61, 80]);
const HEAVY_RAIN = new Set([63, 65, 66, 67, 81, 82]);
const THUNDER = new Set([95, 96, 99]);
const FOG = new Set([45, 48]);
const CLEAR = new Set([0, 1]);
const CLOUDY = new Set([2, 3]);

function describe(code: number, lang: Lang = 'kn'): { label: string; icon: string } {
  const map = lang === 'en' ? WMO_EN : WMO;
  return map[code] ?? { label: lang === 'en' ? 'Weather data unavailable' : 'ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ', icon: '🌡️' };
}

function needsUmbrella(code: number, precipProb: number): boolean {
  return precipProb >= 40 || RAINY.has(code);
}

// Beaufort scale from wind speed in km/h.
function beaufort(kmh: number): number {
  const upper = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  for (let i = 0; i < upper.length; i++) {
    if (kmh < upper[i]!) return i;
  }
  return 12;
}

const WEEKDAYS_KN = ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildUrl(): string {
  const params = new URLSearchParams({
    latitude: String(BEACH_LAT),
    longitude: String(BEACH_LON),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max',
    forecast_days: '7',
    timezone: 'Asia/Kolkata',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function buildMarineUrl(): string {
  const params = new URLSearchParams({
    latitude: String(BEACH_LAT),
    longitude: String(BEACH_LON),
    current: 'wave_height',
    timezone: 'Asia/Kolkata',
  });
  return `https://marine-api.open-meteo.com/v1/marine?${params.toString()}`;
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

interface TodayMeta {
  tmax: number;
  tmin: number;
  uv: number;
  windMax: number;
  precipProb: number;
}

interface Phrases {
  outfit: {
    rainProb: string;
    heavyRain: string;
    lightRain: string;
    hot: string;
    tempDiff: string;
    cold: string;
    windy: string;
    def: string;
  };
  activity: {
    rainProb: string;
    heavyRain: string;
    lightRain: string;
    thunder: string;
    hot: string;
    windStrong: string;
    windMod: string;
    wave: string;
    clear: string;
    cloudy: string;
    def: string;
  };
  items: {
    heavyRainOrWind: string;
    rain: string;
    uv: string;
    water: string;
    cold: string;
    defRain: string;
  };
  risk: {
    heavyRain: string;
    thunder: string;
    wind: string;
    fog: string;
    wave: string;
  };
}

const PHRASES: Record<Lang, Phrases> = {
  kn: {
    outfit: {
      rainProb: 'ಮಳೆ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು — ಛತ್ರಿ ತೆಗೆದುಕೊಳ್ಳಿ',
      heavyRain: 'ಮಳೆ ಬಲವಾಗಿದೆ — ನೀರು ತಡೆಯುವ ಜಾಕೆಟ್ ಧರಿಸಿ',
      lightRain: 'ಸ್ವಲ್ಪ ಮಳೆ — ಮಡಿಕೆ ಛತ್ರಿ ಉಪಯುಕ್ತ',
      hot: 'ಬಿಸಿಲು ಹೆಚ್ಚು — ತೆಳು, ಗಾಳಿ ಬೀಸುವ ಬಟ್ಟೆ',
      tempDiff: 'ದಿನರಾತ್ರಿ ತಾಪಮಾನ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚು — ಒಂದು ಜಾಕೆಟ್ ಇಡಿ',
      cold: 'ಚಳಿ — ದಪ್ಪ ಜಾಕೆಟ್, ಸ್ಕಾರ್ಫ್',
      windy: 'ಗಾಳಿ ಬಲವಾಗಿದೆ — ಸಡಿಲ ಉಡುಪು ತಪ್ಪಿಸಿ, ಟೋಪಿ ಹಿಡಿಯಿರಿ',
      def: 'ಹವಾಮಾನ ಸಾಮಾನ್ಯ — ಸಾಮಾನ್ಯ ಸಮುದ್ರ ಬಟ್ಟೆ ಸಾಕು',
    },
    activity: {
      rainProb: 'ಒಳಾಂಗಣ ತಾಣಗಳಿಗೆ ಆದ್ಯತೆ; ಸಮುದ್ರ/ಪರ್ವತ ಆಟವನ್ನು ಮುಂದೂಡಿ',
      heavyRain: 'ಹೊರಾಂಗಣ ಆಟ ಕಡಿಮೆ; ಮನೆಯೊಳಗಿನ ತಾಣಗಳಿಗೆ ಆದ್ಯತೆ',
      lightRain: 'ರಸ್ತೆ ಜಾರುವಂತಿದೆ, ನಡೆಯುವಾಗ ಎಚ್ಚರಿಕೆ',
      thunder: 'ನೀರಿನ ಆಟ/ಸಮುದ್ರ ಸವಾರಿ ತಪ್ಪಿಸಿ',
      hot: 'ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲನ್ನು ತಪ್ಪಿಸಿ; ಬೆಳಿಗ್ಗೆ/ಸಂಜೆ ಆಟಕ್ಕೆ ಆದ್ಯತೆ',
      windStrong: 'ಗಾಳಿ — ಸಮುದ್ರ ಹಡಗು, ಕೆಲವು ಹೊರಾಂಗಣ ಯೋಜನೆಗಳು ನಿಲ್ಲಬಹುದು',
      windMod: 'ಸಮುದ್ರ ಹಡಗು/ಕೆಲವು ಹೊರಾಂಗಣ ಯೋಜನೆಗಳು ನಿಲ್ಲಬಹುದು',
      wave: 'ಅಲೆಗಳು ಎತ್ತರವಾಗಿವೆ — ಬಂಡೆ/ದಡದ ಬಳಿ ಈಜುವುದನ್ನು ತಪ್ಪಿಸಿ',
      clear: 'ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ — ಸಮುದ್ರ ತೀರ ನಡಿಗೆ, ಸೂರ್ಯೋದಯ/ಸೂರ್ಯಾಸ್ತ ನೋಡಲು ಸೂಕ್ತ',
      cloudy: 'ಬೆಳಕು ಮೃದುವಾಗಿದೆ — ಛಾಯಾಗ್ರಹಣಕ್ಕೆ ಒಳ್ಳೆಯದು, ದೀರ್ಘ ಹೊರಾಂಗಣ ಸಂಚಾರಕ್ಕೆ ಅನುಕೂಲ',
      def: 'ತೀರದಲ್ಲಿ ನಡೆಯಲು ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಲು ಸೂಕ್ತವಾದ ದಿನ',
    },
    items: {
      heavyRainOrWind: 'ಮಳೆ ಕೋಟು (ಉದ್ದ ಛತ್ರಿ ಬದಲು)',
      rain: 'ಛತ್ರಿ / ಮಳೆ ಕೋಟು',
      uv: 'ಸನ್‌ಸ್ಕ್ರೀನ್, ಕನ್ನಡಕ, ಟೋಪಿ',
      water: 'ಸಾಕಷ್ಟು ಕುಡಿಯುವ ನೀರು',
      cold: 'ಬೆಚ್ಚಗಿನ ಬಟ್ಟೆ',
      defRain: 'ಛತ್ರಿ / ಮಳೆ ಕೋಟು',
    },
    risk: {
      heavyRain: 'ಮಳೆ ಬಲವಾಗಿದೆ — ಕಣಿವೆ, ಕೆಳಮಟ್ಟದ ಪ್ರದೇಶ ತಪ್ಪಿಸಿ; ಹಡಗು/ರಜ್ಜು ಸವಾರಿ ನಿಲ್ಲಬಹುದು',
      thunder: 'ಮಿಂಚು ಮಳೆ — ಪರ್ವತ ಹತ್ತಬೇಡಿ, ಮರದ ನೆರಳು ಅಥವಾ ಸಮುದ್ರ ತಪ್ಪಿಸಿ; ನೀರಿನ ಆಟ ಸಾಮಾನ್ಯವಾಗಿ ಮುಚ್ಚಿರುತ್ತದೆ',
      wind: 'ಬಲವಾದ ಗಾಳಿ — ಬಿಲ್‌ಬೋರ್ಡ್, ಸಮುದ್ರ ಬಂಡೆಗಳಿಂದ ದೂರವಿರಿ',
      fog: 'ಮಂಜು — ದೃಷ್ಟಿ ಕಡಿಮೆ, ಫೆರ್ರಿ/ವಿಮಾನ ವಿಳಂಬ ಸಾಧ್ಯ; ಸಮುದ್ರ/ಪರ್ವತ ನೋಟ ಚೆನ್ನಾಗಿ ಕಾಣುವುದಿಲ್ಲ',
      wave: 'ಎತ್ತರದ ಅಲೆಗಳು — ಸಮುದ್ರಕ್ಕೆ ಇಳಿಯಬೇಡಿ, ದಡದಿಂದ ದೂರವಿರಿ',
    },
  },
  en: {
    outfit: {
      rainProb: 'High chance of rain — carry an umbrella',
      heavyRain: 'Heavy rain — wear a waterproof jacket',
      lightRain: 'Light rain — a compact umbrella helps',
      hot: 'Hot — wear light, breathable clothing',
      tempDiff: 'Big day–night temperature swing — keep a light jacket',
      cold: 'Cold — bring a warm jacket and scarf',
      windy: 'Windy — avoid loose clothing; secure your hat',
      def: 'Mild weather — normal beach wear is fine',
    },
    activity: {
      rainProb: 'Prefer indoor spots; postpone beach or hill plans',
      heavyRain: 'Limit outdoor activity; favour indoor places',
      lightRain: 'Slippery surfaces — step carefully',
      thunder: 'Avoid swimming and boat rides',
      hot: 'Avoid midday sun; plan activity for morning or evening',
      windStrong: 'Ferry rides and some outdoor plans may be cancelled',
      windMod: 'Ferry rides and some outdoor plans may be affected',
      wave: 'Waves are high — do not swim near rocks or the shore break',
      clear: 'Good weather — great for a beach walk and sunrise or sunset',
      cloudy: 'Soft light — good for photography and long outdoor walks',
      def: 'A good day for a walk along the shore and to relax',
    },
    items: {
      heavyRainOrWind: 'Raincoat (instead of a long umbrella)',
      rain: 'Umbrella / raincoat',
      uv: 'Sunscreen, sunglasses, hat',
      water: 'Plenty of drinking water',
      cold: 'Warm clothing',
      defRain: 'Umbrella / raincoat',
    },
    risk: {
      heavyRain: 'Heavy rain — avoid valleys and low-lying areas; boat/cable-car rides may stop',
      thunder: 'Thunderstorms — do not climb hills, avoid sheltering under trees or the sea; water activities are usually suspended',
      wind: 'Strong wind — stay away from billboards and sea cliffs',
      fog: 'Fog — poor visibility, ferries/flights may be delayed; sea and hill views are unclear',
      wave: 'High waves — do not enter the sea; keep away from the shore',
    },
  },
};

function buildAdvice(now: WeatherNow, t: TodayMeta, lang: Lang): WeatherAdvice {
  const P = PHRASES[lang];
  const tempMax = t.tmax;
  const tempMin = t.tmin;
  const uv = t.uv;
  const windy = Math.max(now.windLevel, t.windMax);
  const prob = Math.max(now.precipProb, t.precipProb);
  const wave = now.wave;
  const code = now.code;

  const outfit: string[] = [];
  const activity: string[] = [];
  const items: string[] = [];
  const risk: string[] = [];

  // --- Precipitation / rain ---
  if (prob >= 60) {
    outfit.push(P.outfit.rainProb);
    activity.push(P.activity.rainProb);
  }
  if (HEAVY_RAIN.has(code)) {
    outfit.push(P.outfit.heavyRain);
    activity.push(P.activity.heavyRain);
    risk.push(P.risk.heavyRain);
  } else if (LIGHT_RAIN.has(code)) {
    outfit.push(P.outfit.lightRain);
    activity.push(P.activity.lightRain);
  }
  if (THUNDER.has(code)) {
    activity.push(P.activity.thunder);
    risk.push(P.risk.thunder);
  }

  // --- Heat & UV ---
  if (now.temp >= 32 || tempMax >= 32) {
    outfit.push(P.outfit.hot);
    activity.push(P.activity.hot);
  }
  if (uv >= 5) {
    items.push(P.items.uv);
  }
  if (now.temp >= 32 || uv >= 5) {
    items.push(P.items.water);
  }

  // --- Cold / temperature swing ---
  if (tempMax - tempMin > 8) {
    outfit.push(P.outfit.tempDiff);
  }
  if (tempMax <= 10) {
    outfit.push(P.outfit.cold);
    items.push(P.items.cold);
  }

  // --- Wind ---
  if (windy >= 7) {
    activity.push(P.activity.windStrong);
    risk.push(P.risk.wind);
  } else if (windy >= 5) {
    outfit.push(P.outfit.windy);
    activity.push(P.activity.windMod);
  }

  // --- Fog ---
  if (FOG.has(code)) {
    risk.push(P.risk.fog);
  }

  // --- Sea state (beach) ---
  if (wave != null) {
    if (wave >= 2.5) {
      risk.push(P.risk.wave);
    } else if (wave >= 1.5) {
      activity.push(P.activity.wave);
    }
  }

  // --- Calm / good conditions ---
  if (CLEAR.has(code) && risk.length === 0) {
    activity.push(P.activity.clear);
  }
  if (CLOUDY.has(code) && risk.length === 0) {
    activity.push(P.activity.cloudy);
  }

  // --- Items fallback for rain ---
  if (HEAVY_RAIN.has(code) || windy >= 7) {
    items.push(P.items.heavyRainOrWind);
  } else if (prob >= 60 || LIGHT_RAIN.has(code)) {
    items.push(P.items.rain);
  }

  // --- Neutral fallbacks so a block is never empty ---
  if (outfit.length === 0) outfit.push(P.outfit.def);
  if (activity.length === 0) activity.push(P.activity.def);
  if (items.length === 0 && (prob >= 60 || RAINY.has(code))) items.push(P.items.defRain);

  return { outfit: dedupe(outfit), activity: dedupe(activity), items: dedupe(items), risk: dedupe(risk) };
}

const CACHE_KEY = 'https://gokarnamainbeach.com/__weather-cache';
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

interface CacheShape {
  fetched: number;
  payload: WeatherData;
}

// In-memory fallback for runtimes without the Cache API (e.g. local preview).
const memoryCache = new Map<string, CacheShape>();

async function readCache(): Promise<WeatherData | null> {
  const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
  try {
    if (cache) {
      const res = await cache.match(CACHE_KEY);
      if (res) {
        const data = (await res.json()) as CacheShape;
        if (Date.now() - data.fetched < MAX_AGE_MS) return data.payload;
      }
    } else {
      const mem = memoryCache.get(CACHE_KEY);
      if (mem && Date.now() - mem.fetched < MAX_AGE_MS) return mem.payload;
    }
  } catch {
    /* ignore cache read errors */
  }
  return null;
}

async function writeCache(payload: WeatherData): Promise<void> {
  const shape: CacheShape = { fetched: Date.now(), payload };
  const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
  try {
    if (cache) {
      await cache.put(
        CACHE_KEY,
        new Response(JSON.stringify(shape), { headers: { 'content-type': 'application/json' } }),
      );
    } else {
      memoryCache.set(CACHE_KEY, shape);
    }
  } catch {
    /* ignore cache write errors */
  }
}

export async function getWeather(lang: Lang = 'kn'): Promise<WeatherData | null> {
  const cached = await readCache();
  if (cached) return cached;

  try {
    const res = await fetch(buildUrl(), {
      headers: { accept: 'application/json' },
      // Cloudflare: cache the upstream response at the edge for 10 minutes.
      cf: { cacheTtl: 600 },
    } as RequestInit);
    if (!res.ok) return null;
    const j = (await res.json()) as {
      current: {
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        precipitation: number;
        weather_code: number;
      };
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
        uv_index_max: number[];
        wind_speed_10m_max: number[];
      };
    };

    // Sea state from the marine API (best-effort; ignore if unavailable).
    let wave: number | null = null;
    try {
      const mres = await fetch(buildMarineUrl(), {
        headers: { accept: 'application/json' },
        cf: { cacheTtl: 600 },
      } as RequestInit);
      if (mres.ok) {
        const m = (await mres.json()) as { current?: { wave_height?: number | null } };
        if (typeof m.current?.wave_height === 'number') wave = Math.round(m.current.wave_height * 10) / 10;
      }
    } catch {
      /* ignore marine fetch errors */
    }

    const c = j.current;
    const todayIndex = 0;
    const precipProb = Math.round(j.daily.precipitation_probability_max[todayIndex] ?? 0);
    const uv = Math.round(j.daily.uv_index_max[todayIndex] ?? 0);
    const windMax = beaufort(j.daily.wind_speed_10m_max[todayIndex] ?? 0);

    const nowDesc = describe(c.weather_code, lang);
    const now: WeatherNow = {
      temp: Math.round(c.temperature_2m),
      apparent: Math.round(c.apparent_temperature),
      humidity: Math.round(c.relative_humidity_2m),
      wind: Math.round(c.wind_speed_10m),
      windLevel: beaufort(c.wind_speed_10m),
      precip: Math.round(c.precipitation),
      precipProb,
      uv,
      wave,
      code: c.weather_code,
      label: nowDesc.label,
      icon: nowDesc.icon,
      umbrella: needsUmbrella(c.weather_code, precipProb),
    };

    const days: WeatherDay[] = j.daily.time.map((iso, i) => {
      const code = j.daily.weather_code[i]!;
      const dayProb = j.daily.precipitation_probability_max[i] ?? 0;
      const d = describe(code, lang);
      const dt = new Date(`${iso}T00:00:00+05:30`);
      const weekday = (lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_KN)[dt.getDay()] ?? '';
      return {
        date: iso,
        weekday,
        code,
        label: d.label,
        icon: d.icon,
        tmax: Math.round(j.daily.temperature_2m_max[i]!),
        tmin: Math.round(j.daily.temperature_2m_min[i]!),
        precipProb: dayProb,
        umbrella: needsUmbrella(code, dayProb),
      };
    });

    const todayMeta: TodayMeta = {
      tmax: days[0]?.tmax ?? now.temp,
      tmin: days[0]?.tmin ?? now.temp,
      uv,
      windMax,
      precipProb,
    };
    const advice = buildAdvice(now, todayMeta, lang);

    const payload: WeatherData = { now, days, advice, fetched: Date.now() };
    await writeCache(payload);
    return payload;
  } catch {
    return null;
  }
}
