import { auth } from '$lib/auth/server';
import { authDbAdapter } from '$lib/auth/server/dbAdapter';
import { logger, setupLogger } from '$lib/logging/server';
import { getWss } from '$lib/ws/server/utils';
import { SocketManager } from './connections';

function extractSessionId({ cookie }: { cookie: string | null | undefined }): string | void {
	const key = 'samplekit_session';
	if (cookie) {
		for (const cook of cookie.split(';')) {
			const [name, value] = cook.trim().split('=');
			if (name === key) return value;
		}
	}
}

// add the ctx to WSSGlobalInstance
// when a ws connection is opened, add the ctx
// close it if the session or user is not found
const initializeWss = async () => {
	const wss = getWss();
	wss.connections = new SocketManager();
	setupLogger.info(`WSS initialized.`);

	wss.on('connection', async (ws, req) => {
		const ctx = await (async () => {
			const socketId = auth.config.generateId();

			const sessionId = extractSessionId({ cookie: req.headers.cookie });
			if (!sessionId) return { socketId, userId: null, sessionId: null };

			const [session, user] = await authDbAdapter.userAndSession.get({ sessionId });
			if (session && user) return { socketId, userId: user.id, sessionId };
			return { socketId, userId: null, sessionId: null };
		})();

		ws.ctx = ctx;
		wss.connections.addCtx(ws.ctx);

		logger.info(
			`WS opened. Socket: ${ws.ctx.socketId}. Session: ${ws.ctx.sessionId}. User: ${ws.ctx.userId}. Size ${wss.connections.size}.`,
		);

		ws.addEventListener('close', () => {
			wss.connections.removeSocket(ws.ctx.socketId);

			logger.info(
				`WS closed. Socket: ${ws.ctx.socketId}. Session: ${ws.ctx.sessionId}. User: ${ws.ctx.userId}. Size ${wss.connections.size}.`,
			);
		});
	});
};

export { initializeWss };
