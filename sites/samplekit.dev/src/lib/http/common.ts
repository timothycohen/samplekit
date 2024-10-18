export const httpCodeMap: Record<number, string> = {
	200: 'Success',
	202: 'Accepted',
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
};

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
