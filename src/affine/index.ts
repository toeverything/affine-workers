import { Router } from 'itty-router';

import { linkPreview, linkPreviewOption } from './link-preview';
import { Env, RouterHandler } from '../types';

export function AFFiNEWorker(): RouterHandler {
	const router = Router();

	router.options('/api/linkPreview', linkPreviewOption);
	router.post('/api/linkPreview', linkPreview);

	router.get('/api/*', () => {
		return new Response(JSON.stringify({ msg: '404, not found!' }), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
			status: 404,
		});
	});

	router.all('*', () => new Response('404, not found!', { status: 404 }));

	return (request: Request, env: Env, ctx: ExecutionContext) => {
		return router.handle(request, env, ctx);
	};
}
