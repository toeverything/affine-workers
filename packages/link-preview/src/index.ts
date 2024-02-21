import { fixUrl, isOriginAllowed, isRefererAllowed, log, respBadRequest } from '@affine/utils';
import type { IRequest } from 'itty-router';

import type { RequestData, ResponseData } from './types';

const ALLOWED_ORIGINS = [
	'http://localhost:5173',
	'http://localhost:8080',
	'https://try-blocksuite.vercel.app',
	'https://blocksuite-toeverything.vercel.app',
	'https://affine.pro',
	'https://app.affine.pro',
	'https://insider.affine.pro',
	'https://affine.fail',
];

export async function linkPreview(request: IRequest): Promise<Response> {
	const origin = request.headers.get('Origin') ?? '';
	const referer = request.headers.get('Referer') ?? '';
	if (!isOriginAllowed(origin) && !isRefererAllowed(referer)) {
		log('Invalid Origin', 'ERROR', { origin, referer });
		return respBadRequest('Invalid header');
	}

	log('Received request', 'INFO', { origin, method: request.method });

	const requestBody = await request.json<RequestData>().catch(() => {
		log('Invalid request body', 'ERROR', { origin });
		return null;
	});
	if (!requestBody) {
		return respBadRequest('Invalid request body', { allowOrigin: origin });
	}

	const targetURL = fixUrl(requestBody.url);
	if (!targetURL) {
		log('Invalid URL', 'ERROR', { origin, url: requestBody.url });
		return respBadRequest('Invalid URL', { allowOrigin: origin });
	}

	log('Processing request', 'INFO', { origin, url: targetURL });

	try {
		const response: Response = await fetch(targetURL, {
			cf: {
				cacheTtl: 43200,
				cacheEverything: true,
			},
		});
		log('Fetched URL', 'INFO', { origin, url: targetURL, status: response.status });

		const res: ResponseData = {
			url: response.url,
			images: [],
			videos: [],
			favicons: [],
		};

		if (response.body) {
			const rewriter = new HTMLRewriter()
				.on('meta', {
					element(element) {
						const property = element.getAttribute('property') ?? element.getAttribute('name');
						const content = element.getAttribute('content');
						if (property && content) {
							switch (property.toLowerCase()) {
								case 'og:title':
									res.title = content;
									break;
								case 'og:site_name':
									res.siteName = content;
									break;
								case 'og:description':
									res.description = content;
									break;
								case 'og:image':
									res.images?.push(content);
									break;
								case 'og:video':
									res.videos?.push(content);
									break;
								case 'og:type':
									res.mediaType = content;
									break;
								case 'description':
									if (!res.description) {
										res.description = content;
									}
							}
						}
					},
				})
				.on('link', {
					element(element) {
						if (element.getAttribute('rel') === 'icon') {
							const href = element.getAttribute('href');
							if (href) {
								res.favicons?.push(href);
							}
						}
					},
				})
				.on('title', {
					text(text) {
						if (!res.title) {
							res.title = text.text;
						}
					},
				})
				.on('img', {
					element(element) {
						const src = element.getAttribute('src');
						if (src) {
							res.images?.push(src);
						}
					},
				})
				.on('video', {
					element(element) {
						const src = element.getAttribute('src');
						if (src) {
							res.videos?.push(src);
						}
					},
				});

			await rewriter.transform(response).text();
			log('Processed response with HTMLRewriter', 'INFO', { origin, url: response.url });
		}

		const json = JSON.stringify(res);
		log('Sending response', 'INFO', { origin, url: res.url, responseSize: json.length });
		return new Response(json, {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
				...getCorsHeaders(origin),
			},
		});
	} catch (error) {
		log('Error fetching URL', 'ERROR', { origin, url: targetURL, error });
		return new Response(null, {
			status: 500,
			statusText: 'Internal Server Error',
		});
	}
}

export function linkPreviewOption(request: IRequest): Response {
	const origin = request.headers.get('Origin');
	log('Handling OPTIONS request', 'INFO', { origin });
	return new Response(null, {
		headers: {
			...getCorsHeaders(origin),
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	});
}

function getCorsHeaders(origin: string | null): { [key: string]: string } {
	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		return {
			'Access-Control-Allow-Origin': origin,
		};
	} else {
		return {};
	}
}
