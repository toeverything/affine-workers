export function respBadRequest(
	error: string,
	options: {
		allowOrigin?: string | null;
	} = {},
) {
	const headers = new Headers();
	headers.set('content-type', 'application/json;charset=UTF-8');
	if (options.allowOrigin) {
		headers.set('Access-Control-Allow-Origin', options.allowOrigin);
	}
	return new Response(
		JSON.stringify({
			msg: error,
		}),
		{
			headers,
			status: 400,
		},
	);
}

export function respOk(
	body: string | null,
	options: {
		allowOrigin?: string;
	} = {},
) {
	const headers = new Headers();
	headers.set('content-type', 'application/json;charset=UTF-8');
	if (options.allowOrigin) {
		headers.set('Access-Control-Allow-Origin', options.allowOrigin);
	}
	return new Response(body, {
		headers,
		status: 200,
	});
}

export function respNoContent(
	options: {
		allowOrigin?: string;
	} = {},
) {
	const headers = new Headers();
	if (options.allowOrigin) {
		headers.set('Access-Control-Allow-Origin', options.allowOrigin);
	}
	return new Response(null, {
		headers,
		status: 204,
	});
}

export function respNotFound(
	options: {
		allowOrigin?: string;
	} = {},
): Response {
	const headers = new Headers();
	headers.set('content-type', 'application/json;charset=UTF-8');
	if (options.allowOrigin) {
		headers.set('Access-Control-Allow-Origin', options.allowOrigin);
	}
	return new Response(null, {
		headers,
		status: 404,
	});
}

export function respMethodNotAllowed(
	options: {
		allowOrigin?: string;
	} = {},
): Response {
	const headers = new Headers();
	headers.set('content-type', 'application/json;charset=UTF-8');
	if (options.allowOrigin) {
		headers.set('Access-Control-Allow-Origin', options.allowOrigin);
	}
	return new Response(null, {
		headers,
		status: 405,
	});
}
