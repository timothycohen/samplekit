import { toClient, onClient } from '$lib/ws/server';

onClient('pizza', async ({ count, party }, { socketId, userId }) => {
	const pizzas = '🍕'.repeat(count);

	if (count > 10) {
		return toClient(
			'error',
			{ status: 400, message: `You can't have more than 10 pizzas at once.`, eventId: 'pizza' },
			{ socketIds: [socketId] },
		);
	}

	if (party) {
		if (!userId)
			return toClient(
				'error',
				{ status: 401, message: `You must be logged in to have a pizza party.`, eventId: 'pizza' },
				{ socketIds: [socketId] },
			);

		return toClient('pizza', { pizzas }, { userIds: [userId] });
	}

	return toClient('pizza', { pizzas }, { socketIds: [socketId] });
});
