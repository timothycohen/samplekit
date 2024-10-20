import { z } from 'zod';
import { articlePathSchema } from '$lib/articles/schemas';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export const updateLoadedFrontMatterReqSchema = z.object({ wordCount: z.number(), articlePath: articlePathSchema });
export type UpdateLoadedFrontMatterReq = z.infer<typeof updateLoadedFrontMatterReqSchema>;
export type UpdateLoadedFrontMatterRes = Result.Success;
export const updateLoadedFrontMatter = new ClientFetcher<
	RouteId,
	UpdateLoadedFrontMatterRes,
	UpdateLoadedFrontMatterReq
>('PUT', '/articles/update-loaded-front-matter.json');
