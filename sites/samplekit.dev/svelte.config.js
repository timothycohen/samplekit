import { sequence, preprocessMeltUI } from '@melt-ui/pp';
import { preprocessCodeblock, preprocessTable } from '@samplekit/markdown';
// @ts-expect-error – missing types
import autoSlug from '@svelte-put/preprocess-auto-slug';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: sequence([
		preprocessCodeblock({ logger: console, include: (filename) => filename.endsWith('.svx') }),
		preprocessTable({ logger: console, include: (filename) => filename.endsWith('.svx') }),
		vitePreprocess(),
		// https://github.com/vnphanquang/svelte-put/blob/main/packages/preprocessors/auto-slug/src/auto-slug.types.ts
		autoSlug(() => ({
			tags: ['h2', 'h3', 'h4', 'h5', 'h6'],
			/** @param {{ filename: string, content: string }} param0 */
			files: ({ filename }) => filename.endsWith('.svx'),
			anchor: { content: '#', position: 'prepend' },
		})),
		preprocessMeltUI(),
	]),
	kit: {
		adapter: adapter(),
		alias: {
			$routes: 'src/routes',
			$generated: 'generated',
		},
	},
};

export default config;
