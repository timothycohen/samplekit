import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type { LoginWithPasskeyRes, LoginWithPasskeyReq } from './common';

export const loginWithPasskey = new ClientFetcher<RouteId, LoginWithPasskeyRes, LoginWithPasskeyReq>(
	'POST',
	'/(auth)/(login-signup)/login/verify-mfa/passkey.json',
);
