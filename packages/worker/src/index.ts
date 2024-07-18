import { DomainRouterBuilder, domainRoutersHandler, type Env } from '@affine/utils';

import { AFFiNEWorker } from './affine.js';

const WORKER_DOMAIN = 'affine-worker.toeverything.workers.dev';

const affine = AFFiNEWorker();

const routers = DomainRouterBuilder.create<Env>().add('localhost', '/api/', affine).add(WORKER_DOMAIN, '/api/', affine).build();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await domainRoutersHandler(routers, request, env, ctx);
    } catch (e: any) {
      return new Response(
        JSON.stringify({
          success: false,
          message: e.message || e.toString(),
        }),
        { status: 500 },
      );
    }
  },
};
