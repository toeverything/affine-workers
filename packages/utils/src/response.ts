export function respBadRequest(
	error: string,
	options: {
		allowOrigin?: string;
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
	return new Response(
		JSON.stringify({
			msg: '404, not found!',
		}),
		{
			headers,
			status: 404,
		},
	);
}
