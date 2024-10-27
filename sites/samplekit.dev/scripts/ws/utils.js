/**
 * Credit
 * Idea of attaching the ref of the ws server onto globalThis
 * https://github.com/suhaildawood/SvelteKit-integrated-WebSocket/blob/main/src/lib/server/webSocketUtils.ts
 */

import { Server } from 'socket.io';
import { adapter } from './redisAdapter';

const WS_SYMBOL = Symbol.for('samplekit.wss');

/** @typedef {import('http').Server | import('http2').Http2SecureServer} HttpServer */

/** @param {HttpServer} httpServer */
export const createWebSocketServer = (httpServer) => {
	const server = new Server(httpServer, { adapter });
	// @ts-expect-error - Not typing globalThis
	globalThis[WS_SYMBOL] = server;
};

/** @returns {Server} */
export const getWebSocketServer = () => {
	// @ts-expect-error - Not typing globalThis
	return globalThis[WS_SYMBOL];
};

export const resetWebSocketServer = () => {
	getWebSocketServer()?.removeAllListeners();
};
