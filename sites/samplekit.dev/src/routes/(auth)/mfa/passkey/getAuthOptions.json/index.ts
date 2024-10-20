import { ClientFetcher } from '$lib/http/client.svelte';
import type { PublicKeyCredentialRequestOptionsJSON } from '$lib/auth/common';
import type { RouteId } from './$types';

export type GetPasskeyAuthOptsRes = { opts: PublicKeyCredentialRequestOptionsJSON };
export const getPasskeyAuthOpts = new ClientFetcher<RouteId, GetPasskeyAuthOptsRes>(
	'GET',
	'/(auth)/mfa/passkey/getAuthOptions.json',
);
