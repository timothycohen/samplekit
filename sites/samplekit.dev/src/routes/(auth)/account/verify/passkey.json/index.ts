import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { startPasskeyAuth } from '@samplekit/auth/client';

export type PostReq = { passkeyData: NonNullable<Awaited<ReturnType<typeof startPasskeyAuth>>['data']> };

export const seshConfFromPasskey = new ClientFetcher<RouteId, Result.Success, PostReq>(
	'POST',
	'/(auth)/account/verify/passkey.json',
);
