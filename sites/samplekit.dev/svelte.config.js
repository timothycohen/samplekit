import { join } from 'path';
import { sequence, preprocessMeltUI } from '@melt-ui/pp';
import { preprocessCodeblock, preprocessTable } from '@samplekit/markdown';
// @ts-expect-error – missing types
import autoSlug from '@svelte-put/preprocess-auto-slug';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { preprocessExternalLinks } from './scripts/preprocessors/anchor.js';

const root = join(new URL(import.meta.url).pathname, '..');
const src = join(root, 'src');
const articleRoot = join(src, 'routes/articles');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: sequence([
		preprocessCodeblock({
			logger: console,
			include: (filename) => filename.endsWith('.svx'),
			formatLogFilename: (filename) => filename.replace(articleRoot, ''),
		}),
		preprocessTable({
			logger: console,
			include: (filename) => filename.endsWith('.svx'),
			formatLogFilename: (filename) => filename.replace(articleRoot, ''),
		}),
		vitePreprocess(),
		preprocessExternalLinks({
			logger: { formatFilename: (filename) => filename.replace(src, ''), ...console },
			include: (filename) => !filename.includes('node_modules'),
		}),
		// https://github.com/vnphanquang/svelte-put/blob/main/packages/preprocessors/auto-slug/src/auto-slug.types.ts
		autoSlug(() => ({
			tags: ['h2', 'h3', 'h4', 'h5', 'h6'],
			/** @param {{ filename: string, content: string }} param0 */
			files: ({ filename }) => {
				return (
					filename.includes('src/routes/articles/') && (filename.endsWith('.svx') || filename.endsWith('+page.svelte'))
				);
			},
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
