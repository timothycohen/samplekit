import { jsonFail, jsonOk } from '$lib/http/server';
import { getNewColor } from './lang.service.server';
import { postReqSchema, type PostRes } from './index';
import type { RequestHandler } from '@sveltejs/kit';

const getRandomColor: RequestHandler = async ({ request }) => {
	const verifiedBody = postReqSchema.safeParse(await request.json().catch(() => null));
	if (!verifiedBody.success) return jsonFail(400);

	const { excludeColor, lang, simulateDelay } = verifiedBody.data;
	const newColor = getNewColor({ lang, excludeColor });

	if (simulateDelay) {
		return new Promise((r) => setTimeout(r, 5000)).then(() => {
			return jsonOk<PostRes>({ color: newColor });
		});
	}
	return jsonOk<PostRes>({ color: newColor });
};

export const POST = getRandomColor;
