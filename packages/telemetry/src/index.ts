export default {
  async fetch(request): Promise<Response> {
    // https://github.com/mixpanel/tracking-proxy/blob/master/nginx.conf
    const headers = new Headers(request.headers);
    if (request.method !== 'POST' && request.method !== 'OPTIONS') {
      console.log(request.headers.get('Origin'));
      return new Response('Method Not Allowed', { status: 405 });
    }
    headers.set('Host', 'api-eu.mixpanel.com');
    const res = await fetch(request, {
      headers,
    });
    return res;
  },
} satisfies ExportedHandler<Env>;
