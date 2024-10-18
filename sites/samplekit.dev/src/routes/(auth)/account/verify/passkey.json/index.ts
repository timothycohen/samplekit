import { authenticationResponseJSONSchema } from '@samplekit/auth/common';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { z } from 'zod';

export const postReqSchema = authenticationResponseJSONSchema;
export type PostReq = z.infer<typeof postReqSchema>;
export type PostRes = Result.Success;
export const seshConfFromPasskey = new ClientFetcher<RouteId, PostRes, PostReq>(
	'POST',
	'/(auth)/account/verify/passkey.json',
);
