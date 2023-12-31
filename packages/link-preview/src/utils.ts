import { getDomain, getSubdomain } from 'tldts';

export function fixUrl(url: string): string | null {
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

		if (
			['http:', 'https:'].includes(parsed.protocol) &&
			// check hostname is a valid domain
			`${getSubdomain(url)}.${getDomain(url)}` === parsed.hostname
		) {
			return parsed.toString();
		}
	} catch (_) {}

	return null;
}
