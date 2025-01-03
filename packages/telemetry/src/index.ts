import { Analytics } from '@customerio/cdp-analytics-node';

function checkProperties(properties: any) {
  if (properties && typeof properties === 'object') {
    if (!properties.$user_id) {
      return false;
    }
    if (properties.serverId && properties.serverId !== 'affine-cloud') {
      return false;
    }
    if (
      properties.$current_url &&
      !properties.$current_url.startsWith('file://./') &&
      !new URL(properties.$current_url).host.endsWith('affine.pro')
    ) {
      return false;
    }
    return true;
  }
  return false;
}

export default {
  async fetch(request, env: Env): Promise<Response> {
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
    const req = new Request(url, request.clone());
    try {
      const body = await request.text();
      const requestData = decodeURIComponent(body).split('data=');
      const payload = requestData[1];
      if (payload) {
        const events = JSON.parse(atob(payload));
        const eventsToSend = events.filter(
          (payload: any) => !payload.event?.includes?.('page_view') && checkProperties(payload.properties),
        );
        if (eventsToSend.length) {
          const sendQueue: Promise<void>[] = [];
          const analytics = new Analytics({
            writeKey: env.CUSTOM_IO_KEY,
            flushInterval: 10,
            maxEventsInBatch: eventsToSend.length,
          });
          for (const event of eventsToSend) {
            sendQueue.push(
              new Promise((resolve) => {
                analytics.track(
                  {
                    userId: event.properties.$user_id,
                    event: event.event,
                    properties: event.properties,
                  },
                  () => {
                    resolve();
                  },
                );
              }),
            );
          }
          await Promise.all(sendQueue);
        }
      }
    } catch (e) {
      console.error(`event can not be parsed`, e);
    }
    const res = await fetch(req, {
      headers,
    });
    return res;
  },
} satisfies ExportedHandler<Env>;
