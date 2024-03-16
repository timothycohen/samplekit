import { authDbAdapter } from '$lib/auth/server/dbAdapter';
import { setupLogger } from '$lib/logging/server';
import { getWebSocketServer } from '../../../../scripts/ws/utils';
import { addListeners } from './events';
import type { ClientEvents, ServerEvents } from '../client/events';
import type { Server as _Server, Socket as _Socket } from 'socket.io';

export type SocketData = { userId: string; sessionId: string } | { userId: null; sessionId: null };
export type ServerClusterEvent = never;
export type ServerCtx = never;
export type ServerSocket = _Socket<ClientEvents, ServerEvents, ServerClusterEvent, SocketData>;
export declare class IoServer extends _Server<ClientEvents, ServerEvents, ServerClusterEvent, SocketData> {}

function extractSessionId({ cookie }: { cookie: string | null | undefined }): string | void {
	const key = 'samplekit_session';
	if (cookie) {
		for (const cook of cookie.split(';')) {
			const [name, value] = cook.trim().split('=');
			if (name === key) return value;
		}
	}
}

const addCtx = async ({ ws }: { ws: ServerSocket }) => {
	ws.data = await (async () => {
		const sessionId = extractSessionId({ cookie: ws.request.headers.cookie });
		if (!sessionId) return { userId: null, sessionId: null };
		const [session, user] = await authDbAdapter.userAndSession.get({ sessionId });
		if (session && user) return { userId: user.id, sessionId };
		return { userId: null, sessionId: null };
	})();
};

const joinRooms = ({ ws }: { ws: ServerSocket }) => {
	if (ws.data.userId) ws.join(ws.data.userId);
};

const initializeSocketIo = async () => {
	const io = getIo();
	setupLogger.info(`socket.io initialized.`);

	io.on('connection', async (ws) => {
		await addCtx({ ws });
		addListeners({ ws, io });
		joinRooms({ ws });
	});
};

export const getIo = getWebSocketServer as () => IoServer;
export { initializeSocketIo };
