// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { sequence, preprocessMeltUI } from '@melt-ui/pp';
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
