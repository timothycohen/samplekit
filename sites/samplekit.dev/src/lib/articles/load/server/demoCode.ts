import { mdCodeBlockToRawHtml } from '$lib/articles/markdown/codeblock.js';
import type { ArticleSlug } from '../common';

export type DemoModulesCode = Array<{ filename: string; highlightedRawHTML: Promise<string> }>;

type DemoName = string;

/** @throws Error */
export const demoCodeMap: Partial<Record<ArticleSlug, Record<DemoName, DemoModulesCode>>> = (() => {
	const rawModules = Object.entries(import.meta.glob('/src/routes/articles/**/live-demos/**/**', { as: 'raw' })) as [
		string,
		() => Promise<string>,
	][];

	const modules = rawModules.reduce<Partial<Record<ArticleSlug, Record<DemoName, DemoModulesCode>>>>(
		(acc, [url, load]) => {
			const a = url.replace('/src/routes/articles/', '').split('/');
			const slug = a.splice(0, 2)[0]! as ArticleSlug;
			const demoName = a.splice(0, 1)[0]!;
			const filename = a.join('/');
			if (filename === 'meta.components.ts') return acc;
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

	return modules;
})();
