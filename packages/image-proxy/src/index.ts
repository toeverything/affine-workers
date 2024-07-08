import { cloneHeader, fixUrl, isOriginAllowed, isRefererAllowed, log, respBadRequest, respNotFound } from '@affine/utils';
import type { IRequest } from 'itty-router';

export async function imageProxy(request: IRequest) {
	const origin = request.headers.get('Origin') ?? '';
	const referer = request.headers.get('Referer') ?? '';
	if (!isOriginAllowed(origin) && !isRefererAllowed(referer)) {
		log('Invalid Origin', 'ERROR', { origin, referer });
		return respNotFound();
	}

	const url = new URL(request.url);
	const imageURL = url.searchParams.get('url');
	if (!imageURL) {
		return respBadRequest('Missing "url" parameter');
	}

	const targetURL = fixUrl(imageURL);
	if (!targetURL) {
		log('Invalid URL', 'ERROR', { origin, url: imageURL });
		return respBadRequest('Invalid URL', { allowOrigin: origin });
	}

	const imageRequest = new Request(targetURL.toString(), {
		method: 'GET',
		headers: cloneHeader(request.headers),
	});

	const accept = request.headers.get('accept');
	const response = await fetch(imageRequest, {
		cf: {
			image: {
				fit: 'scale-down',
				width: 1280,
				format: accept && /image\/avif/.test(accept) ? 'avif' : 'webp',
			},
		},
	});
	const modifiedResponse = new Response(response.body);
	modifiedResponse.headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') ?? 'null');
	modifiedResponse.headers.set('Vary', 'Origin');
	modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET');
	const contentType = response.headers.get('Content-Type');
	contentType && modifiedResponse.headers.set('Content-Type', contentType);
	const contentDisposition = response.headers.get('Content-Disposition');
	contentDisposition && modifiedResponse.headers.set('Content-Disposition', contentDisposition);
	return modifiedResponse;
}
