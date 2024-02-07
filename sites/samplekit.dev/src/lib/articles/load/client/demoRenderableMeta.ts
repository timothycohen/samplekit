import type { ProcessedDemoMeta, RawDemoMeta } from '../../schema';
import type { ArticleSlug } from '../common';

type DemoName = string;

export const demoMetaMap: Partial<Record<ArticleSlug, Record<DemoName, RawDemoMeta>>> = (() => {
	const metaModules = Object.entries(
		import.meta.glob('/src/routes/articles/**/live-demos/**/meta.ts', { eager: true }),
	) as [string, { default: RawDemoMeta }][];

	return metaModules.reduce<Partial<Record<ArticleSlug, Record<DemoName, RawDemoMeta>>>>(
		(acc, [url, { default: meta }]) => {
			const a = url.replace('/src/routes/articles/', '').split('/');
			const slug = a.splice(0, 2)[0]! as ArticleSlug;
			const demoName = a.splice(0, 1)[0]!;
			if (!acc[slug]) acc[slug] = {};

			acc[slug]![demoName] = meta;
			return acc;
		},
		{},
	);
})();

export const addMetaDefaults = (meta?: RawDemoMeta): ProcessedDemoMeta => {
	const res: ProcessedDemoMeta = { title: meta?.title ?? 'Interactive Demo' };
	if (meta?.bg) res.bg = meta?.bg;
	if (meta?.center) res.center = meta?.center;
	if (meta?.noBorder) res.noBorder = meta?.noBorder;
	if (meta?.noPadding) res.noPadding = meta?.noPadding;
	return res;
};
