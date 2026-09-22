// Server-side tides helper for Gokarna Main Beach.
// Data source: Open-Meteo Marine API (public, no access key required).
// sea_level_height_msl carries the astronomical tide plus surge, sampled hourly.
// Results are cached so the upstream is not hit on every request.

import { BEACH_LAT, BEACH_LON } from './weather';

export interface TideEvent {
  type: 'high' | 'low';
  /** ISO local time, e.g. 2026-09-22T05:30 */
  time: string;
  /** height above mean sea level, metres */
  height: number;
  /** index into the hourly series, for chart placement */
  index: number;
}

export interface TidePoint {
  time: string;
  height: number;
}

export interface TidesData {
  now: { height: number; time: string };
  events: TideEvent[];
  series: TidePoint[];
  fetched: number;
}

interface CacheShape {
  fetched: number;
  payload: TidesData;
}

const CACHE_KEY = 'https://gokarnamainbeach.com/__tides-cache';
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

// In-memory fallback for runtimes without the Cache API (e.g. local preview).
const memoryCache = new Map<string, CacheShape>();

async function readCache(): Promise<TidesData | null> {
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

async function writeCache(payload: TidesData): Promise<void> {
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

function buildUrl(): string {
  const params = new URLSearchParams({
    latitude: String(BEACH_LAT),
    longitude: String(BEACH_LON),
    hourly: 'sea_level_height_msl',
    forecast_days: '3',
    timezone: 'Asia/Kolkata',
  });
  return `https://marine-api.open-meteo.com/v1/marine?${params.toString()}`;
}

export async function getTides(): Promise<TidesData | null> {
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
      hourly: { time: string[]; sea_level_height_msl: (number | null)[] };
    };

    const series: TidePoint[] = j.hourly.time
      .map((t, i) => ({ time: t, height: j.hourly.sea_level_height_msl[i] ?? 0 }))
      .filter((p) => Number.isFinite(p.height));

    if (series.length < 3) return null;

    // Detect local maxima (high) and minima (low) across the hourly series.
    const events: TideEvent[] = [];
    for (let i = 1; i < series.length - 1; i++) {
      const h = series[i]!.height;
      const prev = series[i - 1]!.height;
      const next = series[i + 1]!.height;
      if (h > prev && h >= next) {
        events.push({ type: 'high', time: series[i]!.time, height: Math.round(h * 10) / 10, index: i });
      } else if (h < prev && h <= next) {
        events.push({ type: 'low', time: series[i]!.time, height: Math.round(h * 10) / 10, index: i });
      }
    }

    // Current sea level: most recent hourly sample at or before now (IST).
    const nowIst = new Date(Date.now() + 5.5 * 3600 * 1000);
    const nowIso = nowIst.toISOString().slice(0, 16);
    let nowIdx = 0;
    for (let i = 0; i < series.length; i++) {
      if (series[i]!.time.slice(0, 16) <= nowIso) nowIdx = i;
      else break;
    }
    const now = { height: Math.round(series[nowIdx]!.height * 10) / 10, time: series[nowIdx]!.time };

    // Keep only upcoming events, then the next four.
    const upcoming = events.filter((e) => e.time.slice(0, 16) >= nowIso).slice(0, 4);

    const payload: TidesData = { now, events: upcoming, series, fetched: Date.now() };
    await writeCache(payload);
    return payload;
  } catch {
    return null;
  }
}
