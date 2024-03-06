import { jsonFail, jsonOk } from '$lib/http/server';
import { isValidLang, type Lang, type PostReq, type PostRes } from '.';
import type { RequestHandler } from '@sveltejs/kit';

const EN = ['Yellow', 'Blue', 'Red', 'Green', 'Black', 'Brown', 'Pink', 'Purple', 'White'];
const KO = ['노란색 ', '파란색 ', '빨간색 ', '초록색 ', '검정색 ', '갈색 ', '분홍색 ', '보라색 ', '흰색 '];
const DE = ['Gelb', 'Blau', 'Rot', 'Grün', 'Schwarz', 'Braun', 'Rosa', 'Lila', 'Weiß'];
const colors: Record<Lang, string[]> = { DE, EN, KO };

const getRandomColor: RequestHandler = async ({ request }) => {
	// This is a demo. A better approach would be to use a validation library like zod instead of casting
	const body = (await request.json().catch(() => null)) as PostReq | null;
	if (!body || !body.excludeColor || !isValidLang(body.lang)) return jsonFail(400);
	const { excludeColor, lang, simulateDelay } = body;

	const langColors = colors[lang];

	let newColor = excludeColor;
	while (newColor === excludeColor) {
		newColor = langColors[Math.floor(Math.random() * langColors.length)]!;
	}

	if (simulateDelay) return new Promise((r) => setTimeout(r, 5000)).then(() => jsonOk<PostRes>({ color: newColor }));
	return jsonOk<PostRes>({ color: newColor });
};

export const POST: RequestHandler = getRandomColor;
