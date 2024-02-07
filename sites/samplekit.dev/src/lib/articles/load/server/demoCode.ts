import { mdCodeBlockToRawHtml } from '$lib/articles/markdown/codeblock.js';
import type { MetaRawCode } from '$lib/articles/schema';
import type { ArticleSlug } from '../common';

export type DemoModulesCode = Array<{ filename: string; highlightedRawHTML: Promise<string> }>;

type DemoName = string;

/** @throws Error */
export const demoCodeMap: Partial<Record<ArticleSlug, Record<DemoName, DemoModulesCode>>> = (() => {
	const rawLocalModules = Object.entries(
		import.meta.glob('/src/routes/articles/**/live-demos/**/**', { as: 'raw' }),
	) as [string, () => Promise<string>][];

	const rawForeignModules = Object.entries(
		import.meta.glob('/src/routes/articles/**/live-demos/**/meta.code.ts', { eager: true }),
	) as [string, { default: MetaRawCode }][];

	const localModules = rawLocalModules.reduce<Partial<Record<ArticleSlug, Record<DemoName, DemoModulesCode>>>>(
		(acc, [url, load]) => {
			const a = url.replace('/src/routes/articles/', '').split('/');
			const slug = a.splice(0, 2)[0]! as ArticleSlug;
			const demoName = a.splice(0, 1)[0]!;
			const filename = a.join('/');
			if (filename === 'meta.components.ts' || filename === 'meta.code.ts') return acc;
			const lang = filename.split('.').pop();

			const codePromise = load().then((rawCode) => {
				const { data, error } = mdCodeBlockToRawHtml({ lang, rawCode });
				if (!data) {
					throw new Error(`Slug "${slug}" | ${error}`);
				}
				return data;
			});

			if (!acc[slug]) acc[slug] = {};
			if (!acc[slug]![demoName]) acc[slug]![demoName] = [];
			acc[slug]![demoName]!.push({ filename, highlightedRawHTML: codePromise });
			return acc;
		},
		{},
	);

	for (const [url, loaded] of rawForeignModules) {
		const a = url.replace('/src/routes/articles/', '').split('/');
		const slug = a.splice(0, 2)[0]! as ArticleSlug;
		const demoName = a.splice(0, 1)[0]!;
		if (!localModules[slug]) localModules[slug] = {};
		if (!localModules[slug]![demoName]) localModules[slug]![demoName] = [];

		loaded.default.modules.forEach(({ rawCodePromise, title: filename }) => {
			const lang = filename.split('.').pop();
			const highlightedRawHTML = rawCodePromise().then((rawCode) => {
				const { data, error } = mdCodeBlockToRawHtml({ lang, rawCode });
				if (!data) {
					throw new Error(`Slug "${slug}" | ${error}`);
				}
				return data;
			});

			localModules[slug]![demoName]!.push({ filename, highlightedRawHTML });
		});
	}

	return localModules;
})();
