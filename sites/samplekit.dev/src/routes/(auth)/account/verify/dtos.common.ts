import { authenticationResponseJSONSchema } from '@samplekit/auth/common';
import type { Result } from '$lib/utils/common';
import type { z } from 'zod';

export const seshConfFromPasskeyReqSchema = authenticationResponseJSONSchema;
export type SeshConfFromPasskeyReq = z.infer<typeof seshConfFromPasskeyReqSchema>;
export type SeshConfFromPasskeyRes = Result.Success;
