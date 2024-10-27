import { logger } from '$lib/logging/client';
import type { ClientSocket } from './types';

export const addListeners = ({ ws }: { ws: ClientSocket }) => {
	ws.on('connect', () => {
		logger.debug(`WS opened. Socket: ${ws.id}.`);
	});

	ws.on('disconnect', () => {
		logger.debug(`WS closed.`);
	});
};
