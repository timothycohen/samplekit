import { ClientFetcher } from '$lib/http/client.svelte';
import type { AuthenticationResponseJSON } from '$lib/auth/common';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export type PostReq = { passkeyData: AuthenticationResponseJSON };

export const seshConfFromPasskey = new ClientFetcher<RouteId, Result.Success, PostReq>(
	'POST',
	'/(auth)/account/verify/passkey.json',
);
