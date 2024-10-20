import { z } from 'zod';
import { ClientFetcher } from '$lib/http/client.svelte';
import { langs } from './lang.service.common';
import type { RouteId } from './$types';

export const getRandomColorReqSchema = z.object({
	lang: z.enum(langs),
	excludeColor: z.string(),
	simulateDelay: z.boolean().optional(),
});
export type GetRandomColorReq = z.infer<typeof getRandomColorReqSchema>;
export type GetRandomColorRes = { color: string };
export const getRandomColor = new ClientFetcher<RouteId, GetRandomColorRes, GetRandomColorReq>(
	'POST',
	'/articles/typesafe-fetch-handler/demos/main',
);
