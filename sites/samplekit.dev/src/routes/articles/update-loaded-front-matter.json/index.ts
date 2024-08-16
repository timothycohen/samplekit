import { z } from 'zod';
import { articlePathSchema } from '$lib/articles/schema';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export const putReqSchema = z.object({ wordCount: z.number(), articlePath: articlePathSchema });
type PutReq = z.infer<typeof putReqSchema>;

export const updateLoadedFrontMatter = new ClientFetcher<RouteId, Result.Success, PutReq>(
	'PUT',
	'/articles/update-loaded-front-matter.json',
);
