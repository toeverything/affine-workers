export interface Env {
	CDN: R2Bucket;
}

export type RouterHandler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;
export type HostHandlers = Record<string, RouterHandler>;
export type DomainRouters = Record<string, HostHandlers>;
