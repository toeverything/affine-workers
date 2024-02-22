const IMAGE_PROXY = '/api/worker/image-proxy';

async function checkHttpsSupport(url: URL): Promise<boolean> {
	const httpsUrl = new URL(url.toString());
	httpsUrl.protocol = 'https:';
	try {
		const response = await fetch(httpsUrl, { method: 'HEAD', redirect: 'manual' });

		if (response.ok || (response.status >= 400 && response.status < 600)) {
			return true;
		}
	} catch (_) {}
	return false;
}

export function imageProxyBuilder(url: string): (url: URL) => Promise<string> {
	try {
		const proxy = new URL(url);
		proxy.pathname = IMAGE_PROXY;

		return async (url) => {
			if (url.protocol !== 'http:') {
				return url.toString();
			} else if (await checkHttpsSupport(url)) {
				url.protocol = 'https:';
				return url.toString();
			}

			proxy.searchParams.set('url', url.toString());
			return proxy.toString();
		};
	} catch (e) {
		return async (url) => url.toString();
	}
}
