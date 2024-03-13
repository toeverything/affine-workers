const IMAGE_PROXY = '/api/worker/image-proxy';

const httpsDomain = new Set();

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

async function fixProtocol(url: string): Promise<URL> {
	const targetUrl = new URL(url);
	if (targetUrl.protocol !== 'http:') {
		return targetUrl;
	} else if (httpsDomain.has(targetUrl.hostname)) {
		targetUrl.protocol = 'https:';
		return targetUrl;
	} else if (await checkHttpsSupport(targetUrl)) {
		httpsDomain.add(targetUrl.hostname);
		targetUrl.protocol = 'https:';
		return targetUrl;
	}
	return targetUrl;
}

export function imageProxyBuilder(url: string): (url: string) => Promise<string | undefined> {
	try {
		const proxy = new URL(url);
		proxy.pathname = IMAGE_PROXY;

		return async (url) => {
			try {
				const targetUrl = await fixProtocol(url);
				proxy.searchParams.set('url', targetUrl.toString());
				return proxy.toString();
			} catch (e) {}
			return;
		};
	} catch (e) {
		return async (url) => url.toString();
	}
}
