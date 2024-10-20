import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type { GetPasskeyAuthOptsRes } from './common';

export const getPasskeyAuthOpts = new ClientFetcher<RouteId, GetPasskeyAuthOptsRes>(
	'GET',
	'/(auth)/mfa/passkey/getAuthOptions.json',
);
