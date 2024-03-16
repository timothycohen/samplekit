import { getIo, type ServerSocket, wsFail, bounce } from '$lib/ws/server';
import { pizzaReqSchema, type PizzaReq } from './ws.client';

export const onPizza =
	(ws: ServerSocket) =>
	(data: PizzaReq): boolean => {
		const res = pizzaReqSchema.safeParse(data);

		if (!res.success) return bounce(ws, 'pizza');
		const { count, party } = res.data;
		const userId = ws.data.userId;

		if (count > 10) return wsFail('pizza', ws.id, 400, "That's too much pizza! Max is 10.");

		if (party && userId !== null) {
			return getIo()
				.to(userId)
				.emit('pizza', { data: { pizza: '🍕'.repeat(count) } });
		}
		if (party) return wsFail('pizza', ws.id, 401, 'You must be logged in to have a pizza party.');

		return getIo()
			.to(ws.id)
			.emit('pizza', { data: { pizza: '🍕'.repeat(count) } });
	};
