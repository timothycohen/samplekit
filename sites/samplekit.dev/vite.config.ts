import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

export default {
	plugins: [enhancedImages(), sveltekit()],
	assetsInclude: '**/*.svx',
	// https://github.com/sveltejs/kit/issues/11658 – Make sure to check Safari
	esbuild: {
		supported: {
			'top-level-await': true,
		},
	},
	// build: {
	// 	target: 'ES2022',
	// },
} satisfies UserConfig;
