import { z } from 'zod';

export const defineEvents = <ES extends Record<string, z.AnyZodObject>, HandlerCtx = void>(
	eventSchemas: ES,
	failGuard: () => boolean = () => false,
) => {
	type AddHandlers<T extends Record<string, z.ZodObject<z.ZodRawShape>>> = {
		[K in keyof T]: { schema: T[K]; handlers: ((data: z.infer<T[K]>, ctx: HandlerCtx) => void)[] };
	};

	const events: AddHandlers<typeof eventSchemas> = Object.fromEntries(
		Object.entries(eventSchemas).map(([key, schema]) => [key, { schema, handlers: [] }]),
	) as unknown as AddHandlers<typeof eventSchemas>;

	type Data<ID extends keyof typeof events> = z.infer<(typeof events)[ID]['schema']>;

	type EmitRes =
		| { emitted: false; reason: 'guarded' | 'not_registered' | 'no_handlers' | 'invalid_schema' | 'handler_error' }
		| { emitted: true; emittedCount: number; failedCount: number };

	type Emit = <ID extends keyof typeof events>(id: ID, data: Data<ID>, ctx: HandlerCtx) => EmitRes;

	type Subscribe = <ID extends keyof typeof events>(id: ID, handle: (data: Data<ID>, ctx: HandlerCtx) => void) => void;

	const subscribe: Subscribe = (id, handle) => {
		if (failGuard()) return;
		const handlers = events[id]?.handlers;
		if (!handlers) throw new Error(`Event ${String(id)} is not registered`);
		handlers.push(handle);
	};

	const validateAndEmit: Emit = (id, data, ctx) => {
		if (failGuard()) return { emitted: false, reason: 'guarded' };
		const registered = events[id];
		if (!registered) return { emitted: false, reason: 'not_registered' };
		if (!registered.handlers.length) return { emitted: false, reason: 'no_handlers' };
		const { handlers, schema } = registered;

		const validated = schema.safeParse(data);
		if (!validated.success) return { emitted: false, reason: 'invalid_schema' };
		const validatedData = validated.data;

		let emittedCount = 0;
		let failedCount = 0;
		handlers.forEach((h) => {
			try {
				h(validatedData, ctx);
				emittedCount++;
			} catch (err) {
				failedCount++;
			}
		});

		if (emittedCount === 0) return { emitted: false, reason: 'handler_error' };

		return { emitted: true, emittedCount, failedCount };
	};

	const emitTrusted: Emit = (id, unvalidated, ctx) => {
		if (failGuard()) return { emitted: false, reason: 'guarded' };
		const registered = events[id];
		if (!registered) return { emitted: false, reason: 'not_registered' };
		if (!registered.handlers.length) return { emitted: false, reason: 'no_handlers' };
		const { handlers } = registered;

		let emittedCount = 0;
		let failedCount = 0;
		handlers.forEach((h) => {
			try {
				h(unvalidated, ctx);
				emittedCount++;
			} catch (err) {
				failedCount++;
			}
		});

		if (emittedCount === 0) return { emitted: false, reason: 'handler_error' };

		return { emitted: true, emittedCount, failedCount };
	};

	const eventIds = Object.keys(events) as (keyof typeof events)[];

	return { subscribe, validateAndEmit, emitTrusted, eventIds };
};
