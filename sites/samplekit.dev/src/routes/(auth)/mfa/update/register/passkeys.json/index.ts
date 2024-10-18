import { registrationResponseJSONSchema } from '$lib/auth/common';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { z } from 'zod';

export const postReqSchema = registrationResponseJSONSchema;
export type PostReq = z.infer<typeof postReqSchema>;
export type PostRes = Result.Success;
export const registerMFA_Passkey_WithSeshConfAndPasskey = new ClientFetcher<RouteId, PostRes, PostReq>(
	'POST',
	'/(auth)/mfa/update/register/passkeys.json',
);
