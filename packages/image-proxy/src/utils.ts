type OriginRule = string | RegExp | ((origin: string) => boolean);

const ALLOW_ORIGIN: OriginRule[] = ['https://affine.pro', 'https://app.affine.pro', 'https://insider.affine.pro', 'https://affine.fail'];

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
