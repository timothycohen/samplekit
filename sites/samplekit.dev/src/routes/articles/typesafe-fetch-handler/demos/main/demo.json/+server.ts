import { jsonFail, jsonOk, parseReqJson } from '$lib/http/server';
import { getNewColor } from '../lang.service.server';
import { getRandomColorReqSchema, type GetRandomColorRes } from './common';
import type { RequestHandler } from '@sveltejs/kit';

const getRandomColor: RequestHandler = async ({ request }) => {
	const body = await parseReqJson(request, getRandomColorReqSchema);
	if (!body.success) return jsonFail(400);

	const { excludeColor, lang, simulateDelay } = body.data;
	const newColor = getNewColor({ lang, excludeColor });

	if (simulateDelay) {
		return new Promise((r) => setTimeout(r, 5000)).then(() => {
			return jsonOk<GetRandomColorRes>({ color: newColor });
		});
	}
	return jsonOk<GetRandomColorRes>({ color: newColor });
};

export const POST = getRandomColor;
