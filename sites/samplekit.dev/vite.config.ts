import { sentrySvelteKit } from '@sentry/sveltekit';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { createWebSocketServer, onHttpServerUpgrade, resetWebSocketServer } from './scripts/ws/utils';
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
		enhancedImages(),
		sveltekit(),
		{
			name: 'integratedWebSocketServer',
			configureServer(server) {
				createWebSocketServer();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);

				server.watcher.on('change', () => {
					server.httpServer?.off('upgrade', onHttpServerUpgrade);
					resetWebSocketServer();
					server.httpServer?.on('upgrade', onHttpServerUpgrade);
				});
			},
			configurePreviewServer(server) {
				createWebSocketServer();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
		},
	],
	assetsInclude: '**/*.svx',
	// https://github.com/sveltejs/kit/issues/11658 – Make sure to check Safari
	esbuild: {
		supported: {
			'top-level-await': true,
		},
	},
} satisfies UserConfig;
