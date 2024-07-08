type OriginRule = string | RegExp | ((origin: string) => boolean);

const ALLOW_ORIGIN: OriginRule[] = [
	'https://affine.pro',
	'https://app.affine.pro',
	'https://insider.affine.pro',
	'https://affine.fail',
	'https://try-blocksuite.vercel.app',
	/https?:\/\/localhost(:\d+)/,
	/https:\/\/.*?-toeverything\.vercel\.app$/,
];

function isString(s: OriginRule): s is string {
	return typeof s === 'string' || s instanceof String;
}

export function isOriginAllowed(origin: string, allowedOrigin: OriginRule | OriginRule[] = ALLOW_ORIGIN) {
	if (Array.isArray(allowedOrigin)) {
		for (const allowed of allowedOrigin) {
			if (isOriginAllowed(origin, allowed)) {
				return true;
			}
		}
		return false;
	} else if (isString(allowedOrigin)) {
		return origin === allowedOrigin;
	} else if (allowedOrigin instanceof RegExp) {
		return allowedOrigin.test(origin);
	}
	return allowedOrigin(origin);
}

export function isRefererAllowed(referer: string, allowedOrigin: OriginRule | OriginRule[] = ALLOW_ORIGIN) {
	try {
		const origin = new URL(referer).origin;
		return isOriginAllowed(origin, allowedOrigin);
	} catch (_) {
		return false;
	}
}

const headerFilters = [/^Sec-/i, /^Accept/i, /^User-Agent$/i];

export function cloneHeader(source: Headers) {
	let headers: Record<string, string> = {};
	for (const [key, value] of source.entries()) {
		if (headerFilters.some((filter) => filter.test(key))) {
			headers[key] = value;
		}
	}
	return headers;
}
