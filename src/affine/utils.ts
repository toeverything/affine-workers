export function log(message: string, level: 'INFO' | 'WARN' | 'ERROR', data: Record<string, unknown>) {
	console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...data }));
}
