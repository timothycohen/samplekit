import { logger } from '$lib/logging/client';
import type { Result } from '$lib/utils/common';
import type { PizzaReq, PizzaRes } from '$routes/pizza-party/ws.client';
import type { Socket as _Socket } from 'socket.io-client';

export type ClientEvents = { pizza: (data: PizzaReq) => void };
export type ServerEvents = { pizza: (...args: [Result<PizzaRes>]) => void };
export type EventName = keyof ClientEvents;
export type ClientSocket = _Socket<ServerEvents, ClientEvents>;

export const addListeners = ({ ws }: { ws: ClientSocket }) => {
	ws.on('connect', () => {
		logger.info(`WS opened. Socket: ${ws.id}.`);
	});

	ws.on('disconnect', () => {
		logger.info(`WS closed. Socket: ${ws.id}.`);
	});
};
