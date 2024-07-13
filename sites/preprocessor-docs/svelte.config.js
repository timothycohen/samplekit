/* eslint-disable no-console */

import { processKatex } from '@samplekit/preprocess-katex';
import { processMarkdown } from '@samplekit/preprocess-markdown';
import { processCodeblock } from '@samplekit/preprocess-shiki';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const preprocessorRoot = `${import.meta.dirname}/src/routes/`;

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
		processCodeblock({
			logger: { error: console.error, formatFilename: (filename) => filename.replace(preprocessorRoot, '') },
			include: (filename) => filename.startsWith(preprocessorRoot),
		}),
		processMarkdown({
			include: (filename) => filename.startsWith(preprocessorRoot),
		}),
		processKatex({
			logger: { error: console.error, formatFilename: (filename) => filename.replace(preprocessorRoot, '') },
			include: (filename) => filename.startsWith(preprocessorRoot),
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
