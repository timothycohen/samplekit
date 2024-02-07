import { dev } from '$app/environment';
import { defaultMetaRawComponents } from '$lib/articles/schema';
import { demoMetaComponentsMap } from '../common';
import type { NoPropComponent } from '$lib/utils/common';
import type { ArticleSlug, SvelteFileName } from '../common';

type DemoName = string;

export const demoComponentMap: Partial<
	Record<ArticleSlug, Record<DemoName, Record<SvelteFileName, Promise<NoPropComponent>>>>
> = (() => {
	const componentModules = Object.entries(import.meta.glob('/src/routes/articles/**/live-demos/**/*.svelte')) as [
		string,
		() => Promise<{ default: NoPropComponent }>,
	][];

	const modules = componentModules.reduce<
		Partial<Record<ArticleSlug, Record<DemoName, Record<SvelteFileName, Promise<NoPropComponent>>>>>
	>((acc, [url, load]) => {
		const a = url.replace('/src/routes/articles/', '').split('/');
		const slug = a.splice(0, 2)[0]! as ArticleSlug;
		const demoName = a.splice(0, 1)[0]! as DemoName;
		const filename = a.join('/') as SvelteFileName;

		const svelteFileNames = Object.keys(demoMetaComponentsMap[slug]?.[demoName] ?? defaultMetaRawComponents);
		if (!svelteFileNames.includes(filename)) return acc;

		const componentPromise = load().then((c) => c.default);

		if (!acc[slug]) acc[slug] = {};
		if (!acc[slug]![demoName]) acc[slug]![demoName] = {};
		acc[slug]![demoName]![filename] = componentPromise;

		return acc;
	}, {});

	if (dev) {
		for (const articleSlug of Object.keys(demoMetaComponentsMap) as ArticleSlug[]) {
			for (const demoName of Object.keys(demoMetaComponentsMap[articleSlug]!)) {
				for (const filename of Object.keys(demoMetaComponentsMap[articleSlug]![demoName]!) as SvelteFileName[]) {
					if (!modules[articleSlug]?.[demoName]?.[filename]) {
						console.error(`Missing demo component for ${articleSlug}/${demoName}/${filename}`);
					}
				}
			}
		}
	}

	return modules;
})();
