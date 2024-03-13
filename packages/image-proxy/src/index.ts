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

	const response = await fetch(imageRequest);
	const modifiedResponse = new Response(response.body);
	modifiedResponse.headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') ?? 'null');
	modifiedResponse.headers.set('Vary', 'Origin');
	modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET');
	return modifiedResponse;
}
