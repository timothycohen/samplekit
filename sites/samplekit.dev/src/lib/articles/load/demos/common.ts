import type { ArticlePath } from '$lib/articles/schemas';
import type {
	ModuleDefinitions,
	DemoName,
	CodeProcessedEager,
	CodeProcessedLazy,
	MergedProcessed,
	ComponentProcessedEager,
	ComponentProcessedLazy,
} from './types';

/** @throws Error */
const demosMap = (() => {
	const metaModules = Object.entries(
		import.meta.glob('/src/routes/articles/**/demos/**/meta.preview.ts', { eager: true }),
	) as [string, { default: ModuleDefinitions }][];

	const map: Partial<
		Record<ArticlePath, { mainPromise?: ModuleDefinitions; lazy?: Record<DemoName, ModuleDefinitions> }>
	> = {};

	for (const [url, loaded] of metaModules) {
		const a = url.replace('/src/routes', '').split('/');
		a.pop();
		const demoIdx = a.indexOf('demos');
		const articlePath = a.slice(0, demoIdx).join('/') as ArticlePath;
		const demoName = a.slice(demoIdx + 1).join('/');
		if (!map[articlePath]) map[articlePath] = {};
		if (demoName === 'main') map[articlePath]!.mainPromise = loaded.default;
		else {
			if (!map[articlePath]!.lazy) map[articlePath]!.lazy = {};
			map[articlePath]!.lazy![demoName] = loaded.default;
		}
	}

	return map;
})();

export const splitAndProcess = <T>(processor: (moduleDefinitions: ModuleDefinitions) => T[]) =>
	Object.entries(demosMap).reduce<Partial<Record<ArticlePath, { mainPromise?: T[]; lazy?: Record<DemoName, T[]> }>>>(
		(acc, curr) => {
			const [articlePath, demos] = curr;
			const res: { mainPromise?: T[]; lazy?: Record<DemoName, T[]> } = {};

			if (demos.mainPromise) {
				res.mainPromise = processor(demos.mainPromise);
			}

			if (Object.keys(demos.lazy ?? {}).length) {
				res.lazy = {};
				for (const [demoName, demo] of Object.entries(demos.lazy!)) {
					res.lazy[demoName] = processor(demo);
				}
			}
			if (res.lazy || res.mainPromise) return { ...acc, [articlePath]: res };
			return acc;
		},
		{},
	);

export const merge = async ({
	code,
	components,
}: {
	code?: { main?: CodeProcessedEager[]; lazy?: Record<DemoName, CodeProcessedLazy[]> };
	components?: { mainPromise?: ComponentProcessedLazy[]; lazy?: Record<DemoName, ComponentProcessedLazy[]> };
}): Promise<MergedProcessed> => {
	const main: Array<CodeProcessedEager | ComponentProcessedEager> = [];
	const lazy: Record<DemoName, Array<CodeProcessedLazy | ComponentProcessedLazy>> = {};

	if (code?.main) main.push(...code.main);
	if (components?.mainPromise)
		main.push(
			...(await Promise.all(components.mainPromise.map(async (c) => ({ ...c, component: await c.component })))),
		);

	for (const [demoName, processed] of Object.entries(code?.lazy || {})) {
		lazy[demoName] = [...processed];
	}

	for (const [demoName, processed] of Object.entries(components?.lazy || {})) {
		if (lazy[demoName]) lazy[demoName]!.push(...processed);
		else lazy[demoName] = [...processed];
	}

	main.sort((a, b) => a.index - b.index);
	for (const value of Object.values(lazy)) {
		value.sort((a, b) => a.index - b.index);
	}

	const res = {} as MergedProcessed;
	if (main.length) res.main = main;
	if (Object.keys(lazy).length) res.lazy = lazy;
	return res;
};
