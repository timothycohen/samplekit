import { json } from '@sveltejs/kit';
import { httpCodeMap } from '../common';
import type { ZodObject, ZodRawShape } from 'zod';

export function jsonOk<Obliged extends Record<string, unknown> = never, T extends Obliged = Obliged>(
	body: T,
): Response {
	return json({ data: body });
}

export function jsonFail(status: 400 | 401 | 403 | 404 | 429 | 500): Response;
export function jsonFail(status: number, message: string): Response;
export function jsonFail(status: number, message?: string): Response {
	let e: { error: App.JSONError };
	if (message) e = { error: { message, status } };
	else e = { error: { message: httpCodeMap[status] ?? 'Unknown Error', status } };
	return json(e, { status });
}

export const parseReqJson = async <RS extends ZodRawShape>(
	r: Request,
	schema: ZodObject<RS>,
	{ defaults, overrides }: { defaults?: Record<string, unknown>; overrides?: Record<string, unknown> } = {},
) => {
	if (defaults || overrides) {
		return schema.safeParse({ ...defaults, ...(await r.json().catch(() => ({}))), ...overrides });
	}
	return schema.safeParse(await r.json().catch(() => ({})));
};
