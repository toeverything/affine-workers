export function respBadRequest(error: string) {
	return new Response(JSON.stringify({ msg: error }), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
		status: 400,
	});
}

export function respNotFound(): Response {
	return new Response(JSON.stringify({ msg: '404, not found!' }), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
		status: 404,
	});
}
