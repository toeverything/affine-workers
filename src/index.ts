interface RequestData {
	url: string;
}

interface ResponseData {
	url: string;
	title?: string;
	siteName?: string;
	description?: string;
	images?: string[];
	mediaType?: string;
	contentType?: string;
	charset?: string;
	videos?: string[];
	favicons?: string[];
}

const ALLOWED_ORIGINS = [
	'http://localhost:5173',
	'https://try-blocksuite.vercel.app',
	'https://blocksuite-toeverything.vercel.app',
	'https://affine.pro',
	'https://app.affine.pro',
	'https://insider.affine.pro',
	'https://affine.fail',
];

function log(message: string, level: 'INFO' | 'WARN' | 'ERROR', data: Record<string, unknown>) {
	console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...data }));
}

export default {
	async fetch(request: Request): Promise<Response> {
		const origin = request.headers.get('Origin');
		log('Received request', 'INFO', { origin, method: request.method });

		if (request.method === 'OPTIONS') {
			return handleOptionsRequest(request);
		}

		if (request.method !== 'POST') {
			log('Method Not Allowed', 'WARN', { origin, method: request.method });
			return new Response(null, {
				status: 405,
				statusText: 'Method Not Allowed',
			});
		}

		const requestBody: RequestData = await request.json();
		let targetURL: string = requestBody.url;
		log('Processing request', 'INFO', { origin, url: targetURL });

		if (!/^https?:\/\//.test(targetURL)) {
			targetURL = 'http://' + targetURL;
			log('Adjusted URL', 'INFO', { origin, adjustedUrl: targetURL });
		}

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
	},
};

function handleOptionsRequest(request: Request): Response {
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
