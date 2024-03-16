import { auth } from '$lib/auth/server';
import { authDbAdapter } from '$lib/auth/server/dbAdapter';
import { defineEvents } from '$lib/events/common';
import { logger, setupLogger } from '$lib/logging/server';
import { clientToServer, serverToClient } from '$lib/ws/common/events';
import { WS, getWss, type MessageEvent, type WSCtx } from '$lib/ws/server/utils';
import { SocketManager } from './connections';

// client ws events are emitted with validateAndEmitFromClient and server code listens for them with onClient
const { validateAndEmit: validateAndEmitFromClient, subscribe: onClient } = defineEvents<typeof clientToServer, WSCtx>(
	clientToServer,
);

// server code sends events with toClient and the onServer function sends them to the client over ws
const {
	emitTrusted: emitTrustedFromServer,
	subscribe: onServer,
	eventIds,
} = defineEvents<typeof serverToClient, Partial<{ socketIds: string[]; userIds: string[] }> | 'all'>(serverToClient);

// serialize and send every emitTrustedFromServer event (except 'bounce') to the correct client over ws
const serverEventsToClientWs = (ws: WS) => {
	for (const eventId of eventIds) {
		if (eventId === 'bounce') return;

		onServer(eventId, (payload, to) => {
			const shouldSend = (() => {
				if (to === 'all') return true;
				if (!to.socketIds?.length && !to.userIds?.length) return false;
				if (to.socketIds?.length && to.socketIds.includes(ws.ctx.socketId)) return true;
				const userId = getWss().connections.getCtx(ws.ctx.socketId)?.userId;
				if (userId && to.userIds?.includes(userId)) return true;
				return false;
			})();

			if (!shouldSend) return;

			if (ws.readyState !== ws.OPEN)
				return emitTrustedFromServer('bounce', { status: 400, message: 'WS Error: Not open' }, 'all');

			try {
				ws.send(JSON.stringify({ eventId, payload }));
			} catch (err) {
				const message = err instanceof Error ? err.message : 'WS Error';
				return emitTrustedFromServer('bounce', { status: 400, message }, 'all');
			}
		});
	}
};

const onBounce = (cb: (e: { message: string; status: number }) => void) => {
	onServer('bounce', cb);
};

// validate ws events and emit them to the server code
const clientWsToServerEvent = (a: { messageEvent: MessageEvent; handlerCtx: WSCtx }) => {
	try {
		const data = JSON.parse(a.messageEvent.data as string) ?? {};

		const { eventId, payload } = data;
		if (!eventId) logger.error(`WS emit failure: No eventId.`);

		const res = validateAndEmitFromClient(eventId, payload, a.handlerCtx);
		if (res.emitted) return;

		if (res.reason === 'invalid_schema') {
			return logger.error(`WS Error: Client event ${eventId} does not match expected schema.`);
		}

		return logger.error(`WS emit ${eventId} failed with message ${res.reason}: ${a.messageEvent}`);
	} catch (err) {
		logger.error(err);
	}
};

// import the *.ws/onClient.ts files which handle the ws events sent from the client
const loadWsSubscriptions = () => {
	const _wsServerHandlers = Object.entries(import.meta.glob('/src/routes/**/*.ws/server.ts'));
	_wsServerHandlers.forEach(([_, initialize]) => initialize());
};

// blanket impls for specific events
const initializeDefaultListeners = () => {
	onBounce(({ message, status }) => {
		logger.error(`Unable to send via WS: ${status} ${message}`);
	});

	onClient('error', (error) => {
		logger.error({ error });
	});
};

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
// add event listeners
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

		serverEventsToClientWs(ws);

		logger.info(
			`WS opened. Socket: ${ws.ctx.socketId}. Session: ${ws.ctx.sessionId}. User: ${ws.ctx.userId}. Size ${wss.connections.size}.`,
		);

		ws.addEventListener('close', () => {
			wss.connections.removeSocket(ws.ctx.socketId);

			logger.info(
				`WS closed. Socket: ${ws.ctx.socketId}. Session: ${ws.ctx.sessionId}. User: ${ws.ctx.userId}. Size ${wss.connections.size}.`,
			);
		});

		ws.addEventListener('message', (messageEvent) => {
			clientWsToServerEvent({ messageEvent, handlerCtx: ws.ctx });
		});
	});

	initializeDefaultListeners();
	loadWsSubscriptions();
};

export { emitTrustedFromServer as toClient, onClient, onBounce, initializeWss };
