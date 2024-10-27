import fs from 'fs';
import { createServer } from 'http';
import path from 'path';
import url from 'url';
import { createWebSocketServer } from './ws/utils.js';

// When running through Vite this is unnecessary because the `integratedWebSocketServer` plugin calls
// `createWebSocketServer` with the `ViteDevServer` or `PreviewServer`.
// However, that plugin is not run when `build/index.js` from `@sveltejs/adapter-node` is invoked directly with node.
// Instead, `createWebSocketServer` is called before the SvelteKit handler loads so `getIo()` is available in the app.

const buildPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../build');
const envPath = path.resolve(buildPath, 'env.js');
const handlerPath = path.resolve(buildPath, 'handler.js');

if (!fs.existsSync(envPath) || !fs.existsSync(handlerPath)) {
	console.error('Error: Please run the build script before starting the production server.');
	process.exit(1);
}

const origin = (await import(envPath)).env('ORIGIN', undefined);
if (!origin) {
	console.error(
		'Error: ORIGIN environment variable is required. Ex: `ORIGIN=http://localhost:3000 node scripts/prodServer.js`',
	);
	process.exit(1);
}

const httpServer = createServer();
createWebSocketServer(httpServer);
httpServer.on('request', (await import(handlerPath)).handler);

httpServer.listen(origin.split(':').pop(), () => {
	console.log(`Listening on ${origin}`);
});
