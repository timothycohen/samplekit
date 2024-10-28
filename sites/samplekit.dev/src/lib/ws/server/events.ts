import { registerConfettiHandler } from '$routes/articles/websockets/demos/main/confetti.ws.server';
import { registerPizzaHandler } from '$routes/articles/websockets/demos/main/pizza.ws.server';
import type { ServerSocket } from './types';

export const handleEventsFromClient = ({ serverSocket }: { serverSocket: ServerSocket }) => {
	const { destroy: destroyPizzaHandler } = registerPizzaHandler(serverSocket);
	const { destroy: destroyConfettiHandler } = registerConfettiHandler(serverSocket);

	return {
		destroy: () => {
			destroyPizzaHandler();
			destroyConfettiHandler();
		},
	};
};
