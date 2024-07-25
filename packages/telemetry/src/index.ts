export default {
  async fetch(request): Promise<Response> {
    // https://github.com/mixpanel/tracking-proxy/blob/master/nginx.conf
    const headers = new Headers(request.headers);
    if (request.method !== 'POST' && request.method !== 'OPTIONS') {
      console.log(request.headers.get('Origin'));
      return new Response('Method Not Allowed', { status: 405 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }
    headers.set('Host', 'api-js.mixpanel.com');
    const url = new URL(request.url);
    url.host = 'api-js.mixpanel.com';
    const req = new Request(url, request);
    const res = await fetch(req, {
      headers,
    });
    return res;
  },
} satisfies ExportedHandler<Env>;
