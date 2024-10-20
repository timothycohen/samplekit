import { authenticationResponseJSONSchema } from '$lib/auth/common';
import type { Result } from '$lib/utils/common';
import type { z } from 'zod';

export const loginWithPasskeyReqSchema = authenticationResponseJSONSchema;
export type LoginWithPasskeyReq = z.infer<typeof loginWithPasskeyReqSchema>;
export type LoginWithPasskeyRes = Result.Success;
