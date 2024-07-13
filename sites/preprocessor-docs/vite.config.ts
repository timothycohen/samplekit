import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		target: 'ES2022',
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'ES2022',
		},
	},
});
