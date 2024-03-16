import { logger } from '$lib/logging/server';
import { onPizza } from '$routes/pizza-party/ws.server';
import type { ServerSocket, IoServer } from './init';

export const addListeners = ({ ws, io }: { ws: ServerSocket; io: IoServer }) => {
	logger.info(
		`WS opened. Socket: ${ws.id}. Session: ${ws.data.sessionId}. User: ${ws.data.userId}. Size ${io.engine.clientsCount}.`,
	);

	ws.on('disconnect', () => {
		logger.info(
			`WS closed. Socket: ${ws.id}. Session: ${ws.data.sessionId}. User: ${ws.data.userId}. Size ${io.engine.clientsCount}.`,
		);
	});

	ws.on('pizza', onPizza(ws));
};
