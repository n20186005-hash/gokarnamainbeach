import astro from '@astrojs/cloudflare/entrypoints/server';

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if ((url.hostname === 'gokarnamainbeach.com' && url.protocol !== 'https:') || url.hostname === 'www.gokarnamainbeach.com') {
      url.protocol = 'https:';
      url.hostname = 'gokarnamainbeach.com';
      return new Response(null, { status: 301, headers: { Location: url.href } });
    }
    const explicitError = /\/(?:404|404\.html)\/?$/.test(url.pathname);
    let routed = request;
    if (explicitError) {
      const missing = new URL('/__missing_error_page__', url);
      routed = new Request(missing, request);
    }
    const response = await astro.fetch(routed, env, context);
    const headers = new Headers(response.headers);
    const status = explicitError ? 404 : response.status;
    if (status === 404) headers.set('X-Robots-Tag', 'noindex, follow');
    return new Response(request.method === 'HEAD' ? null : response.body, { status, statusText: explicitError ? 'Not Found' : response.statusText, headers });
  },
};
