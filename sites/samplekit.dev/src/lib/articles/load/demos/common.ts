import type { ArticlePath } from '$lib/articles/schema';
import type { ModuleDefinitions, DemoName, CodeProcessed, ComponentProcessed, MergedProcessed } from './types';

/** @throws Error */
export const demosMap = (() => {
	const metaModules = Object.entries(
		import.meta.glob('/src/routes/articles/**/live-demos/**/meta.preview.ts', { eager: true }),
	) as [string, { default: ModuleDefinitions }][];

	const map: Partial<Record<ArticlePath, { main?: ModuleDefinitions; lazy?: Record<DemoName, ModuleDefinitions> }>> =
		{};

	for (const [url, loaded] of metaModules) {
		const a = url.replace('/src/routes', '').split('/');
		a.pop();
		const demoIdx = a.indexOf('live-demos');
		const articlePath = a.slice(0, demoIdx).join('/') as ArticlePath;
		const demoName = a.slice(demoIdx + 1).join('/');
		if (!map[articlePath]) map[articlePath] = {};
		if (demoName === 'main') map[articlePath]!.main = loaded.default;
		else {
			if (!map[articlePath]!.lazy) map[articlePath]!.lazy = {};
			map[articlePath]!.lazy![demoName] = loaded.default;
		}
	}

	return map;
})();

export const splitAndProcess = <T>(processor: (moduleDefinitions: ModuleDefinitions) => T[]) =>
	Object.entries(demosMap).reduce<Partial<Record<ArticlePath, { main?: T[]; lazy?: Record<DemoName, T[]> }>>>(
		(acc, curr) => {
			const [articlePath, demos] = curr;
			const res: { main?: T[]; lazy?: Record<DemoName, T[]> } = {};

			if (demos.main) {
				res.main = processor(demos.main);
			}

			if (Object.keys(demos.lazy ?? {}).length) {
				res.lazy = {};
				for (const [demoName, demo] of Object.entries(demos.lazy!)) {
					res.lazy[demoName] = processor(demo);
				}
			}
			if (res.lazy || res.main) return { ...acc, [articlePath]: res };
			return acc;
		},
		{},
	);

export const merge = ({
	code,
	components,
}: {
	code?: { main?: CodeProcessed[]; lazy?: Record<DemoName, CodeProcessed[]> };
	components?: { main?: ComponentProcessed[]; lazy?: Record<DemoName, ComponentProcessed[]> };
}): MergedProcessed => {
	const main: Array<CodeProcessed | ComponentProcessed> = [];
	const lazy: Record<DemoName, Array<CodeProcessed | ComponentProcessed>> = {};

	if (code?.main) main.push(...code.main);
	if (components?.main) main.push(...components.main);

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
