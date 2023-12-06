import { AFFiNEWorker } from './affine';
import { DomainRouterBuilder, domainRoutersHandler } from './router';
import { Env } from './types';

const DOMAIN = 'cdn.affine.systems';

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
