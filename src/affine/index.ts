import { Router } from 'itty-router';

import { linkPreview, linkPreviewOption } from './link-preview';
import { Env, RouterHandler } from '../types';
import { respNotFound } from '../utils';

export function AFFiNEWorker(): RouterHandler {
	const router = Router();

	router.options('/api/linkPreview', linkPreviewOption);
	router.post('/api/linkPreview', linkPreview);

	router.get('/api/*', () => respNotFound());
	router.all('*', () => new Response('404, not found!', { status: 404 }));

	return (request: Request, env: Env, ctx: ExecutionContext) => {
		return router.handle(request, env, ctx);
	};
}
