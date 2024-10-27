import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { createWebSocketServer, resetWebSocketServer } from './scripts/ws/utils';
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
		{
			name: 'integratedWebSocketServer',
			configureServer(server) {
				if (!server.httpServer) throw new Error('No ViteDevServer found');
				createWebSocketServer(server.httpServer);

				server.watcher.on('change', () => {
					resetWebSocketServer();
				});
			},
			configurePreviewServer(server) {
				createWebSocketServer(server.httpServer);
			},
		},
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
