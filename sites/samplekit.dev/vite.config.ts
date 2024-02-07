import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

export default {
	plugins: [enhancedImages(), sveltekit()],
	assetsInclude: '**/*.svx',
} satisfies UserConfig;
