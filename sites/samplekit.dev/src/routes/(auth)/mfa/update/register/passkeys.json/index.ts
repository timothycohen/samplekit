import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { startPasskeyReg } from '@samplekit/auth/client';

export type PostReq = { passkeyData: NonNullable<Awaited<ReturnType<typeof startPasskeyReg>>['data']> };

export const registerMFA_Passkey_WithSeshConfAndPasskey = new ClientFetcher<RouteId, Result.Success, PostReq>(
	'POST',
	'/(auth)/mfa/update/register/passkeys.json',
);
