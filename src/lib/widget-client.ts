import { weatherView, tidesView, unavailable, refreshFailed } from './widget-view';
import type { Lang } from './weather';

document.querySelectorAll<HTMLElement>('[data-widget]').forEach(root => {
  const lang: Lang = root.dataset.lang === 'en' ? 'en' : 'kn';
  const weather = root.dataset.widget === 'weather';
  const panel = root.querySelector<HTMLElement>('[data-widget-body]')!;
  const status = root.querySelector<HTMLElement>('[data-widget-status]')!;
  let hasData = root.dataset.loaded === 'true', pending = false;
  async function refresh() {
    if (pending) return;
    pending = true;
    try {
      const response = await fetch(weather ? '/api/weather?lang=' + lang : '/api/tides', { cache: 'no-store', signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw Error('Unavailable');
      const data = await response.json();
      if (weather ? !data?.observedAt || !data?.now || data.days?.length !== 7 || !data.advice : !data?.now || data.series?.length < 3 || !Array.isArray(data.events)) throw Error('Invalid model data');
      panel.innerHTML = weather ? weatherView(data, lang) : tidesView(data, lang);
      hasData = true;
      status.textContent = '';
    } catch {
      status.textContent = hasData ? refreshFailed(lang) : unavailable(lang);
    } finally { pending = false; }
  }
  refresh();
  setInterval(refresh, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
});
