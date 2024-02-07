import type { ArticleSlug } from './types';
import type { MetaProcessedComponents, MetaRawComponents } from '../../schema';

type DemoName = string;

export const demoMetaComponentsMap: Partial<Record<ArticleSlug, Record<DemoName, MetaRawComponents>>> = (() => {
	const metaModules = Object.entries(
		import.meta.glob('/src/routes/articles/**/live-demos/**/meta.components.ts', { eager: true }),
	) as [string, { default: MetaRawComponents }][];

	return metaModules.reduce<Partial<Record<ArticleSlug, Record<DemoName, MetaRawComponents>>>>(
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

export const addMetaComponentsDefaults = (
	meta?: MetaRawComponents[keyof MetaRawComponents],
): MetaProcessedComponents => {
	const res: MetaProcessedComponents = { title: meta?.title ?? 'Interactive Demo' };
	if (meta?.bg) res.bg = meta?.bg;
	if (meta?.center) res.center = meta?.center;
	if (meta?.noBorder) res.noBorder = meta?.noBorder;
	if (meta?.noPadding) res.noPadding = meta?.noPadding;
	return res;
};
