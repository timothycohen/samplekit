import { sessionCookieName } from '$lib/auth/server/middleware';
import { authAdapter } from '$lib/db/server/repository/authAdapter';
import { wsLogger, setupLogger } from '$lib/logging/server';
import { getWebSocketServer } from '../../../../scripts/ws/utils';
import { handleEventsFromClient } from './events';
import type { IoServer, ServerSocket, SocketData } from './types';
import type { Socket } from 'socket.io';

function extractSessionId({ cookie }: { cookie: string | null | undefined }): string | void {
	const key = sessionCookieName;
	if (cookie) {
		for (const cook of cookie.split(';')) {
			const [name, value] = cook.trim().split('=');
			if (name === key) return value;
		}
	}
}

const addSocketData = async (serverSocket: Socket) => {
	const socketData: SocketData = await (async () => {
		const sessionId = extractSessionId({ cookie: serverSocket.request.headers.cookie });
		if (!sessionId) return { seshUser: null };

		const [session, user] = await authAdapter.userAndSession.get({ sessionId });
		if (session && user) return { seshUser: { userId: user.id, sessionId } };

		return { seshUser: null };
	})();

	serverSocket.data = socketData;
};

const getRoomName = {
	user: (userId: string) => `user:${userId}`,
	session: (sessionId: string) => `session:${sessionId}`,
};

export const authRooms = {
	join: ({ serverSocket, rooms }: { serverSocket: ServerSocket; rooms: Map<string, Set<string>> }) => {
		const socketId = serverSocket.id;
		const { seshUser } = serverSocket.data;

		if (seshUser) {
			const userRoom = getRoomName.user(seshUser.userId);
			serverSocket.join(userRoom);
			const seshRoom = getRoomName.session(seshUser.sessionId);
			serverSocket.join(seshRoom);
			wsLogger.info(
				`ROOMS      | JOIN      | Socket: \`${socketId}\`. \`${userRoom}\` (size ${rooms.get(userRoom)?.size ?? 0}). \`${seshRoom}\` (size ${rooms.get(seshRoom)?.size ?? 0}).`,
			);
		}
	},
	leave: ({ serverSocket, rooms }: { serverSocket: ServerSocket; rooms: Map<string, Set<string>> }) => {
		const socketId = serverSocket.id;
		const { seshUser } = serverSocket.data;

		if (seshUser) {
			const userRoom = getRoomName.user(seshUser.userId);
			serverSocket.leave(userRoom);
			const seshRoom = getRoomName.session(seshUser.sessionId);
			serverSocket.leave(seshRoom);
			wsLogger.info(
				`ROOMS      | LEAVE     | Socket: \`${socketId}\`. \`${userRoom}\` (size ${rooms.get(userRoom)?.size ?? 0}). \`${seshRoom}\` (size ${rooms.get(seshRoom)?.size ?? 0}).`,
			);
		}
	},
};

const initializeSocketIoOrExit = () => {
	const io = getWebSocketServer();
	if (!io) throw new Error('Socket.io not initialized. Check `vite.config.ts` or `scripts/prodServer.js`.');
	setupLogger.info(`socket.io initialized.`);

	io.on('connection', async (socket) => {
		await addSocketData(socket);
		const serverSocket = socket as ServerSocket;
		const socketId = serverSocket.id;

		wsLogger.info(`CONNECTION | OPEN (${io.engine.clientsCount})  | Socket: \`${socketId}\`.`);
		authRooms.join({ serverSocket, rooms: io.sockets.adapter.rooms });
		const destroyers = [handleEventsFromClient({ serverSocket }).destroy];

		serverSocket.on('disconnect', () => {
			authRooms.leave({ serverSocket, rooms: io.sockets.adapter.rooms });
			destroyers.forEach((destroyer) => destroyer());
			wsLogger.info(`CONNECTION | CLOSE (${io.engine.clientsCount}) | Socket: \`${socketId}\`.`);
		});
	});
};

/** Ensure `initializeSocketIoOrExit` is called before calling this function. */
const getIo = getWebSocketServer as () => IoServer;

export { initializeSocketIoOrExit, getIo };
