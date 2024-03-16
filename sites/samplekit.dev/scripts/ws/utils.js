// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// https://github.com/suhaildawood/SvelteKit-integrated-WebSocket/blob/main/src/lib/server/webSocketUtils.ts

import { parse } from 'url';
import { WebSocketServer } from 'ws';

const WS_SYMBOL = Symbol.for('samplekit.wss');

export const createWebSocketServer = () => {
	globalThis[WS_SYMBOL] = new WebSocketServer({ noServer: true });
};

export const getWebSocketServer = () => {
	return globalThis[WS_SYMBOL];
};

export const onHttpServerUpgrade = (req, sock, head) => {
	const pathname = req.url ? parse(req.url).pathname : null;
	if (pathname !== '/websocket') return;

	const wss = getWebSocketServer();

	wss.handleUpgrade(req, sock, head, (ws) => {
		wss.emit('connection', ws, req);
	});
};

export const resetWebSocketServer = () => {
	getWebSocketServer().close();
	createWebSocketServer();
};
