import type { APIRoute } from 'astro';
import { getWeather } from '../../lib/weather';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const langParam = url.searchParams.get('lang');
  const lang = langParam === 'en' ? 'en' : 'kn';
  const data = await getWeather(lang);
  if (!data) {
    return new Response(JSON.stringify({ error: 'weather_unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=300',
    },
  });
};
