import { join } from 'path';
import { sequence, preprocessMeltUI } from '@melt-ui/pp';
import { processMarkdown } from '@samplekit/preprocess-markdown';
import { processCodeblock } from '@samplekit/preprocess-shiki';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { preprocessExternalLinks } from './scripts/preprocessors/anchor.js';
import { addSlugsToHeaders } from './scripts/preprocessors/auto-slug.js';

const root = join(new URL(import.meta.url).pathname, '..');
const src = join(root, 'src');
const articleRoot = join(src, 'routes/articles');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	compilerOptions: {
		runes: true,
		modernAst: true,
	},
	vitePlugin: {
		dynamicCompileOptions({ filename }) {
			if (filename.includes('node_modules')) return { runes: undefined };
		},
	},
	preprocess: sequence([
		processCodeblock({
			logger: { formatFilename: (filename) => filename.replace(articleRoot, ''), ...console },
			include: (filename) => filename.startsWith(articleRoot) || filename.endsWith('.svx'),
		}),
		processMarkdown({
			logger: { formatFilename: (filename) => filename.replace(articleRoot, ''), ...console },
			include: (filename) => filename.startsWith(articleRoot) || filename.endsWith('.svx'),
		}),
		vitePreprocess(),
		preprocessExternalLinks({
			logger: { formatFilename: (filename) => filename.replace(src, ''), ...console },
			include: (filename) => !filename.includes('node_modules'),
		}),
		// Inspired by https://github.com/vnphanquang/svelte-put/blob/main/packages/preprocessors/auto-slug/src/auto-slug.types.ts
		addSlugsToHeaders({
			logger: { formatFilename: (filename) => filename.replace(articleRoot, ''), ...console },
			include: (filename) =>
				filename.includes('src/routes/articles/') && (filename.endsWith('.svx') || filename.endsWith('+page.svelte')),
			tags: ['h2', 'h3', 'h4', 'h5', 'h6'],
		}),
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
