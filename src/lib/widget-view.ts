import type { WeatherData, Lang } from './weather';
import type { TidesData } from './tides';

const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const unavailable = (lang: Lang) => lang === 'en' ? 'Data is unavailable. Please try again later; follow local notices.' : 'ದತ್ತಾಂಶ ಲಭ್ಯವಿಲ್ಲ. ನಂತರ ಮರುಪ್ರಯತ್ನಿಸಿ; ಸ್ಥಳೀಯ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.';
export const refreshFailed = (lang: Lang) => lang === 'en' ? 'Refresh failed. The earlier model snapshot below has not been updated.' : 'ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ. ಕೆಳಗಿನ ಹಿಂದಿನ ಮಾದರಿ ದತ್ತಾಂಶ ನವೀಕರಿಸಿಲ್ಲ.';
export function weatherView(data: WeatherData | null, lang: Lang): string {
  if (!data) return `<p class="mt-6 rounded-2xl bg-sand-100 p-6">${unavailable(lang)}</p>`;
  const en = lang === 'en', n = data.now;
  const labels = en ? ['Feels like', 'Humidity', 'Wind', 'Rain chance', 'UV index', 'Wave height'] : ['ಅನುಭವ', 'ಆರ್ದ್ರತೆ', 'ಗಾಳಿ', 'ಮಳೆ ಸಾಧ್ಯತೆ', 'UV ಸೂಚಿಕ', 'ಅಲೆ ಎತ್ತರ'];
  const values = [n.apparent + '°C', n.humidity + '%', n.wind + ' km/h', n.precipProb + '%', n.uv, n.wave == null ? '—' : n.wave + ' m'];
  const card = (title: string, list: string[]) => `<article class="card p-7"><h3 class="text-sm font-extrabold text-ocean-700">${title}</h3><ul class="mt-4 space-y-2">${list.map(s => `<li class="text-sm text-slate-700">✓ ${esc(s)}</li>`).join('')}</ul></article>`;
  return `<p class="mt-6 text-sm text-slate-600">${en ? 'Model time (IST)' : 'ಮಾದರಿ ಸಮಯ (IST)'}: <time>${esc(data.observedAt.replace('T', ' '))}</time></p>
  <div class="mt-5 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
  <article class="card p-7"><h3 class="text-sm font-extrabold text-ocean-700">${en ? 'Current model estimate' : 'ಪ್ರಸ್ತುತ ಮಾದರಿ ಅಂದಾಜು'}</h3>
  <p class="mt-3 text-4xl font-black text-ocean-900">${esc(n.icon)} ${esc(n.temp)}°C</p><p class="mt-2 text-sm font-bold">${esc(n.label)}</p>
  <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">${labels.map((l, i) => `<div><dt class="font-bold">${l}</dt><dd>${esc(values[i])}</dd></div>`).join('')}</dl></article>
  <article class="card p-7"><h3 class="text-sm font-extrabold text-ocean-700">${en ? 'Next 7 days' : 'ಮುಂದಿನ ೭ ದಿನಗಳು'}</h3><ul class="mt-5 grid gap-3 sm:grid-cols-2">${data.days.map(d => `<li class="flex items-center gap-3 rounded-2xl border border-ocean-900/10 bg-white px-4 py-3"><span class="text-2xl">${esc(d.icon)}</span><div class="flex-1"><p class="text-sm font-extrabold">${esc(d.weekday)} · ${esc(d.date)}</p><p class="text-sm">${esc(d.label)} · ${esc(d.tmin)}° / ${esc(d.tmax)}°</p><p class="text-xs">${en ? 'Rain' : 'ಮಳೆ'} ${esc(d.precipProb)}% ${d.umbrella ? '☔' : ''}</p></div></li>`).join('')}</ul></article></div>
  ${data.advice.risk.length ? `<aside class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5"><h3 class="font-bold">${en ? 'Model-based cautions' : 'ಮಾದರಿ ಆಧಾರಿತ ಎಚ್ಚರಿಕೆಗಳು'}</h3><ul class="mt-2">${data.advice.risk.map(s => `<li>${esc(s)}</li>`).join('')}</ul></aside>` : ''}
  <div class="mt-6 grid gap-6 md:grid-cols-3">${card(en ? 'What to wear' : 'ಪ್ರಯಾಣ ಉಡುಪು', data.advice.outfit)}${card(en ? 'Things to do' : 'ವಿಹಾರ ವ್ಯವಸ್ಥೆ', data.advice.activity)}${card(en ? 'What to bring' : 'ಜೊತೆ ಇಡಬೇಕಾದವು', data.advice.items)}</div>`;
}

export function tidesView(data: TidesData | null, lang: Lang): string {
  if (!data) return `<p class="mt-6 rounded-2xl bg-sand-100 p-6">${unavailable(lang)}</p>`;
  const en = lang === 'en', W = 640, H = 170, PAD = 10;
  const heights = data.series.map(p => p.height), min = Math.min(...heights), range = Math.max(...heights) - min || 1;
  const x = (i: number) => (PAD + i / (data.series.length - 1) * (W - 2 * PAD)).toFixed(1);
  const y = (h: number) => (PAD + (1 - (h - min) / range) * (H - 2 * PAD)).toFixed(1);
  const points = data.series.map((p, i) => `${x(i)},${y(p.height)}`).join(' ');
  const ni = Math.max(0, data.series.findIndex(p => p.time === data.now.time));
  const sample = esc(data.now.time.replace('T', ' '));
  const start = esc(data.series[0]!.time.replace('T', ' ')), end = esc(data.series.at(-1)!.time.replace('T', ' '));
  return `<div class="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><article class="card p-7"><h3 class="font-extrabold text-ocean-700">${en ? 'Hourly sea-level estimate' : 'ಗಂಟೆಯ ಸಮುದ್ರ ಮಟ್ಟದ ಅಂದಾಜು'}</h3><p class="mt-3 text-4xl font-black">${esc(data.now.height)} m</p><p class="mt-3 text-sm">${en ? 'Sample time (IST)' : 'ಮಾದರಿ ಸಮಯ (IST)'}: <time>${sample}</time></p><p class="mt-5 text-sm">${en ? 'Height relative to global mean sea level, not local water depth.' : 'ಜಾಗತಿಕ ಸರಾಸರಿ ಸಮುದ್ರ ಮಟ್ಟಕ್ಕೆ ಹೋಲಿಸಿದ ಎತ್ತರ; ಸ್ಥಳೀಯ ನೀರಿನ ಆಳವಲ್ಲ.'}</p></article>
  <article class="card p-7"><h3 class="font-extrabold text-ocean-700">${en ? 'Hourly model curve and estimated turning points' : 'ಗಂಟೆಯ ಮಾದರಿ ವಕ್ರರೇಖೆ ಮತ್ತು ಅಂದಾಜು ತಿರುವುಗಳು'}</h3>
  <svg viewBox="0 0 ${W} ${H}" class="mt-4 h-auto w-full" role="img" aria-label="${en ? 'Hourly sea-level model' : 'ಗಂಟೆಯ ಸಮುದ್ರ ಮಟ್ಟದ ಮಾದರಿ'}"><polygon points="${points} 630,160 10,160" fill="#0d9488" fill-opacity="0.12"/><polyline points="${points}" fill="none" stroke="#0d9488" stroke-width="2.5"/><line x1="${x(ni)}" x2="${x(ni)}" y1="0" y2="170" stroke="#073f40" stroke-dasharray="4 4"/><circle cx="${x(ni)}" cy="${y(data.now.height)}" r="4.5" fill="#073f40"/>${data.events.map(e => `<circle cx="${x(e.index)}" cy="${y(e.height)}" r="4" fill="${e.type === 'high' ? '#b91c1c' : '#0369a1'}"/>`).join('')}</svg>
  <p class="mt-2 text-xs">${start} → ${end} IST</p><ul class="mt-5 grid gap-3 sm:grid-cols-2">${data.events.map(e => `<li class="rounded-2xl border border-ocean-900/10 bg-white px-4 py-3 text-sm"><strong>${e.type === 'high' ? (en ? 'Estimated high' : 'ಅಂದಾಜು ಹೆಚ್ಚು ಜಲ') : (en ? 'Estimated low' : 'ಅಂದಾಜು ಕಡಿಮೆ ಜಲ')}</strong><p>${esc(e.time.replace('T', ' '))} IST · ${esc(e.height)} m</p></li>`).join('') || `<li>${en ? 'No upcoming turning point in this model sample.' : 'ಈ ಮಾದರಿಯಲ್ಲಿ ಮುಂದಿನ ತಿರುವು ಲಭ್ಯವಿಲ್ಲ.'}</li>`}</ul></article></div>`;
}
