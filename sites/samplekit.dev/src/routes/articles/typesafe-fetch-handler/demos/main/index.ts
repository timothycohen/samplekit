import { z } from 'zod';
import { ClientFetcher } from '$lib/http/client.svelte';
import { langs } from './lang.service.common';
import type { RouteId } from './$types';

export const postReqSchema = z.object({
	lang: z.enum(langs),
	excludeColor: z.string(),
	simulateDelay: z.boolean().optional(),
});

export type PostReq = z.infer<typeof postReqSchema>;
export type PostRes = { color: string };

export const getRandomColor = new ClientFetcher<RouteId, PostRes, PostReq>(
	'POST',
	'/articles/typesafe-fetch-handler/demos/main',
);
