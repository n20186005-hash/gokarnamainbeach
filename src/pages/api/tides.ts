import type { APIRoute } from 'astro';
import { getTides } from '../../lib/tides';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await getTides();
  if (!data) {
    return new Response(JSON.stringify({ error: 'tides_unavailable' }), {
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
