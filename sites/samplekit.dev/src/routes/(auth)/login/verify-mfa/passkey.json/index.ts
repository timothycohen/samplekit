import { authenticationResponseJSONSchema } from '$lib/auth/common';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { z } from 'zod';

export const postReqSchema = authenticationResponseJSONSchema;
export type PostReq = z.infer<typeof postReqSchema>;
export type PostRes = Result.Success;
export const loginWithPasskey = new ClientFetcher<RouteId, PostRes, PostReq>(
	'POST',
	'/(auth)/login/verify-mfa/passkey.json',
);
