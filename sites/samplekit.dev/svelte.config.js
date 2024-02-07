// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { sequence, preprocessMeltUI } from '@melt-ui/pp';
// @ts-expect-error – missing types
import autoSlug from '@svelte-put/preprocess-auto-slug';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { mdsvexConfig } from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: sequence([
		mdsvex(mdsvexConfig), // order matters: https://github.com/pngwn/MDsveX/issues/390#issuecomment-1700347137
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
