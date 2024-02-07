import type { NoPropComponent } from '$lib/utils/common';
import type { ArticleSlug } from '../common';

type DemoName = string;

export const demoComponentMap: Partial<Record<ArticleSlug, Record<DemoName, Promise<NoPropComponent>>>> = (() => {
	const componentModules = Object.entries(import.meta.glob('/src/routes/articles/**/live-demos/**/Demo.svelte')) as [
		string,
		() => Promise<{ default: NoPropComponent }>,
	][];

	return componentModules.reduce<Partial<Record<ArticleSlug, Record<DemoName, Promise<NoPropComponent>>>>>(
		(acc, [url, load]) => {
			const a = url.replace('/src/routes/articles/', '').split('/');
			const slug = a.splice(0, 2)[0]! as ArticleSlug;
			const demoName = a.splice(0, 1)[0]!;
			const componentPromise = load().then((c) => c.default);
			if (!acc[slug]) acc[slug] = {};

			acc[slug]![demoName] = componentPromise;
			return acc;
		},
		{},
	);
})();
