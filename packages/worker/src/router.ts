import { respNotFound } from '@affine/utils';
import type { DomainRouters, Env, RouterHandler } from './types';

export class DomainRouterBuilder {
	private routers: DomainRouters = {};

	static create(): DomainRouterBuilder {
		return new DomainRouterBuilder();
	}

	public add(host: string, path: string, handler: RouterHandler) {
		const hostRouter = this.routers[host] || {};
		hostRouter[path] = handler;
		this.routers[host] = hostRouter;

		return this;
	}
	public build(): DomainRouters {
		return this.routers;
	}
}

export async function domainRoutersHandler(routers: DomainRouters, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = new URL(request.url);

	const routerHandlers = routers[url.hostname];
	if (routerHandlers) {
		for (const key in routerHandlers) {
			if (url.pathname.startsWith(key)) {
				const handler = routerHandlers[key];
				return handler(request, env, ctx);
			}
		}
	}
	return respNotFound();
}
