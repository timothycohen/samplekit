import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

export default {
	plugins: [
		// https://github.com/getsentry/sentry-javascript/blob/develop/packages/sveltekit/README.md#4-vite-setup
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'samplekit',
				project: 'samplekit',
				authToken: process.env['SENTRY_AUTH_TOKEN'],
			},
			autoUploadSourceMaps: false,
		}),
		sveltekit(),
	],
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
