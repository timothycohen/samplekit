import { io } from 'socket.io-client';
import { browser } from '$app/environment';
import { defineCtx } from '$lib/utils/client';
import { addListeners } from './events';
import type { ClientSocket } from './types';

const createWsClient = () => {
	let _ws: ClientSocket | null = $state(null); // null on server

	const init = () => {
		if (!browser) return;
		_ws = io(window.location.origin, { transports: ['websocket'] });
		addListeners({ ws: _ws });
	};

	init();

	return {
		get active() {
			return Boolean(_ws?.active);
		},
	};
};

type WSClient = ReturnType<typeof createWsClient>;

const [get, set] = defineCtx<WSClient>();

const createWSCtx = () => {
	set(createWsClient());
};

export { createWSCtx, get as useWsCtx };
