import { io } from 'socket.io-client';
import { browser } from '$app/environment';
import { defineCtx } from '$lib/utils/client';
import { confettiEventName } from '$routes/articles/websockets/demos/main/confetti.ws.common';
import {
	pizzaEventName,
	type PizzaClientMsg,
	type PizzaServerMsg,
} from '$routes/articles/websockets/demos/main/pizza.ws.common';
import { addListeners } from './events';
import type { Result } from '$lib/utils/common';
import type { ClientSocket } from './types';

const createWsClient = () => {
	let _ws: ClientSocket | null = $state(null); // null on server
	const ws = () => (_ws?.active ? _ws : null);

	const init = () => {
		if (!browser) return;
		_ws = io(window.location.origin, { transports: ['websocket'] });
		addListeners({ ws: _ws });
	};

	const pizza = {
		addListener: (cb: (a: Result<PizzaServerMsg>) => void): void => {
			ws()?.on(pizzaEventName, cb);
		},
		removeListener: (): void => {
			ws()?.off(pizzaEventName);
		},
		sendMessage: (pizzaData: PizzaClientMsg): void => {
			ws()?.emit(pizzaEventName, pizzaData);
		},
	};

	const confetti = {
		addListener: (cb: () => void): void => {
			ws()?.on(confettiEventName, cb);
		},
		removeListener: (): void => {
			ws()?.off(confettiEventName);
		},
		sendMessage: (): void => {
			ws()?.emit(confettiEventName);
		},
	};

	init();

	const reset = () => {
		ws()?.disconnect().connect();
	};

	return {
		get active() {
			return Boolean(_ws?.active);
		},
		reset,
		pizza,
		confetti,
	};
};

type WSClient = ReturnType<typeof createWsClient>;

const [get, set] = defineCtx<WSClient>();

const createWSCtx = () => {
	set(createWsClient());
};

export { createWSCtx, get as useWsCtx };
