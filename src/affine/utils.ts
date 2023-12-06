import { getDomain } from 'tldts';

export function log(message: string, level: 'INFO' | 'WARN' | 'ERROR', data: Record<string, unknown>) {
	console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...data }));
}

export function fixUrl(url: string): string | null {
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
