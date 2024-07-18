import { respNotFound } from './response';
import type { DomainRouters, RouterHandler } from './types';

export class DomainRouterBuilder<E> {
  private routers: DomainRouters<E> = {};

  static create<E>(): DomainRouterBuilder<E> {
    return new DomainRouterBuilder();
  }

  public add(host: string, path: string, handler: RouterHandler<E>) {
    const hostRouter = this.routers[host] || {};
    hostRouter[path] = handler;
    this.routers[host] = hostRouter;

    return this;
  }
  public build(): DomainRouters<E> {
    return this.routers;
  }
}

export async function domainRoutersHandler<E>(
  routers: DomainRouters<E>,
  request: Request,
  env: E,
  ctx: ExecutionContext,
): Promise<Response> {
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
