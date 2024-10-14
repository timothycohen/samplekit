import { ClientFetcher } from '$lib/http/client.svelte';
import type { AuthenticationResponseJSON } from '$lib/auth/common';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export type PostReq = { passkeyData: AuthenticationResponseJSON };

export const loginWithPasskey = new ClientFetcher<RouteId, Result.Success, PostReq>(
	'POST',
	'/(auth)/login/verify-mfa/passkey.json',
);
