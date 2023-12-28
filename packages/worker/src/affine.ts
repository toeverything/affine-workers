import { linkPreview, linkPreviewOption } from '@affine/link-preview';
import { respMethodNotAllowed, type RouterHandler } from '@affine/utils';
import { Router } from 'itty-router';

import type { Env } from './types';

export function AFFiNEWorker(): RouterHandler<Env> {
	const router = Router();

	router.options('/api/worker/linkPreview', linkPreviewOption);
	router.post('/api/worker/linkPreview', linkPreview);

	router.all('*', () => respMethodNotAllowed());

	return (request: Request, env: Env, ctx: ExecutionContext) => {
		return router.handle(request, env, ctx);
	};
}
