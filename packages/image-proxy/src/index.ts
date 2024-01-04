import { respBadRequest, log, respNotFound } from '@affine/utils';
import type { IRequest } from 'itty-router';
import { isOriginAllowed } from './utils';

export async function imageProxy(request: IRequest) {
	if (!isOriginAllowed(request.headers.get('Origin') ?? '')) {
		log('Invalid Origin', 'ERROR', { origin: request.headers.get('Origin') });
		return respNotFound();
	}

	const url = new URL(request.url);
	const imageURL = url.searchParams.get('url');
	if (!imageURL) {
		return respBadRequest('Missing "url" parameter');
	}

	const imageRequest = new Request(imageURL, {
		method: 'GET',
		headers: request.headers,
	});

	const response = await fetch(imageRequest);
	const modifiedResponse = new Response(response.body);
	modifiedResponse.headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') ?? 'null');
	modifiedResponse.headers.set('Vary', 'Origin');
	modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET');
	return modifiedResponse;
}
