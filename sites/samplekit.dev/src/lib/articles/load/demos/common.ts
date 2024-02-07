import type { ModuleDefinitions, DemoName, CodeProcessed, ComponentProcessed, MergedProcessed } from './types';
import type { ArticleSlug } from '../types';

/** @throws Error */
export const demosMap = (() => {
	const metaModules = Object.entries(
		import.meta.glob('/src/routes/articles/**/live-demos/**/meta.preview.ts', { eager: true }),
	) as [string, { default: ModuleDefinitions }][];

	const map: Partial<Record<ArticleSlug, { main?: ModuleDefinitions; lazy?: Record<DemoName, ModuleDefinitions> }>> =
		{};

	for (const [url, loaded] of metaModules) {
		const a = url.replace('/src/routes/articles/', '').split('/');
		const slug = a.splice(0, 2)[0]! as ArticleSlug;
		const demoName = a.splice(0, 1)[0]!;

		if (!map[slug]) map[slug] = {};
		if (demoName === 'main') map[slug]!.main = loaded.default;
		else {
			if (!map[slug]!.lazy) map[slug]!.lazy = {};
			map[slug]!.lazy![demoName] = loaded.default;
		}
	}

	return map;
})();

export const splitAndProcess = <T>(processor: (moduleDefinitions: ModuleDefinitions) => T[]) =>
	Object.entries(demosMap).reduce<Partial<Record<ArticleSlug, { main?: T[]; lazy?: Record<DemoName, T[]> }>>>(
		(acc, curr) => {
			const [articleSlug, demos] = curr;
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
			if (res.lazy || res.main) return { ...acc, [articleSlug]: res };
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
