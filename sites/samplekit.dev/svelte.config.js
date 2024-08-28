import { join } from 'path';
import { sequence, preprocessMeltUI } from '@melt-ui/pp';
import { createKatexLogger, processKatex } from '@samplekit/preprocess-katex';
import { createMdLogger, processMarkdown } from '@samplekit/preprocess-markdown';
import { createShikiLogger, processCodeblockSync } from '@samplekit/preprocess-shiki';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { opts } from './src/lib/shiki/index.js';

const root = join(new URL(import.meta.url).pathname, '..');
const src = join(root, 'src');
const articleRoot = join(src, 'routes/articles');
const formatFilename = (/** @type {string} */ filename) => filename.replace(src, '');
const include = (/** @type {string} */ filename) => filename.startsWith(articleRoot) || filename.endsWith('pp.svelte');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	compilerOptions: {
		runes: true,
		modernAst: true,
	},
	vitePlugin: {
		dynamicCompileOptions(/** @type {{filename: string}} */ { filename }) {
			if (filename.includes('node_modules')) return { runes: undefined };
		},
	},
	preprocess: sequence([
		processCodeblockSync({
			include,
			logger: { ...createShikiLogger(formatFilename), info: undefined },
			opts,
		}),
		processMarkdown({
			include,
			logger: { ...createMdLogger(formatFilename), info: undefined },
		}),
		processKatex({
			include,
			logger: { ...createKatexLogger(formatFilename), info: undefined },
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
