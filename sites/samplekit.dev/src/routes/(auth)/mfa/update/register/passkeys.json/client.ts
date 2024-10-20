import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type {
	RegisterMFA_Passkey_WithSeshConfAndPasskeyReq,
	RegisterMFA_Passkey_WithSeshConfAndPasskeyRes,
} from './common';

export const registerMFA_Passkey_WithSeshConfAndPasskey = new ClientFetcher<
	RouteId,
	RegisterMFA_Passkey_WithSeshConfAndPasskeyRes,
	RegisterMFA_Passkey_WithSeshConfAndPasskeyReq
>('POST', '/(auth)/mfa/update/register/passkeys.json');
