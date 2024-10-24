import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type { GetRandomColorRes, GetRandomColorReq } from './common';

export const getRandomColor = new ClientFetcher<RouteId, GetRandomColorRes, GetRandomColorReq>(
	'POST',
	'/articles/typesafe-fetch-handler/demos/main/demo.json',
);
