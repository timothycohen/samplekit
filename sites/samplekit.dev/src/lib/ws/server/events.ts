import type { ServerSocket } from './types';

export const handleEventsFromClient = (_: { serverSocket: ServerSocket }) => {
	return {
		destroy: () => {},
	};
};
