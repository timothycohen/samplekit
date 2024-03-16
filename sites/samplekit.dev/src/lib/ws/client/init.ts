import { io } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { defineContext } from '$lib/utils/client';
import { addListeners, type ClientSocket } from './events';

const initializeWs = (wsRef: Writable<ClientSocket | null>) => {
	const ws = io(window.location.origin, { transports: ['websocket'] });

	ws.on('connect', () => wsRef.set(ws));
	ws.on('disconnect', () => wsRef.set(null));
	addListeners({ ws });

	return wsRef as Writable<ClientSocket>;
};

const [getService, setService] = defineContext<{ ws: Writable<ClientSocket | null> }>();

const createWSService = () => {
	const wsRef: Writable<ClientSocket | null> = writable(null);
	if (!browser) return setService({ ws: wsRef });

	initializeWs(wsRef);
	setService({ ws: wsRef });
};

export { createWSService, getService as useWsService };
