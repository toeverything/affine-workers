import { IRequest } from 'itty-router';
import { getDomain } from 'tldts';

import { RequestData, ResponseData } from './types';
import { log } from './utils';

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

function fixUrl(url: string): string | null {
	if (typeof url === 'string') {
		if (/^https?:\/\//.test(url)) {
			try {
				new URL(url);
				return url;
			} catch (_) {}
		} else if (getDomain(url)) {
			return 'http://' + url;
		}
	}
	return null;
}

export async function linkPreview(request: IRequest): Promise<Response> {
	const origin = request.headers.get('Origin');
	log('Received request', 'INFO', { origin, method: request.method });

	const requestBody: RequestData = await request.json();
	const targetURL = fixUrl(requestBody.url);
	if (!targetURL) {
		log('Invalid URL', 'ERROR', { origin, url: requestBody.url });
		return new Response(null, {
			status: 400,
			statusText: 'Bad Request',
		});
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
						const property = element.getAttribute('property');
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
			'Access-Control-Allow-Credentials': 'true',
		};
	} else {
		return {};
	}
}
