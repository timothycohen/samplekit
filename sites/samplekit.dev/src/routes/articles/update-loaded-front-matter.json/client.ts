import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type { UpdateLoadedFrontMatterRes, UpdateLoadedFrontMatterReq } from './common';

export const updateLoadedFrontMatter = new ClientFetcher<
	RouteId,
	UpdateLoadedFrontMatterRes,
	UpdateLoadedFrontMatterReq
>('PUT', '/articles/update-loaded-front-matter.json');
