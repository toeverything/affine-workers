import { imageProxy } from '@affine/image-proxy';
import { linkPreview, linkPreviewOption } from '@affine/link-preview';
import { respMethodNotAllowed, type Env, type RouterHandler } from '@affine/utils';
import { Router } from 'itty-router';

export function AFFiNEWorker(): RouterHandler<Env> {
  const router = Router();

  // deprecated
  router.options('/api/worker/linkPreview', linkPreviewOption);
  router.post('/api/worker/linkPreview', linkPreview);

  router.get('/api/worker/image-proxy', imageProxy);
  router.options('/api/worker/link-preview', linkPreviewOption);
  router.post('/api/worker/link-preview', linkPreview);

  router.all('*', () => respMethodNotAllowed());

  return (request: Request, env: Env, ctx: ExecutionContext) => {
    return router.fetch(request, env, ctx);
  };
}
