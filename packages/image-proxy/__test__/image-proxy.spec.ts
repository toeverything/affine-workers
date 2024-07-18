import { test } from 'node:test';
import assert from 'node:assert';

import { imageProxy } from '../src/index.js';

await test('image-proxy', async () => {
  const res = await imageProxy(
    new Request('https://affine.pro', {
      headers: {
        origin: 'https://google.com',
      },
    }),
  );
  assert.strictEqual(res.status, 404, "Should return 404 if origin isn't allowed");
});
