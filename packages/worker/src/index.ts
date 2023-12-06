import { AFFiNEWorker } from './affine.js';
import { DomainRouterBuilder, domainRoutersHandler } from './router.js';
import type { Env } from './types.js';

const DOMAIN = 'affine-worker.toeverything.workers.dev';

const affine = AFFiNEWorker();

const routers = DomainRouterBuilder.create().add('localhost', '/api/', affine).add(DOMAIN, '/api/', affine).build();

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
