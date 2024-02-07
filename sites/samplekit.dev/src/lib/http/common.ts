export const httpCodeMap: Record<number, string> = {
	200: 'Success',
	202: 'Success',
	400: 'Bad request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not found',
	429: 'Too Many Requests',
	500: 'Internal server error',
};

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
