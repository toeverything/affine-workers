import { getDomain, getSubdomain } from 'tldts';

export function fixUrl(url: string): URL | null {
	if (typeof url !== 'string') {
		return null;
	}

	let fullUrl = url;

	// don't require // prefix, URL can handle protocol:domain
	if (!url.startsWith('http:') && !url.startsWith('https:')) {
		fullUrl = 'http://' + url;
	}

	try {
		const parsed = new URL(fullUrl);

		const subDomain = getSubdomain(url);
		const mainDomain = getDomain(url);
		const fullDomain = subDomain ? `${subDomain}.${mainDomain}` : mainDomain;

		if (
			['http:', 'https:'].includes(parsed.protocol) &&
			// check hostname is a valid domain
			fullDomain === parsed.hostname
		) {
			return parsed;
		}
	} catch (_) {}

	return null;
}
