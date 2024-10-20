import { ClientFetcher } from '$lib/http/client.svelte';
import type { SeshConfFromPasskeyReq, SeshConfFromPasskeyRes } from './dtos.common';
import type { RouteId } from './passkey.json/$types';

export const seshConfFromPasskey = new ClientFetcher<RouteId, SeshConfFromPasskeyRes, SeshConfFromPasskeyReq>(
	'POST',
	'/(auth)/account/verify/passkey.json',
);
