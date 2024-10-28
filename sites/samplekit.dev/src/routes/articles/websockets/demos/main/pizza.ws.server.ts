import { pluralize } from '$lib/utils/common';
import { getIo, type ServerSocket, wsFail, bounce } from '$lib/ws/server';
import { pizzaEventName, pizzaClientMsgSchema, minPizza, maxPizza, type PizzaClientMsg } from './pizza.ws.common';

// each client message will result in a server broadcast to every client
const createPizzaListener =
	(serverSocket: ServerSocket) =>
	(msg: PizzaClientMsg): boolean => {
		const body = pizzaClientMsgSchema.safeParse(msg);
		if (!body.success) return bounce(serverSocket.id, pizzaEventName);

		const deviceId = serverSocket.id;

		const { count } = body.data;
		if (count > maxPizza) return wsFail(pizzaEventName, deviceId, 400, `That's too much pizza! Max is ${maxPizza}.`);
		if (count < minPizza)
			return wsFail(
				pizzaEventName,
				deviceId,
				400,
				`You need to order at least ${minPizza} ${pluralize('pizza', minPizza)}.`,
			);

		const data = { pizzaCount: count };

		return getIo().emit(pizzaEventName, { data });
	};

export const registerPizzaHandler = (serverSocket: ServerSocket) => {
	const listener = createPizzaListener(serverSocket);
	serverSocket.on(pizzaEventName, listener);
	return {
		destroy: () => {
			serverSocket.off(pizzaEventName, listener);
		},
	};
};
