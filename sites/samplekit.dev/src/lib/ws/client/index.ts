import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import { defineEvents } from '$lib/events/common';
import { logger } from '$lib/logging/client';
import { defineContext } from '$lib/utils/client';
import { clientToServer, serverToClient } from '$lib/ws/common/events';

// server ws events are emitted with validateAndEmitFromServer and client code listens for them with onServer
const { validateAndEmit: validateAndEmitFromServer, subscribe: onServer } = defineEvents(
	serverToClient,
	() => !browser,
);

// client code sends events with toServer and the onClient function sends them to the server over ws
const {
	emitTrusted: emitTrustedFromClient,
	subscribe: onClient,
	eventIds,
} = defineEvents(clientToServer, () => !browser);

// serialize and send every emitTrustedFromClient event (except 'bounce') to the server over ws
const clientEventsToServerWs = (ws: WebSocket) => {
	for (const eventId of eventIds) {
		if (eventId === 'bounce') return;

		onClient(eventId, (payload) => {
			if (ws.readyState !== ws.OPEN)
				return emitTrustedFromClient('bounce', { status: 400, message: 'WS Error: Not open' });

			try {
				ws.send(JSON.stringify({ eventId, payload }));
			} catch (err) {
				const message = err instanceof Error ? err.message : 'WS Error';
				return emitTrustedFromClient('bounce', { status: 400, message });
			}
		});
	}
};

const onBounce = (cb: (e: { message: string; status: number }) => void) => {
	onClient('bounce', cb);
};

// validate ws events and emit them to the client code
const serverWsToClientEvent = (messageEvent: MessageEvent) => {
	try {
		const data = JSON.parse(messageEvent.data) ?? {};

		const { eventId, payload } = data;
		if (!eventId) return logger.error(`WS emit failure: No eventId.`);

		const res = validateAndEmitFromServer(eventId, payload);
		if (res.emitted) return;

		if (res.reason === 'invalid_schema') {
			return logger.error(`WS Error: Server event ${eventId} does not match expected schema.`);
		}

		return logger.error(`WS emit ${eventId} failed with message ${res.reason}: ${messageEvent}`);
	} catch (err) {
		logger.error(err);
	}
};

// create a new ws connection, store the ref, and set up event listeners
const initializeWs = (wsRef: Writable<WebSocket | null>) => {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);

	ws.addEventListener('open', () => {
		wsRef.set(ws);
		clientEventsToServerWs(ws);
	});

	ws.addEventListener('close', () => {
		wsRef.set(null);
	});

	ws.addEventListener('message', (event) => {
		serverWsToClientEvent(event);
	});

	return wsRef;
};

// blanket impls for specific events
const initializeDefaultListeners = () => {
	onServer('forceInvalidation', () => {
		invalidateAll();
	});

	onBounce(({ message, status }) => {
		logger.error(`Unable to send via WS: ${status} ${message}`);
	});
};

// use a service so it's accessible from any component
const [getService, setService] = defineContext<{ ws: Writable<WebSocket | null> }>();

const createWSService = () => {
	const wsRef: Writable<WebSocket | null> = writable(null);
	if (!browser) return setService({ ws: wsRef });

	initializeWs(wsRef);
	initializeDefaultListeners();
	setService({ ws: wsRef });
};

export { emitTrustedFromClient as toServer, onServer, onBounce, createWSService, getService as useWsService };
