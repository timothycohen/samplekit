import { authenticationResponseJSONSchema } from '$lib/auth/common';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { z } from 'zod';

export const loginWithPasskeyReqSchema = authenticationResponseJSONSchema;
export type LoginWithPasskeyReq = z.infer<typeof loginWithPasskeyReqSchema>;
export type LoginWithPasskeyRes = Result.Success;
export const loginWithPasskey = new ClientFetcher<RouteId, LoginWithPasskeyRes, LoginWithPasskeyReq>(
	'POST',
	'/(auth)/(login-signup)/login/verify-mfa/passkey.json',
);
