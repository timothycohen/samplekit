import { ClientFetcher } from '$lib/http/client.svelte';
import type { RegistrationResponseJSON } from '$lib/auth/common';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export type PostReq = { passkeyData: RegistrationResponseJSON };

export const registerMFA_Passkey_WithSeshConfAndPasskey = new ClientFetcher<RouteId, Result.Success, PostReq>(
	'POST',
	'/(auth)/mfa/update/register/passkeys.json',
);
