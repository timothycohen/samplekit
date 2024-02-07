import { sequence, preprocessMeltUI } from '@melt-ui/pp';
// @ts-expect-error – missing types
import autoSlug from '@svelte-put/preprocess-auto-slug';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { preprocessCodeblock, preprocessTable } from './src/lib/articles/markdown/preprocess.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: sequence([
		preprocessCodeblock(console, (filename) => filename.endsWith('.svx')),
		preprocessTable(console, (filename) => filename.endsWith('.svx')),
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
		},
	},
};

export default config;
