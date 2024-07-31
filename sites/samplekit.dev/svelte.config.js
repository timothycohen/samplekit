import { join } from 'path';
import { sequence, preprocessMeltUI } from '@melt-ui/pp';
import { createMdLogger, processMarkdown } from '@samplekit/preprocess-markdown';
import { createShikiLogger, processCodeblockSync } from '@samplekit/preprocess-shiki';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { opts } from './shiki.config.js';

const root = join(new URL(import.meta.url).pathname, '..');
const src = join(root, 'src');
const articleRoot = join(src, 'routes/articles');
const formatFilename = (/** @type {string} */ filename) => filename.replace(src, '');

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
		processCodeblockSync({
			include: (filename) => filename.startsWith(articleRoot) || filename.endsWith('.svx'),
			logger: { ...createShikiLogger(formatFilename), info: undefined },
			opts,
		}),
		processMarkdown({
			include: (filename) => filename.startsWith(articleRoot) || filename.endsWith('.svx'),
			logger: { ...createMdLogger(formatFilename), info: undefined },
		}),
		vitePreprocess(),
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
