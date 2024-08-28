import { processCode } from '$lib/articles/load/demos/server';

type Title =
	| '$lib/http/client.svelte.ts'
	| '$lib/http/common.ts'
	| '$lib/http/server/json.ts'
	| '$lib/utils/common/types/result.ts';

const code = (
	await Promise.all(
		processCode([
			{ title: '$lib/http/client.svelte.ts', loadRaw: () => import('/src/lib/http/client.svelte.ts?raw') },
			{ title: '$lib/http/common.ts', loadRaw: () => import('/src/lib/http/common.ts?raw') },
			{ title: '$lib/http/server/json.ts', loadRaw: () => import('/src/lib/http/server/json.ts?raw') },
			{
				title: '$lib/utils/common/types/result.ts',
				loadRaw: () => import('/src/lib/utils/common/types/result.ts?raw'),
			},
		]).map(async (c) => ({ ...c, rawHTML: await c.rawHTML })),
	)
).reduce(
	(acc, c) => ({ ...acc, [c.title]: c }),
	{} as Record<
		Title,
		{
			rawHTML: string;
			title: string;
			index: number;
			lang: string;
		}
	>,
);

export const load = async () => {
	return { code };
};
