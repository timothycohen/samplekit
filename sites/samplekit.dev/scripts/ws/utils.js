// https://github.com/suhaildawood/SvelteKit-integrated-WebSocket/blob/main/src/lib/server/webSocketUtils.ts

import { Server } from 'socket.io';

const WS_SYMBOL = Symbol.for('samplekit.wss');

/**
 * @param {import('vite').ViteDevServer['httpServer']} httpServer
 * @returns {void}
 */
export const createWebSocketServer = (httpServer) => {
	if (!httpServer) throw new Error('httpServer is required');
	// @ts-expect-error - Not typing globalThis
	globalThis[WS_SYMBOL] = new Server(httpServer);
};

/** @returns {import('socket.io').Server} */
export const getWebSocketServer = () => {
	// @ts-expect-error - Not typing globalThis
	return globalThis[WS_SYMBOL];
};

/** @returns {void} */
export const resetWebSocketServer = () => {
	getWebSocketServer()?.removeAllListeners();
};
