import { processKatex, createKatexLogger } from '@samplekit/preprocess-katex';
import { processMarkdown, createMdLogger } from '@samplekit/preprocess-markdown';
import { createShikiLogger, processCodeblockSync } from '@samplekit/preprocess-shiki';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { opts } from './src/lib/shiki/index.js';

const preprocessorRoot = `${import.meta.dirname}/src/routes/`;
const formatFilename = (/** @type {string} */ filename) => filename.replace(preprocessorRoot, '');
const include = (/** @type {string} */ filename) => filename.startsWith(preprocessorRoot);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: true,
		modernAst: true,
	},
	vitePlugin: {
		dynamicCompileOptions({ filename }) {
			if (filename.includes('node_modules')) return { runes: undefined };
		},
	},
	preprocess: [
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
	],
	kit: {
		adapter: adapter(),
		alias: {
			$routes: 'src/routes',
		},
	},
};

export default config;
