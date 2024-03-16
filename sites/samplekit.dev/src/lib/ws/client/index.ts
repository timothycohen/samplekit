import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { defineContext } from '$lib/utils/client';

const initializeWs = (wsRef: Writable<WebSocket | null>) => {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);

	ws.addEventListener('open', () => {
		wsRef.set(ws);
	});

	ws.addEventListener('close', () => {
		wsRef.set(null);
	});

	return wsRef;
};

const [getService, setService] = defineContext<{ ws: Writable<WebSocket | null> }>();

const createWSService = () => {
	const wsRef: Writable<WebSocket | null> = writable(null);
	if (!browser) return setService({ ws: wsRef });

	initializeWs(wsRef);
	setService({ ws: wsRef });
};

export { createWSService, getService as useWsService };
