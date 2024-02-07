import { json } from '@sveltejs/kit';
import { httpCodeMap } from '../common';

export const jsonOk = <T extends Record<string, unknown>>(body?: T) =>
	body ? json({ data: body }) : json({ data: { message: 'Success' } });

export function jsonFail(status: 400 | 401 | 403 | 404 | 429 | 500): Response;
export function jsonFail(status: number, message: string): Response;
export function jsonFail(status: number, message?: string): Response {
	let e: { error: App.JSONError };
	if (message) e = { error: { message, status } };
	else e = { error: { message: httpCodeMap[status] ?? 'Unknown Error', status } };
	return json(e, { status });
}
