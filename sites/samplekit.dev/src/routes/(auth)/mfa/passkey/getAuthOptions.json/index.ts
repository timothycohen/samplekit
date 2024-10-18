import { ClientFetcher } from '$lib/http/client.svelte';
import type { PublicKeyCredentialRequestOptionsJSON } from '$lib/auth/common';
import type { RouteId } from './$types';

export type GetRes = { opts: PublicKeyCredentialRequestOptionsJSON };
export const getPasskeyAuthOpts = new ClientFetcher<RouteId, GetRes>('GET', '/(auth)/mfa/passkey/getAuthOptions.json');
