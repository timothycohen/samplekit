import { z } from 'zod';
import { articlePathSchema } from '$lib/articles/schemas';
import type { Result } from '$lib/utils/common';

export const updateLoadedFrontMatterReqSchema = z.object({ wordCount: z.number(), articlePath: articlePathSchema });
export type UpdateLoadedFrontMatterReq = z.infer<typeof updateLoadedFrontMatterReqSchema>;
export type UpdateLoadedFrontMatterRes = Result.Success;
