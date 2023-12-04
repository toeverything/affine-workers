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
	'https://try-blocksuite.vercel.app/',
	'https://blocksuite-toeverything.vercel.app/',
	'https://affine.pro',
	'https://app.affine.pro',
	'https://insider.affine.pro',
	'https://affine.fail',
];

export default {
	async fetch(request: Request): Promise<Response> {
		const origin = request.headers.get('Origin');

		if (request.method === 'OPTIONS') {
			return handleOptionsRequest(request);
		}

		if (request.method !== 'POST') {
			return new Response(null, {
				status: 405,
				statusText: 'Method Not Allowed',
			});
		}

		const requestBody: RequestData = await request.json();
		let targetURL: string = requestBody.url;

		if (!/^https?:\/\//.test(targetURL)) {
			targetURL = 'http://' + targetURL;
		}

		const response: Response = await fetch(targetURL, {
			cf: {
				cacheTtl: 43200,
				cacheEverything: true,
			},
		});

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
								// 添加更多的 OpenGraph 标签处理逻辑
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
		}

		const json = JSON.stringify(res);
		return new Response(json, {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
				...getCorsHeaders(origin),
			},
		});
	},
};

function handleOptionsRequest(request: Request): Response {
	const origin = request.headers.get('Origin');
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
