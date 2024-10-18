import { z } from 'zod';
import { articlePathSchema } from '$lib/articles/schemas';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export const putReqSchema = z.object({ wordCount: z.number(), articlePath: articlePathSchema });
type PutReq = z.infer<typeof putReqSchema>;
type PutRes = Result.Success;
export const updateLoadedFrontMatter = new ClientFetcher<RouteId, PutRes, PutReq>(
	'PUT',
	'/articles/update-loaded-front-matter.json',
);
