import { getIo, type ServerSocket } from '$lib/ws/server';
import { confettiEventName } from './confetti.ws.common';

// each client message will result in a server broadcast to all of the sender's devices
export const registerConfettiHandler = (serverSocket: ServerSocket) => {
	const listener = () => {
		const deviceId = serverSocket.id;
		const userId = serverSocket.data.seshUser?.userId;
		const target = userId ? `user:${userId}` : deviceId;
		getIo().to(target).emit(confettiEventName);
	};

	serverSocket.on(confettiEventName, listener);

	return {
		destroy: () => {
			serverSocket.off(confettiEventName, listener);
		},
	};
};
