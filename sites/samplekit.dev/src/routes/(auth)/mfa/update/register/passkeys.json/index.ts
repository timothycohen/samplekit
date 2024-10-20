import { registrationResponseJSONSchema } from '$lib/auth/common';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { z } from 'zod';

export const registerMFA_Passkey_WithSeshConfAndPasskeyReqSchema = registrationResponseJSONSchema;
export type RegisterMFA_Passkey_WithSeshConfAndPasskeyReq = z.infer<
	typeof registerMFA_Passkey_WithSeshConfAndPasskeyReqSchema
>;
export type RegisterMFA_Passkey_WithSeshConfAndPasskeyRes = Result.Success;
export const registerMFA_Passkey_WithSeshConfAndPasskey = new ClientFetcher<
	RouteId,
	RegisterMFA_Passkey_WithSeshConfAndPasskeyRes,
	RegisterMFA_Passkey_WithSeshConfAndPasskeyReq
>('POST', '/(auth)/mfa/update/register/passkeys.json');
